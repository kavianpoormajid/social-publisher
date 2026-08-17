"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PostFormValues, postSchema } from "../post-validation";
import { PostEditorProps } from "../posts.type";
import { ChannelFields } from "./ChannelFields";
import apiErrorMessage from "@/utils/api-error-message";
import { appToast } from "@/components/app-toast";
import { HashtagInput } from "./HashtagInput";
import PostContentField from "./PostContentField";

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
    formState: {
      errors,
      //isValid
    },
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
    try {
      await onSubmit(values);
    } catch (error) {
      const msg = apiErrorMessage(error);
      appToast.error(msg);
    }
  };

  const channelLabel = {
    instagram: "اینستاگرام",
    telegram: "تلگرام",
    linkedin: "لینکدین",
    x: "X",
  }[channel];

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Channel */}
      <div className="space-y-2">
        <label
          htmlFor="channel"
          className="block text-sm font-semibold text-gray-800"
        >
          کانال انتشار
        </label>

        <select
          id="channel"
          {...register("channel")}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition "
        >
          <option value="instagram">Instagram</option>
          <option value="telegram">Telegram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="x">X</option>
        </select>

        {errors.channel && (
          <p className="text-xs font-medium text-red-600">
            {errors.channel.message}
          </p>
        )}
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <label
          htmlFor="brand"
          className="block text-sm font-semibold text-gray-800"
        >
          نام برند
        </label>

        <input
          id="brand"
          type="text"
          {...register("brand")}
          placeholder="نام برند را وارد کنید"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />

        {errors.brand && (
          <p className="text-xs font-medium text-red-600">
            {errors.brand.message}
          </p>
        )}
      </div>

      {/* Content */}

      <PostContentField
        channel={channel}
        register={register}
        errors={errors}
        value={content ?? ""}
      />
      {/* Scheduled At */}
      <div className="space-y-2">
        <label
          htmlFor="scheduledAt"
          className="block text-sm font-semibold text-gray-800"
        >
          زمان انتشار
        </label>

        <input
          id="scheduledAt"
          type="datetime-local"
          {...register("scheduledAt")}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />

        {errors.scheduledAt && (
          <p className="text-xs font-medium text-red-600">
            {errors.scheduledAt.message}
          </p>
        )}

        <p className="text-xs text-gray-400">
          تاریخ و ساعت موردنظر برای انتشار پست را انتخاب کنید.
        </p>
      </div>

      {/* Hashtags */}
      <HashtagInput
        hashtags={hashtags ?? []}
        setValue={setValue}
        errors={errors}
        max={
          channel === "instagram"
            ? 30
            : channel === "linkedin"
              ? 5
              : channel === "x"
                ? 4
                : undefined
        }
      />

      {/* Channel-specific fields */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              تنظیمات {channelLabel}
            </h2>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
              {channelLabel}
            </span>
          </div>
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
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-bold text-gray-800">خلاصه پست</h3>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500">کانال انتشار</span>

            <span className="text-sm font-semibold text-gray-900">
              {channelLabel}
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500">تعداد تصاویر</span>

            <span className="text-sm font-semibold text-gray-900">
              {imageUrls?.length ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500">تعداد هشتگ‌ها</span>

            <span className="text-sm font-semibold text-gray-900">
              {hashtags?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
        <button
          type="submit"
          // disabled={isSubmitting || !isValid}
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "در حال ذخیره..." : "ذخیره پست"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}
