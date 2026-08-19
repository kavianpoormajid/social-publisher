import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/posts", () => {
    return HttpResponse.json({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 20,
    });
  }),

  http.patch("*/posts/bulk", () => {
    return HttpResponse.json({
      succeeded: [],
      failed: [],
    });
  }),
];
