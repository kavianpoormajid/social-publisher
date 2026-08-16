import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postQueryKeys } from "../queries/keys";
import { CreatePostPayload } from "../posts.type";
import { createPost } from "../api/posts-api";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(payload),
    onSuccess: (post) => {
      queryClient.setQueryData(postQueryKeys.detail(post.id), post);

      queryClient.invalidateQueries({
        queryKey: postQueryKeys.lists(),
      });
    },
  });
}
