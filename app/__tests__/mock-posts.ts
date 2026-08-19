import {
  BulkUpdatePostResponse,
  GetPostsResponse,
  UpdatePostResponse,
} from "@/features/posts/posts.type";
import { server } from "./mocks/node";
import { http, HttpResponse } from "msw";

export function mockUsePosts(response: GetPostsResponse) {
  server.use(
    http.get("*/posts", () => {
      return HttpResponse.json(response);
    }),
  );
}

export function mockBulkUpdatePosts(response: BulkUpdatePostResponse) {
  server.use(
    http.patch("*/posts/bulk", () => {
      return HttpResponse.json(response);
    }),
  );
}
export function mockPathUpdatePosts(id: string, response: UpdatePostResponse) {
  server.use(
    http.patch(`*/posts/${id}`, () => {
      return HttpResponse.json(response);
    }),
  );
}
