"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";

import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

import { usePost } from "@/features/posts/queries/use-post";
import { useUpdatePost } from "@/features/posts/commands/use-update-post";

import { PostFormValues } from "@/features/posts/post-validation";
import { PostEditor } from "@/features/posts/components/PostEditor";
import { toApiDateTime } from "@/utils/date";
import { toUpdatePostPayload } from "@/utils/mappers";
import { appToast } from "@/components/app-toast";
import apiErrorMessage from "@/utils/api-error-message";

interface EditPostPageProps {
  params: Promise<{
    _id: string;
  }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();

  // params یک Promise است
  const { _id } = use(params);

  const { data: post, isLoading, error, refetch } = usePost(_id);

  const updatePost = useUpdatePost();

  async function handleSubmit(values: PostFormValues) {
    try {
      await updatePost.mutateAsync({
        id: _id,
        payload: toUpdatePostPayload(values),
      });

      router.push("/");
    } catch (error) {
      appToast.error(apiErrorMessage(error));
    }
  }

  function handleCancel() {
    router.push("/");
  }

  const initialValues = useMemo<PostFormValues | undefined>(() => {
    if (!post) {
      return undefined;
    }

    return {
      brand: post.brand,
      channel: post.channel,
      content: post.content,
      hashtags: post.hashtags,
      imageUrls: post.imageUrls,
      scheduledAt: post.scheduledAt,
    };
  }, [post]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!post) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-200 p-3 shadow-sm max-w-175 mx-auto">
      <h1 className="mb-6 text-2xl font-semibold">ویرایش پست</h1>

      <PostEditor
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updatePost.isPending}
      />
    </div>
  );
}
