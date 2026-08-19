import { ChannelConfig, Post } from "@/types/global";
import { ConflictResult, PostConflict } from "./conflict-types";

const MIN_INTERVAL_MINUTES = 30;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

/**
 * Extracts the local time directly from the ISO string.
 *
 * We intentionally do not use Date#getHours() here because
 * the API evaluates channel windows in the +03:30 timezone.
 */
function getLocalTimeInMinutes(scheduledAt: string): number {
  const match = scheduledAt.match(/T(\d{2}):(\d{2})/);

  if (!match) {
    throw new Error(`Invalid ISO datetime: ${scheduledAt}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}

/**
 * Extracts the calendar date directly from the ISO string.
 *
 * This is important because daily limits are evaluated
 * according to the local calendar date (+03:30).
 */
function getDateKey(scheduledAt: string): string {
  const match = scheduledAt.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    throw new Error(`Invalid ISO datetime: ${scheduledAt}`);
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

/**
 * Returns the timestamp represented by an ISO date.
 *
 * The API timestamps contain an explicit timezone offset,
 * so Date#getTime() can safely be used for comparing
 * two absolute moments in time.
 */
function getTimestamp(scheduledAt: string): number {
  const timestamp = new Date(scheduledAt).getTime();

  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid ISO datetime: ${scheduledAt}`);
  }

  return timestamp;
}

/**
 * Checks whether two posts are scheduled less than
 * 30 minutes apart.
 *
 * Exactly 30 minutes is NOT a conflict.
 */
function hasIntervalConflict(first: Post, second: Post): boolean {
  const firstTime = getTimestamp(first.scheduledAt);

  const secondTime = getTimestamp(second.scheduledAt);

  const differenceInMinutes = Math.abs(secondTime - firstTime) / (1000 * 60);

  return differenceInMinutes < MIN_INTERVAL_MINUTES;
}

/**
 * Detects minimum interval conflicts.
 *
 * Only posts belonging to the same channel are compared.
 */
function detectIntervalConflicts(posts: Post[]): PostConflict[] {
  const conflicts: PostConflict[] = [];

  const postsByChannel = new Map<string, Post[]>();

  for (const post of posts) {
    const channelPosts = postsByChannel.get(post.channel) ?? [];

    channelPosts.push(post);

    postsByChannel.set(post.channel, channelPosts);
  }

  for (const channelPosts of postsByChannel.values()) {
    const sortedPosts = [...channelPosts].sort(
      (a, b) => getTimestamp(a.scheduledAt) - getTimestamp(b.scheduledAt),
    );

    for (let index = 0; index < sortedPosts.length; index++) {
      const currentPost = sortedPosts[index];

      for (
        let nextIndex = index + 1;
        nextIndex < sortedPosts.length;
        nextIndex++
      ) {
        const nextPost = sortedPosts[nextIndex];

        /*
         * Because the posts are sorted, once the
         * difference reaches 30 minutes, all later
         * posts will also be at least 30 minutes away.
         */
        const differenceInMinutes =
          (getTimestamp(nextPost.scheduledAt) -
            getTimestamp(currentPost.scheduledAt)) /
          (1000 * 60);

        if (differenceInMinutes >= MIN_INTERVAL_MINUTES) {
          break;
        }

        if (hasIntervalConflict(currentPost, nextPost)) {
          conflicts.push({
            postId: currentPost.id,
            type: "MIN_INTERVAL",
            message:
              "Posts on the same channel must be at least 30 minutes apart.",
            relatedPostIds: [nextPost.id],
          });

          conflicts.push({
            postId: nextPost.id,
            type: "MIN_INTERVAL",
            message:
              "Posts on the same channel must be at least 30 minutes apart.",
            relatedPostIds: [currentPost.id],
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Detects daily limit violations.
 *
 * Example:
 *
 * dailyLimit = 3
 *
 * post 1 -> valid
 * post 2 -> valid
 * post 3 -> valid
 * post 4 -> conflict
 * post 5 -> conflict
 */
function detectDailyLimitConflicts(
  posts: Post[],
  channels: ChannelConfig[],
): PostConflict[] {
  const conflicts: PostConflict[] = [];

  const channelsById = new Map(
    channels.map((channel) => [channel.id, channel]),
  );

  const postsByChannelAndDate = new Map<string, Post[]>();

  for (const post of posts) {
    const dateKey = getDateKey(post.scheduledAt);

    const key = `${post.channel}:${dateKey}`;

    const group = postsByChannelAndDate.get(key) ?? [];

    group.push(post);

    postsByChannelAndDate.set(key, group);
  }

  for (const group of postsByChannelAndDate.values()) {
    if (group.length === 0) {
      continue;
    }

    const channel = group[0].channel;

    const config = channelsById.get(channel);

    if (!config) {
      continue;
    }

    if (group.length <= config.dailyLimit) {
      continue;
    }

    /*
     * Sort deterministically by scheduled time.
     *
     * The posts after dailyLimit are the posts
     * that exceed the channel's daily limit.
     */
    const sortedGroup = [...group].sort(
      (a, b) => getTimestamp(a.scheduledAt) - getTimestamp(b.scheduledAt),
    );

    const violatingPosts = sortedGroup.slice(config.dailyLimit);

    for (const post of violatingPosts) {
      conflicts.push({
        postId: post.id,
        type: "DAILY_LIMIT_EXCEEDED",
        message: `Daily limit of ${config.dailyLimit} posts exceeded.`,
        relatedPostIds: sortedGroup
          .slice(0, config.dailyLimit)
          .map((relatedPost) => relatedPost.id),
      });
    }
  }

  return conflicts;
}

/**
 * Detects posts outside the channel's allowed
 * local-time window.
 *
 * Both boundaries are inclusive:
 *
 * start -> valid
 * end   -> valid
 */
function detectAllowedWindowConflicts(
  posts: Post[],
  channels: ChannelConfig[],
): PostConflict[] {
  const conflicts: PostConflict[] = [];

  const channelsById = new Map(
    channels.map((channel) => [channel.id, channel]),
  );

  for (const post of posts) {
    const config = channelsById.get(post.channel);

    if (!config) {
      continue;
    }

    const currentMinutes = getLocalTimeInMinutes(post.scheduledAt);

    const startMinutes = timeToMinutes(config.allowedWindow.start);

    const endMinutes = timeToMinutes(config.allowedWindow.end);

    const outsideWindow =
      currentMinutes < startMinutes || currentMinutes > endMinutes;

    if (!outsideWindow) {
      continue;
    }

    conflicts.push({
      postId: post.id,
      type: "OUTSIDE_ALLOWED_WINDOW",
      message:
        `Post is outside the allowed window ` +
        `(${config.allowedWindow.start}-${config.allowedWindow.end}).`,
      relatedPostIds: [],
    });
  }

  return conflicts;
}

/**
 * Main conflict detection function.
 *
 * This is a pure domain function:
 *
 * posts + channel configuration
 *             ↓
 *       conflict detection
 *             ↓
 *        ConflictResult
 *
 * It has no dependency on React, Next.js,
 * TanStack Query, Axios or browser APIs.
 */
export function detectConflicts(
  posts: Post[],
  channels: ChannelConfig[],
): ConflictResult {
  const conflicts: PostConflict[] = [
    ...detectIntervalConflicts(posts),

    ...detectDailyLimitConflicts(posts, channels),

    ...detectAllowedWindowConflicts(posts, channels),
  ];

  return {
    conflicts,
    hasConflicts: conflicts.length > 0,
  };
}
