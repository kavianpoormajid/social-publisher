import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePost } from "../api/posts-api";

import { postQueryKeys } from "../queries/keys";
import { GetPostsResponse } from "../posts.type";

type Snapshot = Array<{
  queryKey: readonly unknown[];
  data: GetPostsResponse | undefined;
}>;

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    async onMutate(id) {
      await queryClient.cancelQueries({
        queryKey: postQueryKeys.lists(),
      });

      const snapshots: Snapshot = queryClient
        .getQueriesData<GetPostsResponse>({
          queryKey: postQueryKeys.lists(),
        })
        .map(([queryKey, data]) => ({
          queryKey,
          data,
        }));

      queryClient.setQueriesData<GetPostsResponse>(
        {
          queryKey: postQueryKeys.lists(),
        },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,

            items: current.items.filter((post) => post.id !== id),

            total: Math.max(0, current.total - 1),
          };
        },
      );

      return {
        snapshots,
      };
    },

    onError: (_error, _id, context) => {
      if (!context) {
        return;
      }

      for (const snapshot of context.snapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: postQueryKeys.detail(id),
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.lists(),
      });
    },
  });
}
