import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postQueryKeys } from "../queries/keys";
import { UpdatePostPayload } from "../posts.type";
import { updatePost } from "../api/posts-api";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePostPayload }) =>
      updatePost(id, payload),
    onSuccess: (post) => {
      queryClient.setQueryData(postQueryKeys.detail(post.id), post);

      queryClient.invalidateQueries({
        queryKey: postQueryKeys.lists(),
      });
    },
  });
}
