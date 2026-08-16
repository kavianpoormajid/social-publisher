import type { Dispatch, ReactNode, SetStateAction } from "react";
import { GetPostsParams, GetPostsResponse } from "../posts.type";
import BaordView from "./BaordView";
import TableView from "./TableView";

type BaseDataViewProps = {
  data: GetPostsResponse | undefined;
  emptyState?: ReactNode;
  params: GetPostsParams;
  onParamsChange: Dispatch<SetStateAction<GetPostsParams>>;
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
};

type BoardViewProps<T> = BaseDataViewProps & {
  type: "board";
  columns: T[];
};

type TableViewProps = BaseDataViewProps & {
  type: "table";
  columns?: never;
};

export type DataViewProps<T> = BoardViewProps<T> | TableViewProps;

export default function DataView<T>(props: DataViewProps<T>) {
  if (props.type === "board") {
    return (
      <BaordView
        data={props.data}
        week={props.week}
        onWeekChange={props.onWeekChange}
      />
    );
  }

  return (
    <TableView
      params={props.params}
      onParamsChange={props.onParamsChange}
      data={props.data}
    />
  );
}
