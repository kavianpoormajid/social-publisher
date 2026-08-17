"use client";

import { KeyboardEvent, useState } from "react";
import { FieldErrors, UseFormSetValue } from "react-hook-form";

import { PostFormValues } from "../post-validation";

interface HashtagInputProps {
  hashtags: string[];
  setValue: UseFormSetValue<PostFormValues>;
  errors: FieldErrors<PostFormValues>;
  max?: number;
}

export function HashtagInput({
  hashtags,
  setValue,
  errors,
  max,
}: HashtagInputProps) {
  const [input, setInput] = useState("");

  const addHashtag = () => {
    const value = input.trim();

    if (!value) {
      return;
    }

    if (value.includes(",")) {
      return;
    }

    if (max !== undefined && hashtags.length >= max) {
      return;
    }

    if (hashtags.includes(value)) {
      setInput("");
      return;
    }

    setValue("hashtags", [...hashtags, value], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setInput("");
  };

  const removeHashtag = (index: number) => {
    const next = hashtags.filter((_, currentIndex) => currentIndex !== index);

    setValue("hashtags", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    /*
     * جلوگیری از ثبت کاما
     */
    if (event.key === ",") {
      event.preventDefault();

      return;
    }

    /*
     * با Enter هشتگ اضافه می‌شود
     */
    if (event.key === "Enter") {
      event.preventDefault();

      addHashtag();

      return;
    }

    /*
     * اگر input خالی باشد و Backspace زده شود،
     * آخرین هشتگ حذف می‌شود.
     */
    if (
      event.key === "Backspace" &&
      input.length === 0 &&
      hashtags.length > 0
    ) {
      removeHashtag(hashtags.length - 1);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    /*
     * اگر کاربر از Paste هم کاما وارد کرد،
     * کاما حذف می‌شود.
     */
    const value = event.target.value.replace(/,/g, "");

    setInput(value);
  };

  const hashtagError = errors.hashtags?.message?.toString();

  const reachedLimit = max !== undefined && hashtags.length >= max;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="hashtag-input"
          className="block text-sm font-semibold text-gray-800"
        >
          هشتگ‌ها
        </label>

        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
          {hashtags.length}
          {max !== undefined ? ` / ${max}` : ""}
        </span>
      </div>

      {/* Input box */}
      <div
        className={`min-h-12 rounded-xl border bg-white px-3 py-2 transition
          ${
            hashtagError
              ? "border-red-300 ring-2 ring-red-50"
              : "border-gray-200 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100"
          }
        `}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Hashtags */}
          {hashtags.map((hashtag, index) => (
            <span
              key={`${hashtag}-${index}`}
              className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700"
            >
              <span>#{hashtag}</span>

              <button
                type="button"
                onClick={() => removeHashtag(index)}
                className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-red-500"
                aria-label={`حذف هشتگ ${hashtag}`}
              >
                ×
              </button>
            </span>
          ))}

          {/* Input */}
          {!reachedLimit && (
            <input
              id="hashtag-input"
              type="text"
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={
                hashtags.length === 0 ? "هشتگ را وارد کنید..." : "هشتگ بعدی..."
              }
              className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          )}
        </div>
      </div>

      {/* Help */}
      <p className="text-xs text-gray-400">
        برای افزودن هشتگ، عبارت را وارد کرده و Enter بزنید.
      </p>

      {/* Error */}
      {hashtagError && (
        <p className="text-xs font-medium text-red-600">{hashtagError}</p>
      )}

      {/* Limit */}
      {reachedLimit && (
        <p className="text-xs font-medium text-amber-600">
          حداکثر تعداد هشتگ مجاز برای این کانال ثبت شده است.
        </p>
      )}
    </div>
  );
}
