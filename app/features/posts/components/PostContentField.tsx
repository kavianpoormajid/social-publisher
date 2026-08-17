import { FieldErrors, UseFormRegister } from "react-hook-form";

import { PostFormValues } from "../post-validation";
import { useChannels } from "@/features/channels/queries/use-channels";
import { getEffectiveCharacterCount } from "@/utils/get-effective-character-count";

type PostContentFieldProps = {
  channel: PostFormValues["channel"];
  register: UseFormRegister<PostFormValues>;
  errors: FieldErrors<PostFormValues>;
  value: string;
};

export default function PostContentField({
  channel,
  register,
  errors,
  value,
}: PostContentFieldProps) {
  const { data, isLoading } = useChannels();

  const channelConfig = data?.find((item) => item.id === channel);

  const characterCount = getEffectiveCharacterCount(value ?? "", channel);

  const maxLength = channelConfig?.maxLength ?? 0;

  const isOverLimit =
    !!channelConfig && characterCount > channelConfig.maxLength;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="content"
          className="block text-sm font-semibold text-gray-800"
        >
          متن پست
        </label>

        {channelConfig && (
          <span className="text-xs text-gray-400">{channelConfig.label}</span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        id="content"
        {...register("content")}
        rows={8}
        placeholder="متن پست خود را وارد کنید..."
        className={`
          w-full
          resize-y
          rounded-xl
          border
          bg-white
          px-4
          py-3
          text-sm
          leading-7
          outline-none
          transition
          placeholder:text-gray-400

          ${
            isOverLimit || errors.content
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-50"
              : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          }
        `}
      />

      {/* Rules */}
      {isLoading ? (
        <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
      ) : channelConfig ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span>
              حداکثر {channelConfig.maxLength.toLocaleString("fa-IR")} کاراکتر
            </span>
          </div>

          {/* Character Counter */}
          <span
            className={`
              shrink-0 text-xs font-medium
              ${
                isOverLimit
                  ? "text-red-600"
                  : characterCount > maxLength * 0.9
                    ? "text-amber-600"
                    : "text-gray-400"
              }
            `}
          >
            {characterCount.toLocaleString("fa-IR")} /{" "}
            {maxLength.toLocaleString("fa-IR")}
          </span>
        </div>
      ) : null}

      {/* X specific rule */}
      {channel === "x" && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              محدودیت متن X
            </span>

            <span
              className={
                isOverLimit
                  ? "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                  : "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              }
            >
              {characterCount.toLocaleString("fa-IR")} / ۲۸۰
            </span>
          </div>

          {/* Progress */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${
                characterCount > 280
                  ? "bg-red-500"
                  : characterCount > 240
                    ? "bg-amber-500"
                    : "bg-gray-800"
              }`}
              style={{
                width: `${Math.min((characterCount / 280) * 100, 100)}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs leading-5 text-gray-400">
            هر آدرس اینترنتی در X معادل ۲۳ کاراکتر محاسبه می‌شود.
          </p>
        </div>
      )}

      {/* Validation Error */}
      {errors.content && (
        <p className="text-xs font-medium text-red-600">
          {errors.content.message}
        </p>
      )}
    </div>
  );
}
