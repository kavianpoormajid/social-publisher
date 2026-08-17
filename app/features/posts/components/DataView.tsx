import type { ReactNode } from "react";
import { GetPostsParams, GetPostsResponse } from "../posts.type";
import BaordView from "./BaordView";
// import TableView from "./TableView";
import { PostsUrlState } from "@/utils/url-state";
import { WeekRange } from "@/utils/hooks/use-week-range";

type BaseDataViewProps = {
  data: GetPostsResponse | undefined;
  emptyState?: ReactNode;
  params: GetPostsParams;
  updateState: (state: PostsUrlState) => void;
};

type BoardViewProps<T> = BaseDataViewProps & {
  type: "board";
  columns: T[];
  weekRange: {
    week: WeekRange;
    nextWeek: () => void;
    previousWeek: () => void;
    currentWeek: () => void;
  };
};

type TableViewProps = BaseDataViewProps & {
  type: "table";
  columns?: never;
  weekRange?: never;
};

export type DataViewProps<T> = BoardViewProps<T> | TableViewProps;

export default function DataView<T>(props: DataViewProps<T>) {
  if (props.type === "board") {
    return (
      <BaordView
        data={props.data}
        weekRange={props.weekRange}
        updateState={props.updateState}
      />
    );
  }

  return null;
  // <TableView
  //   params={props.params}
  //   onParamsChange={props.onParamsChange}
  //   data={props.data}
  // />
}
