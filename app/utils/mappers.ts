import { PostFormValues } from "@/features/posts/post-validation";
import {
  CreatePostPayload,
  UpdatePostPayload,
} from "@/features/posts/posts.type";
import { toApiDateTime } from "./date";

export function toCreatePostPayload(values: PostFormValues): CreatePostPayload {
  return {
    brand: values.brand,
    channel: values.channel,
    content: values.content,
    hashtags: values.hashtags,
    imageUrls: values.imageUrls,
    scheduledAt: toApiDateTime(values.scheduledAt),
    status: "scheduled",
  };
}

export function toUpdatePostPayload(values: PostFormValues): UpdatePostPayload {
  return {
    brand: values.brand,
    channel: values.channel,
    content: values.content,
    hashtags: values.hashtags,
    imageUrls: values.imageUrls,
    scheduledAt: toApiDateTime(values.scheduledAt),
  };
}
