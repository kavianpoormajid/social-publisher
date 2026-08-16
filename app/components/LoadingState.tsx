export default function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

        <span className="text-sm font-medium text-gray-500">
          در حال بارگذاری...
        </span>
      </div>
    </div>
  );
}
