import { PostsSort } from "@/features/posts/posts.type";
import {
  Channel,
  POST_STATUSES,
  PostStatus,
  PostViewType,
} from "@/types/global";

export interface PostsUrlState {
  view: PostViewType;
  page?: number;
  pageSize?: number;
  channel?: Channel[];
  status?: PostStatus[];
  brand?: string;
  from: string;
  to: string;
  sort?: PostsSort;
}
const validSorts: readonly PostsSort[] = [
  "scheduledAt:asc",
  "scheduledAt:desc",
  "createdAt:asc",
  "createdAt:desc",
];
const validChannels: readonly Channel[] = [
  "instagram",
  "telegram",
  "linkedin",
  "x",
];

function parseList<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .filter((item): item is T => allowed.includes(item as T));
}

export function parsePostsUrlState(
  searchParams: URLSearchParams,
): PostsUrlState {
  const viewParam = searchParams.get("view");

  const view: PostViewType = viewParam === "table" ? "table" : "board";

  const channel = parseList(searchParams.get("channel"), validChannels);

  const status = parseList(searchParams.get("status"), POST_STATUSES);

  const brand = searchParams.get("brand") ?? "";

  const from = searchParams.get("from") ?? "";

  const to = searchParams.get("to") ?? "";
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page") ?? "")
    : 1;
  const pageSize = searchParams.get("pageSize")
    ? parseInt(searchParams.get("pageSize") ?? "")
    : 20;

  const sortParam = searchParams.get("sort");

  const sort: PostsSort = validSorts.includes(sortParam as PostsSort)
    ? (sortParam as PostsSort)
    : "scheduledAt:asc";

  return {
    view,
    page,
    pageSize,
    channel,
    status,
    brand,
    from,
    to,
    sort,
  };
}

export function createPostsSearchParams(state: PostsUrlState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("view", state.view);
  if (state.channel && state.channel.length > 0) {
    params.set("channel", state.channel.join(","));
  }
  if (state.status && state.status.length > 0) {
    params.set("status", state.status.join(","));
  }
  if (state.page && state.page > 0) {
    params.set("page", state.page.toString());
  }
  if (state.pageSize && state.pageSize > 0) {
    params.set("pageSize", state.pageSize.toString());
  }
  if (state.brand) {
    params.set("brand", state.brand);
  }
  if (state.from) {
    params.set("from", state.from);
  }
  if (state.to) {
    params.set("to", state.to);
  }
  if (state.sort) {
    params.set("sort", state.sort);
  }

  return params;
}
