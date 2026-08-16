import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updatePost } from "../api/posts-api";

import { postQueryKeys } from "../queries/keys";
import { GetPostsResponse } from "../posts.type";

type MovePostVariables = {
  id: string;
  scheduledAt: string;
};

type Snapshot = Array<{
  queryKey: readonly unknown[];
  data: GetPostsResponse | undefined;
}>;

export function useMovePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledAt }: MovePostVariables) =>
      updatePost(id, {
        scheduledAt,
      }),

    async onMutate({ id, scheduledAt }) {
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

            items: current.items.map((post) =>
              post.id === id
                ? {
                    ...post,
                    scheduledAt,
                  }
                : post,
            ),
          };
        },
      );

      return {
        snapshots,
      };
    },

    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      for (const snapshot of context.snapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },

    onSuccess: (post) => {
      queryClient.setQueryData(postQueryKeys.detail(post.id), post);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.lists(),
      });
    },
  });
}
