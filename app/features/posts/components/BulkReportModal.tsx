import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { BulkResultIdsProps } from "./TableList";
import { Constants } from "@/utils/constants";

interface BulkReportModalProps {
  result: BulkResultIdsProps[];
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkReportModal({
  result,
  isOpen,
  onClose,
}: BulkReportModalProps) {
  if (!isOpen) return null;

  const successCount = result.filter((item) => !item.isFailed).length;
  const failedCount = result.filter((item) => item.isFailed).length;

  return (
    <div
      data-testid="bulk-report-modal"
      dir="rtl"
      className="fixed inset-0 z-9999 flex justify-end bg-black/20 backdrop-blur-[2px]"
    >
      {/* Modal */}
      <div className="flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              گزارش بروزرسانی
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              نتیجه عملیات گروهی پست‌ها
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 border-b border-gray-100 p-4">
          {/* Success */}
          <div className="rounded-xl border border-green-100 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />

              <span className="text-xs font-medium text-green-700">موفق</span>
            </div>

            <div
              data-testid="bulk-report-success-count"
              className="mt-2 text-xl font-bold text-green-700"
            >
              {successCount}
            </div>
          </div>

          {/* Failed */}
          <div className="rounded-xl border border-red-100 bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600" />

              <span className="text-xs font-medium text-red-700">ناموفق</span>
            </div>

            <div
              data-testid="bulk-report-failure-count"
              className="mt-2 text-xl font-bold text-red-700"
            >
              {failedCount}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {result.map((item) => {
              const failed = item.isFailed;

              return (
                <div
                  key={item.id}
                  className={`
                    rounded-xl border p-4
                    ${
                      failed
                        ? "border-red-100 bg-red-50/50"
                        : "border-green-100 bg-green-50/50"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`
                        flex h-9 w-9 shrink-0 items-center justify-center
                        rounded-lg
                        ${
                          failed
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }
                      `}
                    >
                      {failed ? (
                        <ExclamationCircleIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div
                        className={`
                          text-sm font-semibold
                          ${failed ? "text-red-800" : "text-green-800"}
                        `}
                      >
                        {failed
                          ? `پست ${item.post?.brand ?? ""} بروزرسانی نشد`
                          : `پست ${item.post?.brand ?? ""} با موفقیت بروزرسانی شد`}
                      </div>

                      {item.reason && (
                        <div className="mt-1 text-xs leading-5 text-gray-500">
                          <span className="font-medium text-gray-600">
                            دلیل:
                          </span>{" "}
                          {
                            Constants.BULK_RESULT_REASON_LABEL[
                              item.reason as keyof typeof Constants.BULK_RESULT_REASON_LABEL
                            ]
                          }{" "}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <button
            type="button"
            data-testid="bulk-report-modal-close-button"
            onClick={onClose}
            className="
              w-full
              rounded-xl
              bg-gray-900
              px-4 py-2.5
              text-sm font-semibold text-white
              transition
              hover:bg-gray-800
              active:scale-[0.98]
            "
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
