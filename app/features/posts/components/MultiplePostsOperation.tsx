"use client";

import { useState } from "react";

import { PostStatus } from "@/types/global";

import { useBulkUpdatePosts } from "../commands/use-bulk-update-posts";
import { BulkUpdatePayload, BulkUpdateResponse } from "../api/posts-api";
import { appToast } from "@/components/app-toast";

interface MultiplePostsOperationProps {
  ids: string[];

  onComplete?: (result: MultiplePostsOperationResult) => void;
  onStart?: () => void;
}

export interface MultiplePostsOperationResult {
  successIds: string[];
  failed: Array<{
    id: string;
    reason: string;
  }>;
}

type PatchState = {
  status?: PostStatus;
  scheduledAt?: string;
};

function normalizeResult(
  result: BulkUpdateResponse,
  ids: string[],
): MultiplePostsOperationResult {
  const failed = result.failed.map((item) => ({
    id: item.id,
    reason: item.reason,
  }));

  const failedIds = new Set(failed.map((item) => item.id));

  const successIds = ids.filter((id) => !failedIds.has(id));

  return {
    successIds,
    failed,
  };
}

export default function MultiplePostsOperation({
  ids,
  onComplete,
  onStart,
}: MultiplePostsOperationProps) {
  const bulkUpdate = useBulkUpdatePosts();

  const [isOpen, setIsOpen] = useState(false);

  const [changeStatus, setChangeStatus] = useState(false);
  const [changeScheduledAt, setChangeScheduledAt] = useState(false);

  const [status, setStatus] = useState<PostStatus>("scheduled");
  const [scheduledAt, setScheduledAt] = useState("");

  function openModal() {
    if (ids.length === 0) {
      return;
    }

    setIsOpen(true);
  }

  function closeModal() {
    if (bulkUpdate.isPending) {
      return;
    }

    setIsOpen(false);
  }

  function buildPatch(): PatchState {
    const patch: PatchState = {};

    if (changeStatus) {
      patch.status = status;
    }

    if (changeScheduledAt) {
      patch.scheduledAt = scheduledAt;
    }

    return patch;
  }

  async function handleSubmit() {
    const patch = buildPatch();

    /*
     * حداقل یکی از فیلترها باید انتخاب شده باشد.
     */
    if (Object.keys(patch).length === 0) {
      appToast.warning("حداقل یک مورد تغییر را انتخاب کنید");
      return;
    }

    onStart?.();

    try {
      const payload: BulkUpdatePayload = {
        ids,
        patch,
      };

      const result = await bulkUpdate.mutateAsync(payload);

      const normalizedResult = normalizeResult(result, ids);

      setIsOpen(false);

      onComplete?.(normalizedResult);
    } catch {
      /*
       * اگر کل request شکست بخورد،
       * useBulkUpdatePosts خودش rollback کامل را انجام می‌دهد.
       *
       * اینجا چیزی را موفق اعلام نمی‌کنیم.
       */
      onComplete?.({
        successIds: [],
        failed: ids.map((id) => ({
          id,
          reason: "خطا در ارتباط با سرور",
        })),
      });

      setIsOpen(false);
    }
  }

  const canSubmit =
    !bulkUpdate.isPending &&
    (changeStatus || changeScheduledAt) &&
    (!changeScheduledAt || scheduledAt.trim() !== "");

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openModal}
        disabled={ids.length === 0 || bulkUpdate.isPending}
        className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        عملیات دسته‌ای
      </button>

      {/* Modal */}
      {isOpen && ids.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  عملیات دسته‌ای
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {ids.length} پست انتخاب شده
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={bulkUpdate.isPending}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-5">
              {/* Status */}
              <div className="rounded-xl border border-gray-200 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={changeStatus}
                    onChange={(event) => setChangeStatus(event.target.checked)}
                    disabled={bulkUpdate.isPending}
                    className="h-4 w-4 rounded"
                  />

                  <span className="text-sm font-semibold text-gray-800">
                    تغییر وضعیت
                  </span>
                </label>

                {changeStatus && (
                  <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      وضعیت جدید
                    </label>

                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as PostStatus)
                      }
                      disabled={bulkUpdate.isPending}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    >
                      <option value="draft">draft</option>
                      <option value="scheduled">scheduled</option>
                      <option value="published">published</option>
                      <option value="failed">failed</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ScheduledAt */}
              <div className="rounded-xl border border-gray-200 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={changeScheduledAt}
                    onChange={(event) =>
                      setChangeScheduledAt(event.target.checked)
                    }
                    disabled={bulkUpdate.isPending}
                    className="h-4 w-4 rounded"
                  />

                  <span className="text-sm font-semibold text-gray-800">
                    تغییر زمان انتشار
                  </span>
                </label>

                {changeScheduledAt && (
                  <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      زمان جدید
                    </label>

                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(event) => setScheduledAt(event.target.value)}
                      disabled={bulkUpdate.isPending}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                )}
              </div>

              {/* Error */}
              {bulkUpdate.isError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
                  عملیات با خطا مواجه شد. تغییرات optimistic rollback شدند.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={bulkUpdate.isPending}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {bulkUpdate.isPending ? "در حال اعمال..." : "اعمال تغییرات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
