import { Router } from 'express';
import { getChannelConfig } from '../channels.js';
import { localDateKey, localMinuteOfDay, parseBoundary, parseClock, toIso } from '../time.js';
import * as store from '../store.js';
import type { Post } from '../types.js';
import { hasErrors, validateCreate, validatePatch } from '../validation.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_BULK_IDS = 50;

const SORTERS: Record<string, (a: Post, b: Post) => number> = {
  'scheduledAt:asc': (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
  'scheduledAt:desc': (a, b) => Date.parse(b.scheduledAt) - Date.parse(a.scheduledAt),
  'createdAt:asc': (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  'createdAt:desc': (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
};

function asList(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function toPositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.trunc(parsed));
}

export const postsRouter = Router();

postsRouter.get('/', (req, res) => {
  const { query } = req;

  const channels = asList(query.channel);
  const statuses = asList(query.status);
  const brand = typeof query.brand === 'string' ? query.brand : undefined;
  const from = typeof query.from === 'string' ? parseBoundary(query.from) : null;
  const to = typeof query.to === 'string' ? parseBoundary(query.to) : null;

  let items = store.all().filter((post) => {
    if (channels.length > 0 && !channels.includes(post.channel)) {
      return false;
    }
    if (statuses.length > 0 && !statuses.includes(post.status)) {
      return false;
    }
    if (brand !== undefined && post.brand !== brand) {
      return false;
    }
    const scheduled = Date.parse(post.scheduledAt);
    if (from !== null && scheduled < from) {
      return false;
    }
    if (to !== null && scheduled >= to) {
      return false;
    }
    return true;
  });

  const sortKey = typeof query.sort === 'string' && SORTERS[query.sort] ? query.sort : 'scheduledAt:asc';
  items = [...items].sort(SORTERS[sortKey]);

  const totalCount = items.length;
  const pageSize = Math.min(Math.max(toPositiveInt(query.pageSize, DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE);
  const page = toPositiveInt(query.page, 1);
  const offset = page * pageSize;

  res.json({
    items: items.slice(offset, offset + pageSize),
    totalCount,
    page,
    pageSize,
  });
});

postsRouter.patch('/bulk', (req, res) => {
  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const ids = body.ids;

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === 'string')) {
    res.status(422).json({ error: 'VALIDATION_ERROR', fields: { ids: 'ids must be a non-empty array of strings' } });
    return;
  }
  if (ids.length > MAX_BULK_IDS) {
    res.status(422).json({ error: 'VALIDATION_ERROR', fields: { ids: `ids may contain at most ${MAX_BULK_IDS} entries` } });
    return;
  }

  const { fields, value: patch } = validatePatch(body.patch ?? {});
  if (hasErrors(fields)) {
    res.status(422).json({ error: 'VALIDATION_ERROR', fields });
    return;
  }

  const succeeded: string[] = [];
  const failed: Array<{ id: string; reason: string }> = [];

  for (const id of ids as string[]) {
    const post = store.find(id);
    if (!post) {
      failed.push({ id, reason: 'NOT_FOUND' });
      continue;
    }

    const candidate = { ...post, ...patch };
    const config = getChannelConfig(candidate.channel);
    const scheduled = Date.parse(candidate.scheduledAt);
    const dayKey = localDateKey(scheduled);

    const sameDay = store
      .all()
      .filter(
        (other) =>
          other.id !== post.id &&
          other.channel === candidate.channel &&
          localDateKey(Date.parse(other.scheduledAt)) === dayKey,
      ).length;

    if (sameDay + 1 > config.dailyLimit) {
      failed.push({ id, reason: 'DAILY_LIMIT_EXCEEDED' });
      continue;
    }

    const minuteOfDay = localMinuteOfDay(scheduled);
    if (
      minuteOfDay < parseClock(config.allowedWindow.start) ||
      minuteOfDay > parseClock(config.allowedWindow.end)
    ) {
      failed.push({ id, reason: 'OUTSIDE_ALLOWED_WINDOW' });
      continue;
    }

    Object.assign(post, patch, { updatedAt: toIso(Date.now()) });
    succeeded.push(id);
  }

  res.status(207).json({ succeeded, failed });
});

postsRouter.get('/:id', (req, res) => {
  const post = store.find(req.params.id);
  if (!post) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  res.json(post);
});

postsRouter.post('/', (req, res) => {
  const { fields, value } = validateCreate(req.body);
  if (hasErrors(fields)) {
    res.status(422).json({ error: 'VALIDATION_ERROR', fields });
    return;
  }

  const timestamp = toIso(Date.now());
  store.insert({
    brand: value.brand,
    channel: value.channel,
    content: value.content,
    hashtags: value.hashtags,
    imageUrls: value.imageUrls,
    scheduledAt: value.scheduledAt,
    status: value.status,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  res.status(201).end();
});

postsRouter.patch('/:id', (req, res) => {
  const post = store.find(req.params.id);
  if (!post) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  const { fields, value } = validatePatch(req.body);
  if (hasErrors(fields)) {
    res.status(422).json({ error: 'VALIDATION_ERROR', fields });
    return;
  }

  Object.assign(post, value, { updatedAt: toIso(Date.now()) });
  res.json(post);
});

postsRouter.delete('/:id', (req, res) => {
  if (!store.remove(req.params.id)) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  res.status(204).end();
});
