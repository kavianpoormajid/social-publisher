export const Constants: {
  BASE_URL: string;
  WEEK_DAYS: [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
  ];
  BULK_RESULT_REASON_LABEL: {
    NOT_FOUND: string;
    DAILY_LIMIT_EXCEEDED: string;
    OUTSIDE_ALLOWED_WINDOW: string;
  };
} = {
  BASE_URL: "http://localhost:4000/api",
  WEEK_DAYS: [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
  ] as const,
  BULK_RESULT_REASON_LABEL: {
    NOT_FOUND: "این پست دیگر وجود ندارد یا پیدا نشد.",

    DAILY_LIMIT_EXCEEDED:
      "تعداد پست‌های روزانه این کانال از سقف مجاز بیشتر شده است.",

    OUTSIDE_ALLOWED_WINDOW: "زمان انتشار پست خارج از بازه مجاز این کانال است.",
  },
};
