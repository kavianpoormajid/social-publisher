"use client";

import { useDroppable } from "@dnd-kit/react";
import { format } from "date-fns-jalali";

import BoardCard from "./BoardCard";
import { Post } from "@/types/global";

interface BoardDayProps {
  id: string;
  label: string;
  date: Date;
  posts: Post[];
  isMoving: boolean;
}

export default function BoardDay({
  id,
  label,
  date,
  posts,
  isMoving,
}: BoardDayProps) {
  const { ref, isDropTarget } = useDroppable({
    id,
  });

  return (
    <section
      ref={ref}
      className={`
        min-h-125
        rounded-xl
        border
        bg-white
        p-3
        transition-all
        ${isDropTarget ? "border-blue-500 bg-blue-50" : "border-gray-200"}
      `}
    >
      {/* Day Header */}

      <div className="mb-3 border-b border-gray-100 pb-3 text-center">
        <div className="text-sm font-semibold text-gray-800">{label}</div>

        <div className="mt-1 text-xs text-gray-400">
          {format(date, "yyyy/MM/dd")}
        </div>

        <div className="mt-2 text-xs text-gray-400">{posts.length} پست</div>
      </div>

      {/* Posts */}

      <div className="space-y-2">
        {posts.map((post) => (
          <BoardCard key={post.id} post={post} disabled={isMoving} />
        ))}
      </div>
    </section>
  );
}
