import { ChannelConfig } from "@/types/global";
import { axiosInstance } from "@/utils/axios";

export async function getChannels(): Promise<ChannelConfig[]> {
  const response = await axiosInstance.get<ChannelConfig[]>("/channels");

  return response.data;
}
