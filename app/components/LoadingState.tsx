export default function LoadingState() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/50 bg-white/80 px-6 py-5 shadow-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

        <span className="text-sm font-medium text-gray-600">
          در حال بارگذاری...
        </span>
      </div>
    </div>
  );
}
