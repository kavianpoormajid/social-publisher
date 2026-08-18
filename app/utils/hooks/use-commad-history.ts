import { useUpdatePost } from "@/features/posts/commands/use-update-post";
import { UpdatePostPayload } from "@/features/posts/posts.type";
import { Post } from "@/types/global";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_HISTORY_SIZE = 10;
export type HistoryAction = "update" | "bulk-update";
export type UpdateHistoryItem = {
  action: "update";
  postId: string;
  beforeData: Partial<Post>;
  afterData: Partial<Post>;
};

export type BulkHistoryItem = {
  action: "bulk-update";
  items: {
    postId: string;
    beforeData: Partial<Post>;
    afterData: Partial<Post>;
  }[];
};

export type HistoryItem = UpdateHistoryItem | BulkHistoryItem;
export type HistoryDirection = "undo" | "redo";
export type HistoryResult<TResponse = unknown> = {
  action: HistoryItem;
  direction: HistoryDirection;
  isSuccess: boolean;
  responseData?: TResponse;
  error?: unknown;
  failedIds: string[];
};

export type UseCommandHistoryOptions = {
  onUndo?: (result: HistoryResult) => void | Promise<void>;

  onRedo?: (result: HistoryResult) => void | Promise<void>;
};
export type HistoryType = {
  undoStack: HistoryItem[];
  redoStack: HistoryItem[];
  canUndo: boolean;
  canRedo: boolean;
  addHistory: (item: HistoryItem) => void;
  undo: () => Promise<HistoryResult<unknown> | null>;
  redo: () => Promise<HistoryResult<unknown> | null>;
  clearHistory: () => void;
};

export default function useCommandHistory({
  onUndo,
  onRedo,
}: UseCommandHistoryOptions = {}) {
  const updatePostMutation = useUpdatePost();

  const [undoStack, setUndoStack] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);

  const undoStackRef = useRef<HistoryItem[]>([]);
  const redoStackRef = useRef<HistoryItem[]>([]);
  const isExecutingRef = useRef(false);

  const addHistory = useCallback((item: HistoryItem) => {
    const nextUndoStack = [...undoStackRef.current, item].slice(
      -MAX_HISTORY_SIZE,
    );

    undoStackRef.current = nextUndoStack;

    /**
     * New operation clears redo.
     */
    redoStackRef.current = [];

    setUndoStack(nextUndoStack);
    setRedoStack([]);
  }, []);

  const executeSingleUpdate = useCallback(
    async (postId: string, payload: Partial<Post>) => {
      return updatePostMutation.mutateAsync({
        id: postId,
        payload: payload as UpdatePostPayload,
      });
    },
    [updatePostMutation],
  );

  const executeBulkUpdate = useCallback(
    async (item: BulkHistoryItem, direction: HistoryDirection) => {
      const results: unknown[] = [];

      const failedIds: string[] = [];

      const errors: Record<string, unknown> = {};

      /**
       * Every item is updated individually.
       *
       * But the whole operation remains
       * ONE history step.
       */
      await Promise.all(
        item.items.map(async (historyItem) => {
          const data =
            direction === "undo"
              ? historyItem.beforeData
              : historyItem.afterData;

          try {
            const response = await executeSingleUpdate(
              historyItem.postId,
              data,
            );

            results.push({
              postId: historyItem.postId,

              response,
            });
          } catch (error) {
            failedIds.push(historyItem.postId);

            errors[historyItem.postId] = error;
          }
        }),
      );

      return {
        results,
        failedIds,
        errors,
      };
    },
    [executeSingleUpdate],
  );

  const executeAction = useCallback(
    async (
      item: HistoryItem,
      direction: HistoryDirection,
    ): Promise<HistoryResult> => {
      if (item.action === "update") {
        try {
          const data = direction === "undo" ? item.beforeData : item.afterData;

          const response = await executeSingleUpdate(item.postId, data);

          return {
            action: item,

            direction,

            isSuccess: true,

            responseData: response,

            failedIds: [],
          };
        } catch (error) {
          return {
            action: item,

            direction,

            isSuccess: false,

            error,

            failedIds: [item.postId],
          };
        }
      }
      if (item.action === "bulk-update") {
        try {
          const result = await executeBulkUpdate(item, direction);

          const isSuccess = result.failedIds.length === 0;

          return {
            action: item,

            direction,

            isSuccess,

            responseData: result.results,

            error: isSuccess ? undefined : result.errors,

            failedIds: result.failedIds,
          };
        } catch (error) {
          return {
            action: item,

            direction,

            isSuccess: false,

            error,

            failedIds: item.items.map((item) => item.postId),
          };
        }
      }

      return {
        action: item,
        direction,
        isSuccess: false,
        error: new Error("Unknown history action"),
        failedIds: [],
      };
    },
    [executeBulkUpdate, executeSingleUpdate],
  );

  const undo = useCallback(async () => {
    if (isExecutingRef.current) {
      return null;
    }
    const currentStack = undoStackRef.current;
    if (currentStack.length === 0) {
      return null;
    }
    isExecutingRef.current = true;
    const item = currentStack[currentStack.length - 1];
    try {
      const result = await executeAction(item, "undo");

      /**
       * Move to redo ONLY if
       * the API operation completely succeeds.
       */
      if (result.isSuccess) {
        const nextUndoStack = currentStack.slice(0, -1);

        const nextRedoStack = [...redoStackRef.current, item];

        undoStackRef.current = nextUndoStack;

        redoStackRef.current = nextRedoStack;

        setUndoStack(nextUndoStack);
        setRedoStack(nextRedoStack);
      }

      await onUndo?.(result);

      return result;
    } finally {
      isExecutingRef.current = false;
    }
  }, [executeAction, onUndo]);

  const redo = useCallback(async () => {
    if (isExecutingRef.current) {
      return null;
    }
    const currentStack = redoStackRef.current;
    if (currentStack.length === 0) {
      return null;
    }
    isExecutingRef.current = true;
    const item = currentStack[currentStack.length - 1];

    try {
      const result = await executeAction(item, "redo");

      /**
       * Move to undo ONLY when
       * the API operation succeeds.
       */
      if (result.isSuccess) {
        const nextRedoStack = currentStack.slice(0, -1);

        const nextUndoStack = [...undoStackRef.current, item].slice(
          -MAX_HISTORY_SIZE,
        );

        redoStackRef.current = nextRedoStack;

        undoStackRef.current = nextUndoStack;

        setRedoStack(nextRedoStack);
        setUndoStack(nextUndoStack);
      }

      await onRedo?.(result);

      return result;
    } finally {
      isExecutingRef.current = false;
    }
  }, [executeAction, onRedo]);

  /* =======================================================
   * KEYBOARD
   * ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;
      if (!isModifier) {
        return;
      }
      if (event.key.toLowerCase() !== "z") {
        return;
      }
      event.preventDefault();

      /**
       * Ctrl + Shift + Z
       */
      if (event.shiftKey) {
        void redo();
        return;
      }

      /**
       * Ctrl + Z
       */
      void undo();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  /* =======================================================
   * CLEAR
   * ======================================================= */

  const clearHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];

    setUndoStack([]);
    setRedoStack([]);
  }, []);

  /* =======================================================
   * RETURN
   * ======================================================= */

  return {
    undoStack,
    redoStack,

    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,

    addHistory,

    undo,
    redo,

    clearHistory,
  };
}
