import { GetPostsResponse } from "../posts.type";
import { PostsUrlState } from "@/utils/url-state";

import TableFilters from "./TableFilters";
import TableList from "./TableList";
import { HistoryType } from "@/utils/hooks/use-commad-history";

interface TableViewProps {
  data?: GetPostsResponse;
  currentState: PostsUrlState;
  history: HistoryType;
  updateState: (state: PostsUrlState) => void;
}

export default function TableView({
  data,
  currentState,
  updateState,
  history,
}: TableViewProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <TableFilters currentState={currentState} updateState={updateState} />

      {/* List */}
      <TableList
        data={data}
        currentState={currentState}
        updateState={updateState}
        history={history}
      />
    </div>
  );
}
