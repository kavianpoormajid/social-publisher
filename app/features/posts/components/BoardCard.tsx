"use client";

import { Post } from "@/types/global";
import { useDraggable } from "@dnd-kit/react";
import { StopCircleIcon } from "@heroicons/react/24/solid";
import { format, parseISO } from "date-fns-jalali";

interface BoardCardProps {
  post: Post;
  disabled?: boolean;
}

export default function BoardCard({ post, disabled = false }: BoardCardProps) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: post.id,
    disabled,
  });

  return (
    <article
      ref={ref}
      className={[
        "cursor-grab rounded-lg border bg-white p-3 shadow-sm",
        "transition",
        "active:cursor-grabbing",
        isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium">
          {post.channel}
        </span>

        <span className="text-xs text-gray-500">
          {format(parseISO(post.scheduledAt), "HH:mm")}
        </span>
      </div>

      <div className="mb-2 line-clamp-3 text-sm text-gray-700">
        {post.content}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{post.brand}</span>

        <button
          ref={handleRef}
          type="button"
          className="cursor-grab rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-100"
          aria-label="جابجایی پست"
        >
          <StopCircleIcon className="size-4" />
        </button>
      </div>
    </article>
  );
}
