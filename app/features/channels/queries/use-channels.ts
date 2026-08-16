import { useQuery } from "@tanstack/react-query";

import { getChannels } from "../api/channels-api";

import { channelQueryKeys } from "./keys";

export function useChannels() {
  return useQuery({
    queryKey: channelQueryKeys.list(),
    queryFn: getChannels,
    staleTime: 5 * 60 * 1000,
  });
}
