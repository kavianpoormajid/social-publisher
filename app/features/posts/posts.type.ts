import { Channel, Post, PostStatus } from "@/types/global";

export type PostsSort =
  | "scheduledAt:asc"
  | "scheduledAt:desc"
  | "createdAt:asc"
  | "createdAt:desc";

export interface GetPostsParams {
  page?: number;
  pageSize?: number;

  /**
   * Repeatable query parameter:
   * ?channel=instagram&channel=x
   */
  channel?: Channel[];

  /**
   * Repeatable query parameter:
   * ?status=draft&status=failed
   */
  status?: PostStatus[];

  brand?: string;

  /**
   * YYYY-MM-DD or full ISO 8601
   */
  from?: string;

  /**
   * YYYY-MM-DD or full ISO 8601
   */
  to?: string;

  sort?: PostsSort;
}

export interface GetPostsResponse {
  data: Post[];
  total: number;
  page: number;
  pageSize: number;
}
export interface UpdatePostRequest {
  brand?: string;
  channel?: Channel;
  content?: string;
  hashtags?: string[];
  imageUrls?: string[];
  scheduledAt?: string;
  status?: PostStatus;
}

export type UpdatePostResponse = Post;

export interface CreatePostRequest {
  brand: string;
  channel: Channel;
  content: string;
  hashtags?: string[];
  imageUrls?: string[];
  scheduledAt: string;
  status: PostStatus;
}

export type CreatePostResponse = Post;

export type BulkFailureReason =
  | "NOT_FOUND"
  | "DAILY_LIMIT_EXCEEDED"
  | "OUTSIDE_ALLOWED_WINDOW";

export interface BulkUpdatePostRequest {
  ids: string[];
  patch: UpdatePostRequest;
}

export interface BulkUpdateSuccess {
  succeeded: string[];
}

export interface BulkUpdateFailure {
  failed: Array<{
    id: string;
    reason: BulkFailureReason;
  }>;
}

export type BulkUpdatePostResponse = BulkUpdateSuccess & BulkUpdateFailure;
