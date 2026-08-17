import { z } from "zod";

const hashtagSchema = z.string().trim().min(1, "هشتگ نمی‌تواند خالی باشد");

const basePostSchema = z.object({
  brand: z.string().trim().min(1, "وارد کردن نام برند الزامی است"),

  content: z.string().min(1, "وارد کردن محتوا الزامی است"),

  hashtags: z.array(hashtagSchema),

  scheduledAt: z.string().min(1, "انتخاب زمان انتشار الزامی است"),
});

export const instagramPostSchema = basePostSchema.extend({
  channel: z.literal("instagram"),

  content: z
    .string()
    .min(1, "وارد کردن محتوا الزامی است")
    .max(2200, "محتوای اینستاگرام نمی‌تواند بیشتر از ۲۲۰۰ کاراکتر باشد"),

  hashtags: z
    .array(hashtagSchema)
    .max(30, "تعداد هشتگ‌های اینستاگرام نمی‌تواند بیشتر از ۳۰ عدد باشد"),

  imageUrls: z
    .array(z.url())
    .min(1, "برای انتشار در اینستاگرام حداقل یک تصویر لازم است"),
});

export const telegramPostSchema = basePostSchema.extend({
  channel: z.literal("telegram"),

  content: z
    .string()
    .min(1, "وارد کردن محتوا الزامی است")
    .max(4096, "محتوای تلگرام نمی‌تواند بیشتر از ۴۰۹۶ کاراکتر باشد"),

  hashtags: z.array(hashtagSchema),

  imageUrls: z.array(z.url()),
});

export const linkedinPostSchema = basePostSchema.extend({
  channel: z.literal("linkedin"),

  content: z
    .string()
    .min(1, "وارد کردن محتوا الزامی است")
    .max(3000, "محتوای لینکدین نمی‌تواند بیشتر از ۳۰۰۰ کاراکتر باشد"),

  hashtags: z
    .array(hashtagSchema)
    .max(5, "تعداد هشتگ‌های لینکدین نمی‌تواند بیشتر از ۵ عدد باشد"),

  imageUrls: z.array(z.url()),
});

function countXCharacters(content: string): number {
  /*
   * هر URL در X معادل ۲۳ کاراکتر محسوب می‌شود.
   */
  const urlPattern = /https?:\/\/[^\s]+/gi;

  return content.replace(urlPattern, "x".repeat(23)).length;
}

export const xPostSchema = basePostSchema.extend({
  channel: z.literal("x"),

  content: z
    .string()
    .min(1, "وارد کردن محتوا الزامی است")
    .superRefine((content, ctx) => {
      const length = countXCharacters(content);

      if (length > 280) {
        ctx.addIssue({
          code: "custom",
          message: "محتوای X نمی‌تواند بیشتر از ۲۸۰ کاراکتر باشد",
        });
      }
    }),

  hashtags: z
    .array(hashtagSchema)
    .max(4, "تعداد هشتگ‌های X نمی‌تواند بیشتر از ۴ عدد باشد"),

  imageUrls: z
    .array(z.url())
    .max(4, "تعداد تصاویر X نمی‌تواند بیشتر از ۴ تصویر باشد"),
});

export const postSchema = z.discriminatedUnion("channel", [
  instagramPostSchema,
  telegramPostSchema,
  linkedinPostSchema,
  xPostSchema,
]);

export type PostFormValues = z.infer<typeof postSchema>;
