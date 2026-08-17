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

function countXCharacters(content: string): number {
  const urlPattern = /https?:\/\/[^\s]+/gi;

  return content.replace(urlPattern, "x".repeat(23)).length;
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
  const addImage = () => {
    setValue("imageUrls", [...imageUrls, ""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeImage = (index: number) => {
    const next = imageUrls.filter((_, currentIndex) => currentIndex !== index);

    setValue("imageUrls", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const updateImage = (index: number, value: string) => {
    const next = [...imageUrls];

    next[index] = value;

    setValue("imageUrls", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const canAdd = maxImages === undefined || imageUrls.length < maxImages;

  const canRemove = imageUrls.length > minImages;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Images</label>

          <span className="text-xs text-gray-500">
            {imageUrls.length}
            {maxImages !== undefined ? ` / ${maxImages}` : ""}
          </span>
        </div>
      </div>

      {imageUrls.map((imageUrl, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={imageUrl}
            onChange={(event) => updateImage(index, event.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border px-3 py-2"
          />

          <button
            type="button"
            onClick={() => removeImage(index)}
            disabled={!canRemove}
            className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          onClick={addImage}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          + Add image
        </button>
      )}

      {errors.imageUrls && (
        <p className="text-sm text-red-600">
          {errors.imageUrls.message?.toString()}
        </p>
      )}

      {minImages > 0 && (
        <p className="text-xs text-gray-500">
          At least {minImages} image
          {minImages > 1 ? "s" : ""} required.
        </p>
      )}
    </div>
  );
}

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

function TelegramFields(props: ChannelFieldsProps) {
  return (
    <ImageUrlsField
      register={props.register}
      setValue={props.setValue}
      imageUrls={props.imageUrls}
      errors={props.errors}
      minImages={0}
    />
  );
}

function LinkedinFields(props: ChannelFieldsProps) {
  return (
    <ImageUrlsField
      register={props.register}
      setValue={props.setValue}
      imageUrls={props.imageUrls}
      errors={props.errors}
      minImages={0}
    />
  );
}

function XFields(props: ChannelFieldsProps) {
  const characterCount = countXCharacters(props.content);

  const remaining = 280 - characterCount;

  return (
    <div className="space-y-4">
      <ImageUrlsField
        register={props.register}
        setValue={props.setValue}
        imageUrls={props.imageUrls}
        errors={props.errors}
        minImages={0}
        maxImages={4}
      />

      <div className="rounded-lg border p-3">
        <div className="flex justify-between text-sm">
          <span>X characters</span>

          <span
            className={
              remaining < 0 ? "font-medium text-red-600" : "text-gray-500"
            }
          >
            {characterCount} / 280
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          URLs count as 23 characters.
        </p>
      </div>
    </div>
  );
}

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
  }
}
