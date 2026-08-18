import { useCallback, useState } from "react";
import { format, parseISO } from "date-fns-jalali";

import { Channel, CHANNELS, POST_STATUSES, PostStatus } from "@/types/global";

import { PostsUrlState } from "@/utils/url-state";
import { useDebounce } from "@/utils/hooks/use-debounce";

interface TableFiltersProps {
  currentState: PostsUrlState;
  updateState: (state: PostsUrlState) => void;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatJalaliDateTime(value?: string) {
  if (!value) {
    return "";
  }

  try {
    return format(parseISO(value), "yyyy/MM/dd HH:mm");
  } catch {
    return "";
  }
}

function toDateTimeLocalValue(value?: string) {
  if (!value) {
    return "";
  }

  try {
    return value.slice(0, 16);
  } catch {
    return "";
  }
}

function toApiDateTime(value: string): string {
  if (!value) {
    return "";
  }

  /*
   * datetime-local:
   *
   * 2026-08-07T11:00
   *
   * API:
   *
   * 2026-08-07T11:00:00+03:30
   */

  if (value.length === 16) {
    return `${value}:00+03:30`;
  }

  return value;
}

/* -------------------------------------------------------------------------- */
/* Brand Filter                                                               */
/* -------------------------------------------------------------------------- */

/**
 * این کامپوننت جدا شده تا با key بتوانیم زمانی که مقدار brand
 * از URL تغییر کرد، state داخلی را بدون useEffect دوباره initialize کنیم.
 *
 * بنابراین:
 *
 * Refresh
 * Back
 * Forward
 * تغییر URL
 *
 * همگی درست کار می‌کنند.
 */
function BrandFilter({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const [brand, setBrand] = useState(value ?? "");

  const debouncedChange = useDebounce(onChange, 500);

  function handleChange(nextValue: string) {
    setBrand(nextValue);
    if (nextValue.length >= 3 || nextValue.length == 0)
      debouncedChange(nextValue);
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        برند
      </label>

      <div className="flex gap-1 rounded-lg border border-gray-200 px-3 py-2.5">
        <input
          type="text"
          value={brand}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="نام برند"
          className="w-full bg-white text-sm outline-none transition focus:border-gray-400"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function TableFilters({
  currentState,
  updateState,
}: TableFiltersProps) {
  /**
   * updateState را پایدار می‌کنیم تا callbackهای داخلی
   * بی‌دلیل دوباره ساخته نشوند.
   */
  const update = useCallback(
    (changes: Partial<PostsUrlState>) => {
      updateState({
        ...currentState,
        ...changes,
      });
    },
    [currentState, updateState],
  );

  /**
   * تغییر Brand بعد از debounce
   */
  const handleBrandFilter = useCallback(
    (value: string) => {
      updateState({
        ...currentState,
        brand: value.trim() || undefined,
        page: 1,
      });
    },
    [currentState, updateState],
  );

  function handleChannelChange(value: string) {
    const channel = value ? [value as Channel] : undefined;

    update({
      channel,
      page: 1,
    });
  }

  function handleStatusChange(value: string) {
    const status = value ? [value as PostStatus] : undefined;

    update({
      status,
      page: 1,
    });
  }

  function handleSortChange(value: PostsUrlState["sort"]) {
    update({
      sort: value,
      page: 1,
    });
  }

  function handleFromChange(value: string) {
    update({
      from: toApiDateTime(value),
      page: 1,
    });
  }

  function handleToChange(value: string) {
    update({
      to: toApiDateTime(value),
      page: 1,
    });
  }

  function clearFilters() {
    updateState({
      ...currentState,
      page: 1,
      channel: undefined,
      status: undefined,
      brand: undefined,
      sort: "scheduledAt:asc",
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">فیلترها</h2>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          حذف فیلترها
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main Filters                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}

        <BrandFilter
          key={currentState.brand ?? ""}
          value={currentState.brand}
          onChange={handleBrandFilter}
        />

        {/* Channel */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            کانال
          </label>

          <select
            value={currentState.channel?.[0] ?? ""}
            onChange={(event) => handleChannelChange(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">همه کانال‌ها</option>

            {CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            وضعیت
          </label>

          <select
            value={currentState.status?.[0] ?? ""}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">همه وضعیت‌ها</option>

            {POST_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            مرتب‌سازی
          </label>

          <select
            value={currentState.sort ?? "scheduledAt:asc"}
            onChange={(event) =>
              handleSortChange(event.target.value as PostsUrlState["sort"])
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="scheduledAt:asc">زمان انتشار ↑</option>

            <option value="scheduledAt:desc">زمان انتشار ↓</option>

            <option value="createdAt:asc">تاریخ ایجاد ↑</option>

            <option value="createdAt:desc">تاریخ ایجاد ↓</option>
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Date Filters                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* From */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            از تاریخ
          </label>

          <input
            type="datetime-local"
            value={toDateTimeLocalValue(currentState.from)}
            onChange={(event) => handleFromChange(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
          />

          {currentState.from && (
            <p className="mt-1.5 text-xs text-gray-500">
              {formatJalaliDateTime(currentState.from)}
            </p>
          )}
        </div>

        {/* To */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            تا تاریخ
          </label>

          <input
            type="datetime-local"
            value={toDateTimeLocalValue(currentState.to)}
            onChange={(event) => handleToChange(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
          />

          {currentState.to && (
            <p className="mt-1.5 text-xs text-gray-500">
              {formatJalaliDateTime(currentState.to)}
            </p>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Page Size                                                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm text-gray-600">تعداد در صفحه</label>

        <select
          value={currentState.pageSize ?? 10}
          onChange={(event) =>
            update({
              page: 1,
              pageSize: Number(event.target.value),
            })
          }
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
        </select>
      </div>
    </div>
  );
}
