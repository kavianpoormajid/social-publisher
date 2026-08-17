"use client";

import { useCreatePost } from "@/features/posts/commands/use-create-post";
import { PostEditor } from "@/features/posts/components/PostEditor";
import { toCreatePostPayload } from "@/utils/mappers";

export default function NewPostPage() {
  const createPost = useCreatePost();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Create post</h1>

      <PostEditor
        isSubmitting={createPost.isPending}
        onSubmit={async (values) => {
          const payload = toCreatePostPayload(values);

          const post = await createPost.mutateAsync(payload);
          console.log(post);
          // router.push(`/`);
        }}
      />
    </main>
  );
}
