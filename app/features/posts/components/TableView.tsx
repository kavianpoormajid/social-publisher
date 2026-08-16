import { Post } from "@/types/global";
import { GetPostsParams, GetPostsResponse } from "../posts.type";
import { formatJalaliDateTime } from "@/utils/date";
import { Dispatch, SetStateAction } from "react";

export default function TableView({
  data,
  params,
  onParamsChange,
}: {
  data?: GetPostsResponse;
  params: GetPostsParams;
  onParamsChange: Dispatch<SetStateAction<GetPostsParams>>;
}) {
  return (
    <div>
      {new Date().toISOString()}
      {data?.items.map((item: Post) => {
        return <div key={item.id}>{formatJalaliDateTime(item.createdAt)}</div>;
      })}
    </div>
  );
}
