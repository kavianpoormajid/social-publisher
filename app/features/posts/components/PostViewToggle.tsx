import { Squares2X2Icon, TableCellsIcon } from "@heroicons/react/24/outline";

import { POSTS_VIEW_ENUM, PostViewType } from "@/types/global";

export default function PostViewToggle({
  viewType,
  changeView,
}: {
  viewType: PostViewType;
  changeView: (view: PostViewType) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {/* Board */}
      <button
        type="button"
        onClick={() => changeView(POSTS_VIEW_ENUM.BOARD)}
        className={`
          flex items-center gap-2 rounded-lg px-4 py-2
          text-sm font-medium
          transition-all duration-200
          ${
            viewType === POSTS_VIEW_ENUM.BOARD
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }
        `}
      >
        <Squares2X2Icon className="h-4 w-4" />

        <span>نمای برد</span>
      </button>

      {/* Table */}
      <button
        type="button"
        onClick={() => changeView(POSTS_VIEW_ENUM.TABLE)}
        className={`
          flex items-center gap-2 rounded-lg px-4 py-2
          text-sm font-medium
          transition-all duration-200
          ${
            viewType === POSTS_VIEW_ENUM.TABLE
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          }
        `}
      >
        <TableCellsIcon className="h-4 w-4" />

        <span>نمای جدول</span>
      </button>
    </div>
  );
}
