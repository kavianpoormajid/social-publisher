import { useQuery } from "@tanstack/react-query";

import { postQueryKeys } from "./keys";
import { GetPostsParams } from "../posts.type";
import { getPosts } from "../api/posts-api";

export function usePosts(params: GetPostsParams) {
  return useQuery({
    queryKey: postQueryKeys.list(params),

    queryFn: () => getPosts(params),
  });
}
