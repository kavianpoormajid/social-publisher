"use client";

import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { addDays, parseISO } from "date-fns-jalali";
import { format } from "date-fns-tz";

import { PostsUrlState } from "@/utils/url-state";
import { WeekRange } from "@/utils/hooks/use-week-range";

import BoardDay from "./BoardDay";
import { GetPostsResponse } from "../posts.type";
import { useMovePost } from "../commands/use-move-post";
import WeekNavigation from "./WeekNavigation";
import { useEffect, useState } from "react";
import { BulkResultIdsProps } from "./TableList";
import MultiplePostsOperation, {
  MultiplePostsOperationResult,
} from "./MultiplePostsOperation";
import BulkReportModal from "./BulkReportModal";
import { HistoryType } from "@/utils/hooks/use-commad-history";
import { toApiDateTime } from "@/utils/date";
import { appToast } from "@/components/app-toast";
import apiErrorMessage from "@/utils/api-error-message";
import { useBulkUpdatePosts } from "../commands/use-bulk-update-posts";

interface BoardViewProps {
  data?: GetPostsResponse;

  weekRange: {
    week: WeekRange;
    nextWeek: () => void;
    previousWeek: () => void;
    currentWeek: () => void;
  };
  history: HistoryType;

  updateState: (state: PostsUrlState) => void;
}

const WEEK_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

export default function BoardView({
  data,
  weekRange,
  updateState,
  history,
}: BoardViewProps) {
  const movePost = useMovePost();
  const bulkUpdatePosts = useBulkUpdatePosts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<BulkResultIdsProps[]>([]);
  const [openBulkReportModal, setOpenBulkReportModal] =
    useState<boolean>(false);

  const startDate = parseISO(weekRange.week.startApi);

  const days = WEEK_DAYS.map((label, index) => {
    const date = addDays(startDate, index);

    return {
      id: format(date, "yyyy-MM-dd"),
      label,
      date,
    };
  });

  function handleDragEnd(
    event:
      | {
          canceled: boolean;
          operation: {
            source: {
              id: string | number;
            };
            target?: {
              id: string | number;
            };
          };
        }
      | DragEndEvent,
  ) {
    if (event.canceled) {
      return;
    }

    const source = event.operation.source;
    const target = event.operation.target;

    if (!source || !target) {
      return;
    }

    const postId = String(source.id);

    // این ID میلادی است:
    // 2026-08-21
    const targetDate = String(target.id);

    const post = data?.items.find((item) => item.id === postId);

    if (!post) {
      return;
    }

    const oldDate = parseISO(post.scheduledAt);

    const currentDate = format(oldDate, "yyyy-MM-dd");

    if (currentDate === targetDate) {
      return;
    }

    /*
     * ساعت پست را نگه می‌داریم.
     * 2026-08-20T08:20:00+03:30
     *                    ↑
     *              timezone
     */
    const hours = String(oldDate.getHours()).padStart(2, "0");
    const minutes = String(oldDate.getMinutes()).padStart(2, "0");
    const seconds = String(oldDate.getSeconds()).padStart(2, "0");

    const scheduledAt = toApiDateTime(
      `${targetDate}T` + `${hours}:${minutes}:${seconds}`,
    );

    const beforeData = {
      scheduledAt: post.scheduledAt,
    };
    // movePost.mutate(
    //   {
    //     id: postId,
    //     scheduledAt,
    //   },
    //   {
    //     onSuccess: () => {
    //       history.addHistory({
    //         action: "update",
    //         postId,
    //         afterData: {
    //           scheduledAt,
    //         },
    //         beforeData,
    //       });
    //     },
    //     onError: (error) => {
    //       appToast.error(apiErrorMessage(error));
    //     },
    //   },
    // );

    bulkUpdatePosts.mutate(
      {
        ids: [postId],
        patch: {
          scheduledAt,
        },
      },
      {
        onSuccess: () => {
          history.addHistory({
            action: "update",
            postId,
            afterData: {
              scheduledAt,
            },
            beforeData,
          });
        },
        onError: (error) => {
          appToast.error(apiErrorMessage(error));
        },
      },
    );
  }
  useEffect(() => {
    const nextFrom = weekRange.week.startApi;
    const nextTo = weekRange.week.endApi;

    updateState({
      view: "board",
      from: nextFrom,
      to: nextTo,
    });
  }, [weekRange.week.startApi, weekRange.week.endApi, updateState]);

  function togglePost(id: string) {
    setBulkResult([]);
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function handleOpenBulkReportModal() {
    setOpenBulkReportModal(true);
  }
  function handleCloseBulkReportModal() {
    setBulkResult([]);
    setOpenBulkReportModal(false);
  }
  async function handleOnCompletedBulkUpdate(
    result: MultiplePostsOperationResult,
  ) {
    setSelectedIds([]);
    setBulkResult([
      ...result.failed.map((i) => {
        return {
          id: i.id,
          post: data?.items.find((i) => i.id == i.id),
          bgColor: "bg-red-200",
          reason: i.reason,
          isFailed: true,
        };
      }),
      ...result.successIds.map((i) => {
        return {
          id: i,
          post: data?.items.find((i) => i.id == i.id),
          bgColor: "bg-green-200",
          isFailed: false,
        };
      }),
    ]);
    // open report for bulk
    handleOpenBulkReportModal();
  }
  function handleOnDragStart() {
    setSelectedIds([]);
  }
  return (
    <>
      <BulkReportModal
        isOpen={openBulkReportModal}
        onClose={handleCloseBulkReportModal}
        result={bulkResult}
      />
      <div className="grid grid-cols-1 gap-5">
        <WeekNavigation weekRange={weekRange} />
        <div>
          <div className="flex items-center gap-3 justify-end">
            <span className="text-sm text-gray-600">
              {selectedIds.length} انتخاب شده
            </span>

            <MultiplePostsOperation
              ids={selectedIds}
              onComplete={handleOnCompletedBulkUpdate}
              history={history}
              data={data}
            />
          </div>
        </div>

        <DragDropProvider
          onDragEnd={handleDragEnd}
          onBeforeDragStart={handleOnDragStart}
        >
          <div dir="rtl" className="grid grid-cols-7 gap-3">
            {days.map((day) => {
              const posts =
                data?.items.filter((post) => {
                  const postDate = format(
                    parseISO(post.scheduledAt),
                    "yyyy-MM-dd",
                  );
                  return postDate === day.id;
                }) ?? [];

              return (
                <BoardDay
                  key={day.id}
                  id={day.id}
                  label={day.label}
                  date={day.date}
                  posts={posts}
                  isMoving={movePost.isPending}
                  togglePost={togglePost}
                  selectedIds={selectedIds}
                  bulkResult={bulkResult}
                />
              );
            })}
          </div>
        </DragDropProvider>
      </div>
    </>
  );
}
