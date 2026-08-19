import { GetPostsResponse } from "@/features/posts/posts.type";
import { Post } from "@/types/global";
import { toApiDateTime } from "@/utils/date";

const BASE_DATE = "2026-08-15T09:00:00";

function createPost(index: number): Post {
  const date = new Date(BASE_DATE);

  date.setHours(date.getHours() + index);

  const dateTime = toApiDateTime(date.toISOString());

  return {
    id: `post_${index + 1}`,
    brand: "Kavir",
    channel: "x",
    content: `Post ${index + 1}`,
    hashtags: [],
    imageUrls: [],
    scheduledAt: dateTime,
    status: "published",
    createdAt: dateTime,
    updatedAt: dateTime,
  };
}

function createPosts(count: number): GetPostsResponse {
  const items: Post[] = Array.from({ length: count }, (_, index) =>
    createPost(index),
  );

  return {
    items: items,
    totalCount: items.length,
    page: 1,
    pageSize: 20,
  };
}

const PostResponses = {
  CurrentWeekPosts: createPosts(10),
};
export default PostResponses;
