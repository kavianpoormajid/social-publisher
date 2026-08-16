import { useMutation, useQueryClient } from "@tanstack/react-query";

import { bulkUpdatePosts, type BulkUpdatePayload } from "../api/posts-api";

import { postQueryKeys } from "../queries/keys";
import { GetPostsResponse } from "../posts.type";
import { Post } from "@/types/global";

type SnapshotPost = {
  post: Post;
  queryKey: readonly unknown[];
};

export function useBulkUpdatePosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkUpdatePayload) => bulkUpdatePosts(payload),

    async onMutate(payload) {
      await queryClient.cancelQueries({
        queryKey: postQueryKeys.lists(),
      });

      const snapshots: SnapshotPost[] = [];

      const queries = queryClient.getQueriesData<GetPostsResponse>({
        queryKey: postQueryKeys.lists(),
      });

      for (const [queryKey, data] of queries) {
        if (!data) {
          continue;
        }

        for (const post of data.items) {
          if (payload.ids.includes(post.id)) {
            snapshots.push({
              queryKey,
              post,
            });
          }
        }
      }

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
              payload.ids.includes(post.id)
                ? {
                    ...post,
                    ...payload.patch,
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

    onSuccess: (result, _payload, context) => {
      if (!context) {
        return;
      }

      const failedIds = new Set(result.failed.map((item) => item.id));

      /*
       * فقط پست‌هایی که سرور رد کرده
       * rollback می‌شوند.
       */
      for (const snapshot of context.snapshots) {
        const postId = snapshot.post.id;

        if (!failedIds.has(postId)) {
          continue;
        }

        queryClient.setQueryData<GetPostsResponse>(
          snapshot.queryKey,
          (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,

              items: current.items.map((post) =>
                post.id === postId ? snapshot.post : post,
              ),
            };
          },
        );
      }

      /*
       * جزئیات خطا را بعداً
       * در UI نمایش می‌دهیم.
       */
    },

    onError: (_error, _payload, context) => {
      if (!context) {
        return;
      }

      /*
       * اینجا request اصلاً به نتیجه
       * جزئی نرسیده و کل operation
       * fail شده است.
       *
       * بنابراین کل optimistic update
       * rollback می‌شود.
       */
      for (const snapshot of context.snapshots) {
        queryClient.setQueryData<GetPostsResponse>(
          snapshot.queryKey,
          (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,

              items: current.items.map((post) =>
                post.id === snapshot.post.id ? snapshot.post : post,
              ),
            };
          },
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: postQueryKeys.lists(),
      });
    },
  });
}
