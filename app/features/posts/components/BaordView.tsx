import { Post } from "@/types/global";
import { GetPostsResponse } from "../posts.type";
import { formatJalaliDateTime } from "@/utils/date";
import { Dispatch, SetStateAction } from "react";

export default function BaordView({
  data,
  week,
  onWeekChange,
}: {
  data?: GetPostsResponse;
  week: {
    start: string;
    end: string;
  };
  onWeekChange: Dispatch<
    SetStateAction<{
      start: string;
      end: string;
    }>
  >;
}) {
  return (
    <div>
      {data?.items.map((item: Post) => {
        return <div key={item.id}>{formatJalaliDateTime(item.createdAt)}</div>;
      })}
    </div>
  );
}
