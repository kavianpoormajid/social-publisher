"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import { PostFormValues, postSchema } from "../post-validation";
import { PostEditorProps } from "../posts.type";
import { ChannelFields } from "./channel-fields";
import { zodResolver } from "@hookform/resolvers/zod";

export function PostEditor({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PostEditorProps) {
  const defaultValues = useMemo<PostFormValues>(() => {
    if (initialValues) {
      return initialValues as PostFormValues;
    }

    return {
      channel: "instagram",
      brand: "",
      content: "",
      hashtags: [],
      imageUrls: [],
      scheduledAt: "",
    };
  }, [initialValues]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues,
    mode: "onChange",
  });

  const channel = useWatch({
    control,
    name: "channel",
  });

  const content = useWatch({
    control,
    name: "content",
  });

  const hashtags = useWatch({
    control,
    name: "hashtags",
  });

  const imageUrls = useWatch({
    control,
    name: "imageUrls",
  });

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    reset(initialValues as PostFormValues);
  }, [initialValues, reset]);

  const submit = async (values: PostFormValues) => {
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Channel */}
      <div>
        <label htmlFor="channel" className="mb-2 block text-sm font-medium">
          Channel
        </label>

        <select
          id="channel"
          {...register("channel")}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="instagram">Instagram</option>

          <option value="telegram">Telegram</option>

          <option value="linkedin">LinkedIn</option>

          <option value="x">X</option>
        </select>

        {errors.channel && (
          <p className="mt-1 text-sm text-red-600">{errors.channel.message}</p>
        )}
      </div>

      {/* Brand */}
      <div>
        <label htmlFor="brand" className="mb-2 block text-sm font-medium">
          Brand
        </label>

        <input
          id="brand"
          type="text"
          {...register("brand")}
          className="w-full rounded-lg border px-3 py-2"
        />

        {errors.brand && (
          <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-medium">
          Content
        </label>

        <textarea
          id="content"
          {...register("content")}
          rows={8}
          className="w-full rounded-lg border px-3 py-2"
        />

        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Scheduled At */}
      <div>
        <label htmlFor="scheduledAt" className="mb-2 block text-sm font-medium">
          Scheduled At
        </label>

        <input
          id="scheduledAt"
          type="datetime-local"
          {...register("scheduledAt")}
          className="w-full rounded-lg border px-3 py-2"
        />

        {errors.scheduledAt && (
          <p className="mt-1 text-sm text-red-600">
            {errors.scheduledAt.message}
          </p>
        )}
      </div>

      {/* Hashtags */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="hashtags" className="block text-sm font-medium">
            Hashtags
          </label>

          <span className="text-xs text-gray-500">{hashtags?.length ?? 0}</span>
        </div>

        <input
          id="hashtags"
          type="text"
          placeholder="one, two, three"
          className="w-full rounded-lg border px-3 py-2"
          value={hashtags?.join(", ") ?? ""}
          onChange={(event) => {
            const nextHashtags = event.target.value
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean);

            setValue("hashtags", nextHashtags, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />

        {errors.hashtags && (
          <p className="mt-1 text-sm text-red-600">
            {errors.hashtags.message?.toString()}
          </p>
        )}
      </div>

      {/* Channel-specific fields */}
      <div className="rounded-xl border p-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold">
            {channel === "instagram" && "Instagram settings"}

            {channel === "telegram" && "Telegram settings"}

            {channel === "linkedin" && "LinkedIn settings"}

            {channel === "x" && "X settings"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Settings specific to the selected channel.
          </p>
        </div>

        <ChannelFields
          channel={channel}
          register={register}
          setValue={setValue}
          errors={errors}
          imageUrls={imageUrls ?? []}
          content={content ?? ""}
          hashtags={hashtags ?? []}
        />
      </div>

      {/* Form summary */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Selected channel</span>

          <span className="text-sm font-medium">{channel}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">Images</span>

          <span className="text-sm font-medium">{imageUrls?.length ?? 0}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">Hashtags</span>

          <span className="text-sm font-medium">{hashtags?.length ?? 0}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="rounded-lg bg-black px-4 py-2 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save post"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
