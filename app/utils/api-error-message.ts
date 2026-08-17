export default function apiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
          };
        };
      }
    ).response;

    const serverError = response?.data?.error;
    const serverMessage = response?.data?.message;

    if (serverMessage) {
      return serverMessage;
    }

    switch (serverError) {
      case "DAILY_LIMIT_EXCEEDED":
        return "تعداد پست‌های این کانال در این روز به سقف مجاز رسیده است.";

      case "OUTSIDE_ALLOWED_WINDOW":
        return "زمان انتخاب‌شده خارج از بازه مجاز انتشار این کانال است.";

      case "SCHEDULING_CONFLICT":
        return "این پست با پست دیگری در کمتر از ۳۰ دقیقه فاصله دارد.";

      case "NOT_FOUND":
        return "پست موردنظر پیدا نشد.";

      case "VALIDATION_ERROR":
        return "اطلاعات واردشده معتبر نیست.";

      default:
        return "ذخیره پست با خطا مواجه شد.";
    }
  }

  return "ذخیره پست با خطا مواجه شد.";
}
