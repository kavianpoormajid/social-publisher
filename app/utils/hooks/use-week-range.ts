"use client";

import { useState } from "react";
import { addWeeks, startOfWeek, format } from "date-fns-jalali";
import { formatInTimeZone } from "date-fns-tz";

const TIME_ZONE = "Asia/Tehran";

const SERVER_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX";

const DISPLAY_DATE_FORMAT = "yyyy/MM/dd HH:mm";

export interface WeekRange {
  start: Date;
  end: Date;

  startApi: string;
  endApi: string;

  startDisplay: string;
  endDisplay: string;
}

function createWeekRange(start: Date): WeekRange {
  const end = addWeeks(start, 1);

  return {
    start,
    end,

    startApi: formatInTimeZone(start, TIME_ZONE, SERVER_DATE_FORMAT),

    endApi: formatInTimeZone(end, TIME_ZONE, SERVER_DATE_FORMAT),

    startDisplay: format(start, DISPLAY_DATE_FORMAT),

    endDisplay: format(end, DISPLAY_DATE_FORMAT),
  };
}

export function useWeekRange(initialDate?: Date | string) {
  const initial = initialDate ? new Date(initialDate) : new Date();

  const initialWeekStart = startOfWeek(initial, {
    weekStartsOn: 6,
  });

  const [weekStart, setWeekStart] = useState<Date>(initialWeekStart);

  const week = createWeekRange(weekStart);

  const nextWeek = () => {
    setWeekStart((current) => addWeeks(current, 1));
  };

  const previousWeek = () => {
    setWeekStart((current) => addWeeks(current, -1));
  };

  const currentWeek = () => {
    setWeekStart(
      startOfWeek(new Date(), {
        weekStartsOn: 6,
      }),
    );
  };

  return {
    week,

    nextWeek,
    previousWeek,
    currentWeek,
  };
}
