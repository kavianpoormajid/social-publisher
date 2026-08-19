"use client";

import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";

import { PostFormValues } from "../post-validation";

interface ChannelFieldsProps {
  channel: PostFormValues["channel"];
  register: UseFormRegister<PostFormValues>;
  setValue: UseFormSetValue<PostFormValues>;
  errors: FieldErrors<PostFormValues>;
  imageUrls: string[];
  content: string;
  hashtags: string[];
}

/**
 * فقط URLهای واقعی و غیرخالی را تصویر محسوب می‌کنیم.
 */
export function getValidImageUrls(imageUrls: string[]): string[] {
  return imageUrls.filter((url) => url.trim().length > 0);
}

function ImageUrlsField({
  setValue,
  imageUrls,
  errors,
  minImages,
  maxImages,
}: {
  register: UseFormRegister<PostFormValues>;
  setValue: UseFormSetValue<PostFormValues>;
  imageUrls: string[];
  errors: FieldErrors<PostFormValues>;
  minImages: number;
  maxImages?: number;
}) {
  /**
   * تعداد تصاویر واقعی
   *
   * فیلدهای خالی در این تعداد حساب نمی‌شوند.
   */
  const validImageUrls = getValidImageUrls(imageUrls);

  const imageCount = validImageUrls.length;

  /**
   * افزودن یک فیلد جدید
   *
   * فیلد خالی است و هنوز تصویر محسوب نمی‌شود.
   */
  const addImage = () => {
    if (maxImages !== undefined && imageCount >= maxImages) {
      return;
    }

    setValue("imageUrls", [...imageUrls, ""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /**
   * حذف فیلد تصویر
   */
  const removeImage = (index: number) => {
    const next = imageUrls.filter((_, currentIndex) => currentIndex !== index);

    setValue("imageUrls", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /**
   * تغییر URL تصویر
   */
  const updateImage = (index: number, value: string) => {
    const next = [...imageUrls];

    next[index] = value;

    setValue("imageUrls", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /**
   * آیا امکان افزودن تصویر جدید وجود دارد؟
   *
   * تعداد فیلدهای خالی در اینجا اهمیتی ندارد.
   */
  const canAdd = maxImages === undefined || imageCount < maxImages;

  /**
   * آیا حداقل تعداد تصویر اجازه حذف می‌دهد؟
   */
  const canRemove = imageUrls.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            تصاویر پست
          </label>

          <p className="mt-1 text-xs text-gray-400">آدرس تصویر را وارد کنید.</p>
        </div>

        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
          {imageCount}
          {maxImages !== undefined ? ` / ${maxImages}` : ""}
        </span>
      </div>

      {/* Images */}
      {imageUrls.length > 0 && (
        <div className="space-y-3">
          {imageUrls.map((imageUrl, index) => {
            const isEmpty = imageUrl.trim() === "";

            return (
              <div
                key={index}
                className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                  isEmpty
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Number */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                  {index + 1}
                </div>

                {/* URL */}
                <input
                  value={imageUrl}
                  onChange={(event) => updateImage(index, event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-gray-400"
                />

                {/* Status */}
                {!isEmpty && (
                  <span className="hidden rounded-md bg-green-50 px-2 py-1 text-[11px] font-medium text-green-600 sm:block">
                    ثبت شده
                  </span>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={!canRemove}
                  className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  حذف
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add */}
      {canAdd && (
        <button
          type="button"
          onClick={addImage}
          className="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:bg-gray-50"
        >
          + افزودن تصویر
        </button>
      )}

      {/* Validation error */}
      {errors.imageUrls && (
        <p className="text-xs font-medium text-red-600">
          {errors.imageUrls.message?.toString()}
        </p>
      )}
      {errors.imageUrls?.[0] && (
        <p className="text-xs font-medium text-red-600">
          {errors.imageUrls[0].message?.toString()}
        </p>
      )}

      {/* Minimum images */}
      {minImages > 0 && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          حداقل {minImages} تصویر معتبر برای این کانال الزامی است.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Instagram                                                                  */
/* -------------------------------------------------------------------------- */

function InstagramFields(props: ChannelFieldsProps) {
  return (
    <ImageUrlsField
      register={props.register}
      setValue={props.setValue}
      imageUrls={props.imageUrls}
      errors={props.errors}
      minImages={1}
      maxImages={10}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Telegram                                                                   */
/* -------------------------------------------------------------------------- */

function TelegramFields(props: ChannelFieldsProps) {
  return (
    <ImageUrlsField
      register={props.register}
      setValue={props.setValue}
      imageUrls={props.imageUrls}
      errors={props.errors}
      minImages={0}
      maxImages={10}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* LinkedIn                                                                   */
/* -------------------------------------------------------------------------- */

function LinkedinFields(props: ChannelFieldsProps) {
  return (
    <ImageUrlsField
      register={props.register}
      setValue={props.setValue}
      imageUrls={props.imageUrls}
      errors={props.errors}
      minImages={0}
      maxImages={9}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* X                                                                          */
/* -------------------------------------------------------------------------- */

function XFields(props: ChannelFieldsProps) {
  return (
    <div className="space-y-5">
      <ImageUrlsField
        register={props.register}
        setValue={props.setValue}
        imageUrls={props.imageUrls}
        errors={props.errors}
        minImages={0}
        maxImages={4}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Channel Fields                                                             */
/* -------------------------------------------------------------------------- */

export function ChannelFields(props: ChannelFieldsProps) {
  switch (props.channel) {
    case "instagram":
      return <InstagramFields {...props} />;

    case "telegram":
      return <TelegramFields {...props} />;

    case "linkedin":
      return <LinkedinFields {...props} />;

    case "x":
      return <XFields {...props} />;

    default:
      return null;
  }
}
