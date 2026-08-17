import { Channel } from "@/types/global";

const URL_REGEX = /https?:\/\/[^\s]+/g;

export function getEffectiveCharacterCount(
  text: string,
  channel: Channel,
): number {
  if (channel !== "x") {
    return text.length;
  }

  const urls = text.match(URL_REGEX) ?? [];

  return urls.reduce((count, url) => {
    return count - url.length + 23;
  }, text.length);
}
