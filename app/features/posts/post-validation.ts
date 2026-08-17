import { z } from 'zod';

const hashtagSchema = z.string().trim().min(1, 'Hashtag cannot be empty');

const basePostSchema = z.object({
  brand: z.string().trim().min(1, 'Brand is required'),

  content: z.string().min(1, 'Content is required'),

  hashtags: z.array(hashtagSchema),

  scheduledAt: z.string().min(1, 'Scheduled time is required'),
});

export const instagramPostSchema = basePostSchema.extend({
  channel: z.literal('instagram'),

  content: z
    .string()
    .min(1)
    .max(2200, 'Instagram content cannot exceed 2200 characters'),

  hashtags: z
    .array(hashtagSchema)
    .max(30, 'Instagram supports at most 30 hashtags'),

  imageUrls: z.array(z.url()).min(1, 'Instagram requires at least one image'),
});

export const telegramPostSchema = basePostSchema.extend({
  channel: z.literal('telegram'),

  content: z
    .string()
    .min(1)
    .max(4096, 'Telegram content cannot exceed 4096 characters'),

  hashtags: z.array(hashtagSchema),

  imageUrls: z.array(z.url()),
});

export const linkedinPostSchema = basePostSchema.extend({
  channel: z.literal('linkedin'),

  content: z
    .string()
    .min(1)
    .max(3000, 'LinkedIn content cannot exceed 3000 characters'),

  hashtags: z
    .array(hashtagSchema)
    .max(5, 'LinkedIn supports at most 5 hashtags'),

  imageUrls: z.array(z.url()),
});

function countXCharacters(content: string): number {
  /*
   * A URL counts as 23 characters on X.
   *
   * We replace each URL with a 23-character
   * representation before checking the limit.
   */
  const urlPattern = /https?:\/\/[^\s]+/gi;

  return content.replace(urlPattern, 'x'.repeat(23)).length;
}

export const xPostSchema = basePostSchema.extend({
  channel: z.literal('x'),

  content: z
    .string()
    .min(1)
    .superRefine((content, ctx) => {
      const length = countXCharacters(content);

      if (length > 280) {
        ctx.addIssue({
          code: 'custom',
          message: 'X content cannot exceed 280 characters',
        });
      }
    }),

  hashtags: z.array(hashtagSchema).max(4, 'X supports at most 4 hashtags'),

  imageUrls: z.array(z.url()).max(4, 'X supports at most 4 images'),
});

export const postSchema = z.discriminatedUnion('channel', [
  instagramPostSchema,
  telegramPostSchema,
  linkedinPostSchema,
  xPostSchema,
]);

export type PostFormValues = z.infer<typeof postSchema>;
