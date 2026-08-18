import type { ReactNode } from "react";
import { GetPostsResponse } from "../posts.type";
import BaordView from "./BaordView";
import { PostsUrlState } from "@/utils/url-state";
import { WeekRange } from "@/utils/hooks/use-week-range";
import TableView from "./TableView";
import useCommandHistory from "@/utils/hooks/use-commad-history";

type BaseDataViewProps = {
  data: GetPostsResponse | undefined;
  emptyState?: ReactNode;
  params: PostsUrlState;
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
  const history = useCommandHistory();
  if (props.type === "board") {
    return (
      <BaordView
        data={props.data}
        weekRange={props.weekRange}
        updateState={props.updateState}
        history={history}
      />
    );
  } else
    return (
      <TableView
        currentState={props.params}
        updateState={props.updateState}
        data={props.data}
        history={history}
      />
    );
}
