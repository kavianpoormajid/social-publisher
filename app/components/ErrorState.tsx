import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type ErrorStateProps = {
  onRetry: () => void;
};

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex max-w-sm flex-col items-center rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ExclamationTriangleIcon className="h-6 w-6" />
        </div>

        <h3 className="text-sm font-semibold text-gray-900">
          دریافت اطلاعات ناموفق بود
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          مشکلی در دریافت اطلاعات به وجود آمده است.
          <br />
          لطفاً دوباره تلاش کنید.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="
            mt-4 inline-flex items-center gap-2
            rounded-lg
            bg-gray-900
            px-4 py-2
            text-sm font-medium text-white
            transition
            hover:bg-gray-800
            active:scale-95
          "
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}
