"use client";

import { usePosts } from "@/features/posts/queries/use-posts";
import { POSTS_VIEW_ENUM, PostViewType } from "@/types/global";

import PostViewToggle from "@/features/posts/components/PostViewToggle";

import { useWeekRange } from "@/utils/hooks/use-week-range";

import {
  createPostsSearchParams,
  parsePostsUrlState,
  PostsUrlState,
} from "@/utils/url-state";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import DataView from "@/features/posts/components/DataView";
import { Constants } from "@/utils/constants";
import { useCallback } from "react";

export default function Home() {
  const weekRange = useWeekRange();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = parsePostsUrlState(
    new URLSearchParams(searchParams.toString()),
  );

  const viewType = state.view;

  const updateState = useCallback(
    (nextState: PostsUrlState) => {
      const params = createPostsSearchParams(nextState);
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname],
  );

  function changeView(view: PostViewType) {
    if (view === POSTS_VIEW_ENUM.BOARD) {
      updateState({
        view: POSTS_VIEW_ENUM.BOARD,
        week: state.week,

        channel: [],
        status: [],
        brand: "",

        from: weekRange.week.startApi,
        to: weekRange.week.endApi,

        sort: "scheduledAt:asc",
      });

      return;
    }

    if (view === POSTS_VIEW_ENUM.TABLE) {
      updateState({
        view: POSTS_VIEW_ENUM.TABLE,
        week: state.week,

        channel: state.channel,
        status: state.status,
        brand: state.brand,

        from: state.from,
        to: state.to,

        sort: state.sort,
      });
    }
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
          channel: state.channel || undefined,
          status: state.status || undefined,
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

      <div className="mt-4">
        {viewType === POSTS_VIEW_ENUM.BOARD ? (
          <DataView
            data={data}
            type="board"
            columns={Constants.WEEK_DAYS}
            updateState={updateState}
            weekRange={weekRange}
            params={state}
          />
        ) : (
          <div>Table</div>
        )}
      </div>
    </div>
  );
}
