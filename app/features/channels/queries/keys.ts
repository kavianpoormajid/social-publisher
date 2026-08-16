export const channelQueryKeys = {
  all: ["channels"] as const,

  list: () => [...channelQueryKeys.all, "list"] as const,
};
