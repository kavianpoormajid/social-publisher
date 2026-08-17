import { ChannelConfig } from "@/types/global";
import { axiosInstance } from "@/utils/axios";

export async function getChannels(): Promise<ChannelConfig[]> {
  const response = await axiosInstance.get<{
    channels: ChannelConfig[];
  }>("/channels");

  return response.data.channels;
}
