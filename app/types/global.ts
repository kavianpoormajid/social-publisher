export const CHANNELS = ["instagram", "telegram", "linkedin", "x"] as const;

export type Channel = (typeof CHANNELS)[number];

export const POST_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "failed",
] as const;

export type PostViewType = "board" | "table";
export enum POSTS_VIEW_ENUM {
  TABLE = "table",
  BOARD = "board",
}
export type PostStatus = (typeof POST_STATUSES)[number];

export interface Post {
  id: string;
  brand: string;
  channel: Channel;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  scheduledAt: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AllowedWindow {
  start: string;
  end: string;
}

export interface ChannelConfig {
  id: Channel;
  label: string;
  dailyLimit: number;
  allowedWindow: AllowedWindow;
  maxLength: number;
  maxHashtags: number;
  requiresImage: boolean;
  maxImages: number;
}
export interface ResetResponse {
  ok: true;
}
export type ApiErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "TIMEOUT";

export interface ApiError {
  error: ApiErrorCode;
  fields?: Record<string, string>;
}
export type SimulateError = "500" | "422" | "timeout";

export interface ApiRequestOptions {
  simulateError?: SimulateError;
}
