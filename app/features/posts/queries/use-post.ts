import { useQuery } from "@tanstack/react-query";

import { postQueryKeys } from "./keys";
import { getPost } from "../api/posts-api";

export function usePost(id: string) {
  return useQuery({
    queryKey: postQueryKeys.detail(id),
    queryFn: () => getPost(id),
    enabled: Boolean(id),
  });
}
