import { Channel, Post, PostStatus, PostViewType } from "@/types/global";
export interface PostsUrlState {
  view: PostViewType;
  week: string;
  channel: Channel[];
  status: PostStatus[];
  brand: string;
  from?: string;
  to?: string;
  sort: PostsSort;
}
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
export interface CreatePostPayload {
  brand: string;
  channel: Channel;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  scheduledAt: string;
  status: PostStatus;
}

export type UpdatePostPayload = Partial<CreatePostPayload>;

export interface GetPostsResponse {
  items: Post[];
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

export interface PostsViewBaseProps {
  data: GetPostsResponse;
}

export interface PostsTableColumn {
  key: keyof Post;
  label: string;
  sortable?: boolean;
}
export interface PostsBoardProps extends PostsViewBaseProps {
  mode: "board";

  week: {
    start: string;
    end: string;
  };

  onWeekChange: (week: { start: string; end: string }) => void;

  onPostMove: (postId: string, scheduledAt: string) => void;
}
export interface PostsTableProps extends PostsViewBaseProps {
  mode: "table";

  columns: PostsTableColumn[];

  page: number;
  pageSize: number;

  sortBy?: keyof Post;
  sortDirection?: "asc" | "desc";

  filters?: PostsTableFilters;

  onPageChange: (page: number) => void;

  onPageSizeChange: (pageSize: number) => void;

  onSortChange: (sortBy: keyof Post, direction: "asc" | "desc") => void;

  onFilterChange: (filters: PostsTableFilters) => void;
}
export interface PostsTableFilters {
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
export type PostsViewProps = PostsBoardProps | PostsTableProps;
