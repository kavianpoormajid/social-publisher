import { GetPostsParams } from "../posts.type";

export const postQueryKeys = {
  all: ["posts"] as const,

  lists: () => [...postQueryKeys.all, "list"] as const,

  list: (params: GetPostsParams) => [...postQueryKeys.lists(), params] as const,

  details: () => [...postQueryKeys.all, "detail"] as const,

  detail: (id: string) => [...postQueryKeys.details(), id] as const,
};
