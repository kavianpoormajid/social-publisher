import { describe, expect, it } from "vitest";

import { detectConflicts } from "../logics/conflict-engine";
import { ChannelConfig, Post } from "@/types/global";

const instagramConfig: ChannelConfig = {
  id: "instagram",
  label: "Instagram",
  dailyLimit: 3,
  allowedWindow: {
    start: "08:00",
    end: "23:00",
  },
  maxLength: 2200,
  maxHashtags: 30,
  requiresImage: true,
  maxImages: 10,
};

function createPost(
  id: string,
  scheduledAt: string,
  channel: Post["channel"] = "instagram",
): Post {
  return {
    id,
    brand: "Nova",
    channel,
    content: "Test content",
    hashtags: [],
    imageUrls: ["https://example.com/image.jpg"],
    scheduledAt,
    status: "scheduled",
    createdAt: scheduledAt,
    updatedAt: scheduledAt,
  };
}

function getConflictTypes(posts: Post[], channels: ChannelConfig[]) {
  return detectConflicts(posts, channels).conflicts;
}

describe("Conflict Engine Logics", () => {
  describe("minimum interval rule", () => {
    it("detects conflict when posts are 29 minutes apart", () => {
      const posts = [
        createPost("post-1", "2026-08-20T10:00:00+03:30"),
        createPost("post-2", "2026-08-20T10:29:00+03:30"),
      ];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.filter((conflict) => conflict.type === "MIN_INTERVAL"),
      ).toHaveLength(2);
    });

    it("does not detect conflict when posts are exactly 30 minutes apart", () => {
      const posts = [
        createPost("post-1", "2026-08-20T10:00:00+03:30"),
        createPost("post-2", "2026-08-20T10:30:00+03:30"),
      ];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some((conflict) => conflict.type === "MIN_INTERVAL"),
      ).toBe(false);
    });

    it("does not detect conflict when posts are 31 minutes apart", () => {
      const posts = [
        createPost("post-1", "2026-08-20T10:00:00+03:30"),
        createPost("post-2", "2026-08-20T10:31:00+03:30"),
      ];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some((conflict) => conflict.type === "MIN_INTERVAL"),
      ).toBe(false);
    });

    it("does not compare posts from different channels", () => {
      const posts = [
        createPost("post-1", "2026-08-20T10:00:00+03:30", "instagram"),
        createPost("post-2", "2026-08-20T10:01:00+03:30", "telegram"),
      ];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some((conflict) => conflict.type === "MIN_INTERVAL"),
      ).toBe(false);
    });
  });

  describe("daily limit rule", () => {
    it("allows exactly the configured daily limit", () => {
      const posts = [
        createPost("post-1", "2026-08-20T10:00:00+03:30"),
        createPost("post-2", "2026-08-20T11:00:00+03:30"),
        createPost("post-3", "2026-08-20T12:00:00+03:30"),
      ];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some((conflict) => conflict.type === "DAILY_LIMIT_EXCEEDED"),
      ).toBe(false);
    });

    it("detects the post that exceeds the daily limit", () => {
      const posts = [
        createPost("post-1", "2026-08-20T10:00:00+03:30"),
        createPost("post-2", "2026-08-20T11:00:00+03:30"),
        createPost("post-3", "2026-08-20T12:00:00+03:30"),
        createPost("post-4", "2026-08-20T13:00:00+03:30"),
      ];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      const dailyLimitConflicts = conflicts.filter(
        (conflict) => conflict.type === "DAILY_LIMIT_EXCEEDED",
      );

      expect(dailyLimitConflicts).toHaveLength(1);

      expect(dailyLimitConflicts[0].postId).toBe("post-4");
    });

    it("detects every post beyond the daily limit", () => {
      const posts = [
        createPost("post-1", "2026-08-20T10:00:00+03:30"),
        createPost("post-2", "2026-08-20T11:00:00+03:30"),
        createPost("post-3", "2026-08-20T12:00:00+03:30"),
        createPost("post-4", "2026-08-20T13:00:00+03:30"),
        createPost("post-5", "2026-08-20T14:00:00+03:30"),
      ];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      const dailyLimitConflicts = conflicts.filter(
        (conflict) => conflict.type === "DAILY_LIMIT_EXCEEDED",
      );

      expect(dailyLimitConflicts).toHaveLength(2);

      expect(dailyLimitConflicts.map((conflict) => conflict.postId)).toEqual([
        "post-4",
        "post-5",
      ]);
    });

    it("evaluates daily limits separately for each date", () => {
      const posts = [
        createPost("post-1", "2026-08-20T10:00:00+03:30"),
        createPost("post-2", "2026-08-20T11:00:00+03:30"),
        createPost("post-3", "2026-08-20T12:00:00+03:30"),

        createPost("post-4", "2026-08-21T10:00:00+03:30"),
        createPost("post-5", "2026-08-21T11:00:00+03:30"),
      ];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some((conflict) => conflict.type === "DAILY_LIMIT_EXCEEDED"),
      ).toBe(false);
    });
  });

  describe("allowed time window rule", () => {
    it("allows a post exactly at the start of the window", () => {
      const posts = [createPost("post-1", "2026-08-20T08:00:00+03:30")];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some(
          (conflict) => conflict.type === "OUTSIDE_ALLOWED_WINDOW",
        ),
      ).toBe(false);
    });

    it("allows a post exactly at the end of the window", () => {
      const posts = [createPost("post-1", "2026-08-20T23:00:00+03:30")];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some(
          (conflict) => conflict.type === "OUTSIDE_ALLOWED_WINDOW",
        ),
      ).toBe(false);
    });

    it("detects a post before the allowed window", () => {
      const posts = [createPost("post-1", "2026-08-20T07:59:00+03:30")];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some(
          (conflict) => conflict.type === "OUTSIDE_ALLOWED_WINDOW",
        ),
      ).toBe(true);
    });

    it("detects a post after the allowed window", () => {
      const posts = [createPost("post-1", "2026-08-20T23:01:00+03:30")];

      const conflicts = getConflictTypes(posts, [instagramConfig]);

      expect(
        conflicts.some(
          (conflict) => conflict.type === "OUTSIDE_ALLOWED_WINDOW",
        ),
      ).toBe(true);
    });
  });

  describe("combined rules", () => {
    it("can report multiple conflict types for the same post", () => {
      const config: ChannelConfig = {
        ...instagramConfig,
        dailyLimit: 1,
      };

      const posts = [
        createPost("post-1", "2026-08-20T07:00:00+03:30"),
        createPost("post-2", "2026-08-20T07:15:00+03:30"),
      ];

      const conflicts = detectConflicts(posts, [config]);

      const post2Conflicts = conflicts.conflicts.filter(
        (conflict) => conflict.postId === "post-2",
      );

      expect(
        post2Conflicts.some((conflict) => conflict.type === "MIN_INTERVAL"),
      ).toBe(true);

      expect(
        post2Conflicts.some(
          (conflict) => conflict.type === "DAILY_LIMIT_EXCEEDED",
        ),
      ).toBe(true);

      expect(
        post2Conflicts.some(
          (conflict) => conflict.type === "OUTSIDE_ALLOWED_WINDOW",
        ),
      ).toBe(true);
    });
  });
});
