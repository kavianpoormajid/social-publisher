import { WeekRange } from "@/utils/hooks/use-week-range";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export default function WeekNavigation({
  weekRange,
}: {
  weekRange: {
    week: WeekRange;
    nextWeek: () => void;
    previousWeek: () => void;
    currentWeek: () => void;
  };
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      {/* Previous Week */}
      <button
        type="button"
        data-testid="previous-week-button"
        onClick={() => weekRange.previousWeek()}
        aria-label="هفته قبل"
        className="
        flex h-10 w-10 items-center justify-center
        rounded-lg
        border border-gray-200
        text-gray-600
        transition-all duration-150
        hover:bg-gray-50
        hover:text-gray-900
        active:scale-95
      "
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>

      {/* Week Range */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-medium text-gray-400">بازه هفته</span>

        <div className="mt-0.5 text-sm font-semibold text-gray-800">
          {weekRange.week.startDisplay}
          <span className="mx-2 text-gray-300">تا</span>
          {weekRange.week.endDisplay}
        </div>
      </div>

      {/* Next Week */}
      <button
        type="button"
        data-testid="next-week-button"
        onClick={() => weekRange.nextWeek()}
        aria-label="هفته بعد"
        className="
        flex h-10 w-10 items-center justify-center
        rounded-lg
        border border-gray-200
        text-gray-600
        transition-all duration-150
        hover:bg-gray-50
        hover:text-gray-900
        active:scale-95
      "
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
