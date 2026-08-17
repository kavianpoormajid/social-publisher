import { PostsSort } from "@/features/posts/posts.type";
import {
  Channel,
  POST_STATUSES,
  PostStatus,
  PostViewType,
} from "@/types/global";

export interface PostsUrlState {
  view: PostViewType;
  week?: string;
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

  const week = searchParams.get("week") ?? getCurrentWeek();

  const channel = parseList(searchParams.get("channel"), validChannels);

  const status = parseList(searchParams.get("status"), POST_STATUSES);

  const brand = searchParams.get("brand") ?? "";

  const from = searchParams.get("from") ?? "";

  const to = searchParams.get("to") ?? "undefined";

  const sortParam = searchParams.get("sort");

  const sort: PostsSort = validSorts.includes(sortParam as PostsSort)
    ? (sortParam as PostsSort)
    : "scheduledAt:asc";

  return {
    view,
    week,
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

function getCurrentWeek(): string {
  const now = new Date();

  const day = now.getDay();

  // JavaScript:
  // Sunday = 0
  // Monday = 1
  // ...
  // Saturday = 6

  const daysSinceSaturday = day === 0 ? 1 : day === 6 ? 0 : day + 1;

  const saturday = new Date(now);

  saturday.setDate(now.getDate() - daysSinceSaturday);

  return formatGregorianDate(saturday);
}

function formatGregorianDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
