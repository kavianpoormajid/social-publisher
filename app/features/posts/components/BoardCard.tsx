"use client";

import { Post } from "@/types/global";
import { useDraggable } from "@dnd-kit/react";
import { StopCircleIcon } from "@heroicons/react/24/solid";
import { format, parseISO } from "date-fns-jalali";
import { BulkResultIdsProps } from "./TableList";

interface BoardCardProps {
  post: Post;
  disabled?: boolean;
  togglePost: (id: string) => void;
  selected: boolean;
  itemBulkExist: BulkResultIdsProps | undefined;
}

export default function BoardCard({
  togglePost,
  post,
  disabled = false,
  selected,
  itemBulkExist,
}: BoardCardProps) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: post.id,
    disabled,
  });

  return (
    <article
      ref={ref}
      className={[
        itemBulkExist
          ? itemBulkExist.bgColor
          : selected
            ? "bg-gray-200 border"
            : "bg-gray-50",
        " rounded-lg  p-3 shadow-sm",
        "transition-all duration-300",
        isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md",
      ].join(" ")}
    >
      <div className="mb-1 flex items-center justify-between">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => togglePost(post.id)}
          className="h-4 w-4 rounded"
        />
      </div>
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
      <div className="mb-2 flex justify-end">
        <span className="font-light text-[10px] rounded-full p-1 w-auto px-3 text-end bg-gray-800 text-gray-50">
          {post.status}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{post.brand}</span>

        <button
          ref={handleRef}
          type="button"
          className="cursor-grab active:cursor-grabbing rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-100"
          aria-label="جابجایی پست"
        >
          <StopCircleIcon className="size-4" />
        </button>
      </div>
    </article>
  );
}
