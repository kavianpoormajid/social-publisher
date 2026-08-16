"use client";

import { usePosts } from "@/features/posts/queries/use-posts";
import { POSTS_VIEW_ENUM, PostViewType } from "@/types/global";

import PostViewToggle from "@/features/posts/components/PostViewToggle";

import { useWeekRange } from "@/utils/hooks/use-week-range";

import { createPostsSearchParams, parsePostsUrlState } from "@/utils/url-state";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import WeekNavigation from "@/features/posts/components/WeekNavigation";

export default function Home() {
  const weekRange = useWeekRange();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = parsePostsUrlState(
    new URLSearchParams(searchParams.toString()),
  );

  const viewType = state.view;

  function updateState(nextState: typeof state) {
    const params = createPostsSearchParams(nextState);

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function changeView(view: PostViewType) {
    if (view === POSTS_VIEW_ENUM.BOARD) {
      updateState({
        ...state,
        view: POSTS_VIEW_ENUM.BOARD,
        brand: "",
      });

      return;
    }

    updateState({
      ...state,
      view: POSTS_VIEW_ENUM.TABLE,
    });
  }

  const postsParams =
    viewType === POSTS_VIEW_ENUM.BOARD
      ? {
          page: 1,
          pageSize: 100,
          from: weekRange.week.startApi,
          to: weekRange.week.endApi,
        }
      : {
          page: 1,
          pageSize: 100,
          channel: state.channel.length > 0 ? state.channel : undefined,
          status: state.status.length > 0 ? state.status : undefined,
          brand: state.brand || undefined,
          from: weekRange.week.startApi,
          to: weekRange.week.endApi,
          sort: state.sort,
        };

  const { data, isLoading, error, refetch } = usePosts(postsParams);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
      <div className="mb-3 flex justify-center">
        <PostViewToggle viewType={state.view} changeView={changeView} />
      </div>

      <WeekNavigation weekRange={weekRange} />

      <div className="mt-4">
        {viewType === POSTS_VIEW_ENUM.BOARD ? (
          <div>Board</div>
        ) : (
          <div>Table</div>
        )}
      </div>
    </div>
  );
}
