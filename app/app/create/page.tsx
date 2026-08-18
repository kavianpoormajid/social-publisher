"use client";

import { useCreatePost } from "@/features/posts/commands/use-create-post";
import { PostEditor } from "@/features/posts/components/PostEditor";
import { toCreatePostPayload } from "@/utils/mappers";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const createPost = useCreatePost();

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-200 p-3 shadow-sm max-w-175 mx-auto">
      <h1 className="mb-6 text-2xl font-semibold">پست جدید</h1>

      <PostEditor
        isSubmitting={createPost.isPending}
        onSubmit={async (values) => {
          const payload = toCreatePostPayload(values);
          await createPost.mutateAsync(payload);
          router.push("/");
        }}
      />
    </div>
  );
}
