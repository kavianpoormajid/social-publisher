import { Post } from "@/types/global";
import { axiosInstance } from "@/utils/axios";
import {
  CreatePostPayload,
  GetPostsParams,
  GetPostsResponse,
  UpdatePostPayload,
} from "../posts.type";

export interface BulkUpdatePayload {
  ids: string[];
  patch: UpdatePostPayload;
}

export interface BulkUpdateResponse {
  succeeded: string[];

  failed: Array<{
    id: string;
    reason: string;
  }>;
}

export async function getPosts(
  params: GetPostsParams,
): Promise<GetPostsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  params.channel?.forEach((channel) => {
    searchParams.append("channel", channel);
  });

  params.status?.forEach((status) => {
    searchParams.append("status", status);
  });

  if (params.brand) {
    searchParams.set("brand", params.brand);
  }

  if (params.from) {
    searchParams.set("from", params.from);
  }

  if (params.to) {
    searchParams.set("to", params.to);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  const queryString = searchParams.toString();

  const response = await axiosInstance.get<GetPostsResponse>(
    `/posts${queryString ? `?${queryString}` : ""}`,
  );

  return response.data;
}

export async function getPost(id: string): Promise<Post> {
  const response = await axiosInstance.get<Post>(`/posts/${id}`);

  return response.data;
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const response = await axiosInstance.post<Post>("/posts", payload);

  return response.data;
}

export async function updatePost(
  id: string,
  payload: UpdatePostPayload,
): Promise<Post> {
  const response = await axiosInstance.patch<Post>(`/posts/${id}`, payload);

  return response.data;
}

export async function bulkUpdatePosts(
  payload: BulkUpdatePayload,
): Promise<BulkUpdateResponse> {
  const response = await axiosInstance.patch<BulkUpdateResponse>(
    "/posts/bulk",
    payload,
  );

  return response.data;
}

export async function deletePost(id: string): Promise<void> {
  await axiosInstance.delete(`/posts/${id}`);
}
