"use client";

import { useEffect, useState } from "react";

import { Post } from "@/types/global";
import { GetPostsResponse } from "../posts.type";
import { PostsUrlState } from "@/utils/url-state";
import { formatJalaliDateTime } from "@/utils/date";
import Link from "next/link";
import MultiplePostsOperation, {
  MultiplePostsOperationResult,
} from "./MultiplePostsOperation";
import BulkReportModal from "./BulkReportModal";

interface TableListProps {
  data?: GetPostsResponse;
  currentState: PostsUrlState;
  updateState: (state: PostsUrlState) => void;
}
export interface BulkResultIdsProps {
  id: string;
  post: Post | undefined;
  bgColor: string;
  reason?: string;
  isFailed: boolean;
}

export default function TableList({
  data,
  updateState,
  currentState,
}: TableListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<BulkResultIdsProps[]>([]);
  const [openBulkReportModal, setOpenBulkReportModal] =
    useState<boolean>(false);

  function handleOpenBulkReportModal() {
    setOpenBulkReportModal(true);
  }
  function handleCloseBulkReportModal() {
    setBulkResult([]);
    setOpenBulkReportModal(false);
  }
  const items = data?.items ?? [];

  /*
   * Pagination
   */
  const page = data?.page ?? currentState.page ?? 1;
  const pageSize = data?.pageSize ?? currentState.pageSize ?? 20;
  const totalCount = data?.totalCount ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  function togglePost(id: string) {
    setBulkResult([]);
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function toggleAll() {
    setBulkResult([]);
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(items.map((item) => item.id));
  }

  function update(changes: Partial<PostsUrlState>) {
    updateState({
      ...currentState,
      ...changes,
    });
  }

  function goToPage(nextPage: number) {
    /*
     * هیچ‌وقت اجازه نمی‌دهیم page
     * خارج از محدوده‌ی واقعی pagination برود.
     */
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);

    if (safePage === page) {
      return;
    }

    // با عوض شدن صفحه، انتخاب‌های صفحه قبل پاک می‌شوند.
    setSelectedIds([]);

    update({
      page: safePage,
    });
  }
  async function handleOnCompletedBulkUpdate(
    result: MultiplePostsOperationResult,
  ) {
    console.log("Bulk operation completed:", result);
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
    setSelectedIds([]);
    // open report for bulk
    handleOpenBulkReportModal();
  }

  return (
    <>
      {/* BulkReportModal */}
      <BulkReportModal
        isOpen={openBulkReportModal}
        onClose={handleCloseBulkReportModal}
        result={bulkResult}
      />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-500">{totalCount} پست</div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedIds.length} انتخاب شده
              </span>

              <MultiplePostsOperation
                ids={selectedIds}
                onComplete={handleOnCompletedBulkUpdate}
                onStart={() => {
                  // console.log("Bulk operation started");
                }}
              />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-right">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded"
                  />
                </th>

                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  برند
                </th>

                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  کانال
                </th>

                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  محتوا
                </th>

                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  زمان انتشار
                </th>

                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  وضعیت
                </th>

                <th className="px-4 py-3 text-sm font-medium text-gray-600">
                  ایجاد شده
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {items.map((item: Post) => {
                const selected = selectedIds.includes(item.id);
                const itemBulkExist = bulkResult.find(
                  (i: BulkResultIdsProps) => i.id == item.id,
                );
                return (
                  <tr
                    key={item.id}
                    className={`
                    transition-all duration-300
                    ${itemBulkExist ? itemBulkExist.bgColor : selected ? "bg-gray-50" : "hover:bg-gray-50"}
                    `}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => togglePost(item.id)}
                        className="h-4 w-4 rounded"
                      />
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.brand}
                    </td>

                    {/* Channel */}
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                        {item.channel}
                      </span>
                    </td>

                    {/* Content */}
                    <td className="max-w-75 px-4 py-3">
                      <p className="truncate text-sm text-gray-700">
                        {item.content}
                      </p>
                    </td>

                    {/* Scheduled */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatJalaliDateTime(item.scheduledAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-sm">{item.status}</td>

                    {/* Created */}
                    <td className="grid grid-cols-1 px-4 py-3 text-sm text-gray-500">
                      <Link
                        href={`/edit/${item.id}`}
                        type="button"
                        className="text-center mx-auto rounded-lg bg-blue-900 px-3 py-2 text-sm text-white"
                      >
                        ویرایش
                      </Link>

                      <div className="text-center">
                        ایجاد در تاریخ:
                        {formatJalaliDateTime(item.createdAt)}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    پستی پیدا نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-500">
            صفحه {page} از {totalPages}
          </div>

          <div className="flex gap-2">
            {/* Previous */}
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={!hasPreviousPage}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              قبلی
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={!hasNextPage}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
