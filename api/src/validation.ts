import { isChannel } from './channels.js';
import type { Channel, PostStatus } from './types.js';

const STATUSES: PostStatus[] = ['draft', 'scheduled', 'published', 'failed'];

export interface PostInput {
  brand: string;
  channel: Channel;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  scheduledAt: string;
  status: PostStatus;
}

export type ValidationFields = Record<string, string>;

export interface ValidationResult<T> {
  fields: ValidationFields;
  value: T;
}

function isStatus(value: unknown): value is PostStatus {
  return typeof value === 'string' && STATUSES.includes(value as PostStatus);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validates a create payload: presence, enum membership and a parsable date. */
export function validateCreate(body: unknown): ValidationResult<PostInput> {
  const fields: ValidationFields = {};
  const source = isPlainObject(body) ? body : {};

  if (!isPlainObject(body)) {
    fields.body = 'Request body must be a JSON object';
  }

  if (typeof source.brand !== 'string' || source.brand.trim() === '') {
    fields.brand = 'brand is required';
  }
  if (!isChannel(source.channel)) {
    fields.channel = 'channel must be one of: instagram, telegram, linkedin, x';
  }
  if (typeof source.content !== 'string' || source.content.trim() === '') {
    fields.content = 'content is required';
  }
  if (source.hashtags !== undefined && !isStringArray(source.hashtags)) {
    fields.hashtags = 'hashtags must be an array of strings';
  }
  if (source.imageUrls !== undefined && !isStringArray(source.imageUrls)) {
    fields.imageUrls = 'imageUrls must be an array of strings';
  }
  if (typeof source.scheduledAt !== 'string' || Number.isNaN(Date.parse(source.scheduledAt))) {
    fields.scheduledAt = 'scheduledAt must be a valid date';
  }
  if (!isStatus(source.status)) {
    fields.status = 'status must be one of: draft, scheduled, published, failed';
  }

  return {
    fields,
    value: {
      brand: source.brand as string,
      channel: source.channel as Channel,
      content: source.content as string,
      hashtags: (source.hashtags as string[]) ?? [],
      imageUrls: (source.imageUrls as string[]) ?? [],
      scheduledAt: source.scheduledAt as string,
      status: source.status as PostStatus,
    },
  };
}

/** Validates a partial payload, checking only the keys that are present. */
export function validatePatch(body: unknown): ValidationResult<Partial<PostInput>> {
  const fields: ValidationFields = {};
  const value: Partial<PostInput> = {};

  if (!isPlainObject(body)) {
    return { fields: { body: 'Request body must be a JSON object' }, value };
  }

  if (body.brand !== undefined) {
    if (typeof body.brand !== 'string' || body.brand.trim() === '') {
      fields.brand = 'brand must be a non-empty string';
    } else {
      value.brand = body.brand;
    }
  }
  if (body.channel !== undefined) {
    if (!isChannel(body.channel)) {
      fields.channel = 'channel must be one of: instagram, telegram, linkedin, x';
    } else {
      value.channel = body.channel;
    }
  }
  if (body.content !== undefined) {
    if (typeof body.content !== 'string' || body.content.trim() === '') {
      fields.content = 'content must be a non-empty string';
    } else {
      value.content = body.content;
    }
  }
  if (body.hashtags !== undefined) {
    if (!isStringArray(body.hashtags)) {
      fields.hashtags = 'hashtags must be an array of strings';
    } else {
      value.hashtags = body.hashtags;
    }
  }
  if (body.imageUrls !== undefined) {
    if (!isStringArray(body.imageUrls)) {
      fields.imageUrls = 'imageUrls must be an array of strings';
    } else {
      value.imageUrls = body.imageUrls;
    }
  }
  if (body.scheduledAt !== undefined) {
    if (typeof body.scheduledAt !== 'string' || Number.isNaN(Date.parse(body.scheduledAt))) {
      fields.scheduledAt = 'scheduledAt must be a valid date';
    } else {
      value.scheduledAt = body.scheduledAt;
    }
  }
  if (body.status !== undefined) {
    if (!isStatus(body.status)) {
      fields.status = 'status must be one of: draft, scheduled, published, failed';
    } else {
      value.status = body.status;
    }
  }

  return { fields, value };
}

export function hasErrors(fields: ValidationFields): boolean {
  return Object.keys(fields).length > 0;
}
