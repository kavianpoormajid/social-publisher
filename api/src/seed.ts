import { getChannelConfig } from './channels.js';
import { createRandom, intBetween, pick, type Random } from './random.js';
import { startOfLocalDay, toIso } from './time.js';
import type { Channel, Post, PostStatus } from './types.js';

const SEED = 917_432_615;
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;

const BRANDS = ['Nova', 'Kavir', 'Atlas'];

/** Frozen once per process so repeated reseeds produce the same data. */
const BASE_DAY = startOfLocalDay(Date.now());
const REFERENCE_NOW = BASE_DAY + 12 * HOUR_MS;

const OPENERS = [
  'کمپین تابستانی ما با تخفیف‌های ویژه شروع شد.',
  'یک خبر خوب برای همراهان همیشگی ما داریم.',
  'نسخه‌ی تازه‌ی محصول بالاخره رونمایی شد.',
  'پشت صحنه‌ی تیم ما را در این پست ببینید.',
  'سه نکته‌ی کاربردی که کار روزانه‌ی شما را ساده‌تر می‌کند.',
  'داستان یکی از مشتری‌های قدیمی ما را بخوانید.',
  'این هفته میزبان یک رویداد آنلاین رایگان هستیم.',
  'گزارش عملکرد فصل گذشته منتشر شد.',
  'پرسش پرتکرار این ماه را اینجا جواب داده‌ایم.',
  'یک تغییر کوچک که نتیجه‌ی بزرگی داشت.',
];

const BODIES = [
  'تیم ما ماه‌ها روی این نسخه کار کرد تا تجربه‌ی ساده‌تری برای شما ساخته شود.',
  'همه‌ی سفارش‌های ثبت‌شده تا پایان هفته با ارسال رایگان تحویل می‌شوند.',
  'بازخوردهای شما مسیر توسعه‌ی محصول را مشخص می‌کند و ما آن‌ها را جدی می‌گیریم.',
  'ظرفیت این دوره محدود است و ثبت‌نام تا روز جمعه ادامه دارد.',
  'نسخه‌ی جدید سریع‌تر بالا می‌آید و حجم داده‌ی کمتری مصرف می‌کند.',
  'برای مشاوره‌ی رایگان کافی است ساعت کاری با ما تماس بگیرید.',
  'در این گزارش، اعداد فروش و نرخ بازگشت مشتری را شفاف منتشر کرده‌ایم.',
  'تخفیف روی همه‌ی پلن‌های سالانه اعمال شده و نیازی به کد تخفیف نیست.',
];

const CLOSERS = [
  'نظر شما برای ما ارزشمند است؛ در کامنت‌ها بنویسید.',
  'همین حالا شروع کنید.',
  'منتظر دیدن شما هستیم.',
  'جزئیات بیشتر در وب‌سایت ما.',
  'لینک ثبت‌نام در بیو قرار گرفته است.',
];

const HASHTAGS = [
  'بازاریابی',
  'برند',
  'فروش',
  'تخفیف',
  'محصول_جدید',
  'کسب_و_کار',
  'دیجیتال_مارکتینگ',
  'تجربه_مشتری',
  'رشد',
  'استارتاپ',
  'طراحی',
  'فناوری',
];

interface Draft {
  channel: Channel;
  epoch: number;
  order: number;
  withoutImages: boolean;
}

function at(dayOffset: number, hour: number, minute: number): number {
  return BASE_DAY + dayOffset * DAY_MS + hour * HOUR_MS + minute * MINUTE_MS;
}

/** Pairs on one channel placed a fixed number of minutes apart. */
const PAIR_GAPS = [29, 29, 30, 30, 5, 10, 12, 15, 18, 20, 22, 25, 27, 8];
const PAIR_CHANNELS: Channel[] = ['instagram', 'telegram', 'linkedin', 'x'];
const PAIR_STARTS: Array<[number, number]> = [
  [10, 0],
  [12, 30],
  [10, 15],
  [14, 0],
];

/** channel, day offset, how many posts, first hour, minutes between posts. */
const BUSY_DAYS: Array<[Channel, number, number, number, number]> = [
  ['linkedin', -14, 4, 9, 90],
  ['linkedin', 7, 3, 10, 120],
  ['instagram', -9, 5, 9, 120],
  ['instagram', 12, 4, 10, 150],
  ['x', 3, 9, 9, 60],
  ['telegram', -5, 11, 8, 60],
];

/** channel, day offset, hour, minute. */
const OFF_HOURS: Array<[Channel, number, number, number]> = [
  ['instagram', -18, 3, 15],
  ['instagram', -6, 5, 40],
  ['instagram', 9, 6, 20],
  ['instagram', 16, 23, 45],
  ['linkedin', -20, 7, 10],
  ['linkedin', -11, 8, 20],
  ['linkedin', -2, 19, 30],
  ['linkedin', 6, 21, 0],
  ['linkedin', 13, 6, 45],
  ['linkedin', 19, 22, 15],
];

const IMAGELESS_DAYS = [-21, -15, -8, -3, 1, 4, 10, 18];

const FILLER_COUNTS: Record<Channel, number> = {
  instagram: 31,
  telegram: 41,
  linkedin: 41,
  x: 45,
};

const FILLER_STEPS: Record<Channel, number> = {
  instagram: 7,
  telegram: 11,
  linkedin: 13,
  x: 17,
};

const FILLER_TIMES: Record<Channel, Array<[number, number]>> = {
  instagram: [
    [9, 30],
    [12, 0],
    [15, 45],
    [18, 20],
    [20, 10],
    [22, 5],
  ],
  telegram: [
    [8, 15],
    [10, 40],
    [13, 5],
    [16, 30],
    [19, 0],
    [21, 25],
    [23, 10],
  ],
  linkedin: [
    [9, 15],
    [11, 0],
    [13, 40],
    [15, 20],
    [17, 5],
  ],
  x: [
    [7, 45],
    [9, 10],
    [11, 35],
    [14, 15],
    [16, 50],
    [18, 30],
    [20, 45],
    [22, 55],
  ],
};

const SPAN_DAYS = 43;
const FIRST_DAY = -21;

function buildDrafts(): Draft[] {
  const drafts: Draft[] = [];
  const add = (channel: Channel, epoch: number, withoutImages = false) => {
    drafts.push({ channel, epoch, order: drafts.length, withoutImages });
  };

  PAIR_GAPS.forEach((gap, index) => {
    const channel = PAIR_CHANNELS[index % PAIR_CHANNELS.length];
    const [hour, minute] = PAIR_STARTS[index % PAIR_STARTS.length];
    const dayOffset = FIRST_DAY + 2 + index * 3;
    add(channel, at(dayOffset, hour, minute));
    add(channel, at(dayOffset, hour, minute + gap));
  });

  for (const [channel, dayOffset, count, startHour, stepMinutes] of BUSY_DAYS) {
    for (let i = 0; i < count; i += 1) {
      add(channel, at(dayOffset, startHour, i * stepMinutes));
    }
  }

  for (const [channel, dayOffset, hour, minute] of OFF_HOURS) {
    add(channel, at(dayOffset, hour, minute));
  }

  IMAGELESS_DAYS.forEach((dayOffset, index) => {
    add('instagram', at(dayOffset, 11 + (index % 5), (index * 7) % 60), true);
  });

  for (const channel of PAIR_CHANNELS) {
    const times = FILLER_TIMES[channel];
    const step = FILLER_STEPS[channel];
    for (let i = 0; i < FILLER_COUNTS[channel]; i += 1) {
      const dayOffset = FIRST_DAY + ((i * step) % SPAN_DAYS);
      const [hour, minute] = times[i % times.length];
      add(channel, at(dayOffset, hour, minute));
    }
  }

  drafts.sort((a, b) => a.epoch - b.epoch || a.order - b.order);
  return drafts;
}

function buildContent(random: Random, brand: string, channel: Channel): string {
  const opener = pick(random, OPENERS);
  const body = pick(random, BODIES);
  const closer = pick(random, CLOSERS);
  const shape = random();

  if (channel === 'x') {
    return shape < 0.5 ? `${brand}: ${opener}` : `${brand}: ${opener} ${closer}`;
  }
  if (shape < 0.35) {
    return `${brand} | ${opener}\n${body}`;
  }
  if (shape < 0.75) {
    return `${brand} | ${opener}\n${body}\n${closer}`;
  }
  return `${brand} | ${opener}\n${body}\n${pick(random, BODIES)}\n${closer}`;
}

function buildHashtags(random: Random): string[] {
  const pool = [...HASHTAGS];
  const count = intBetween(random, 2, 4);
  const chosen: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const index = Math.floor(random() * pool.length);
    chosen.push(pool.splice(index, 1)[0]);
  }
  return chosen;
}

function buildImages(random: Random, channel: Channel, id: string): string[] {
  const count = channel === 'instagram' ? intBetween(random, 1, 3) : random() < 0.45 ? 1 : 0;
  const urls: string[] = [];
  for (let i = 0; i < count; i += 1) {
    urls.push(`https://picsum.photos/seed/${id}-${i + 1}/1080/1080`);
  }
  return urls;
}

function buildStatus(random: Random, epoch: number): PostStatus {
  if (epoch < REFERENCE_NOW) {
    return random() < 0.12 ? 'failed' : 'published';
  }
  return random() < 0.25 ? 'draft' : 'scheduled';
}

export function buildSeedPosts(): Post[] {
  const random = createRandom(SEED);
  const drafts = buildDrafts();

  return drafts.map((draft, index) => {
    const id = `post_${String(index + 1).padStart(3, '0')}`;
    const brand = BRANDS[index % BRANDS.length];
    const content = buildContent(random, brand, draft.channel);
    const hashtags = buildHashtags(random);
    const imageUrls = draft.withoutImages ? [] : buildImages(random, draft.channel, id);
    const status = buildStatus(random, draft.epoch);
    const createdAt = draft.epoch - intBetween(random, 2, 14) * DAY_MS - intBetween(random, 0, 20) * HOUR_MS;
    const updatedAt = createdAt + intBetween(random, 0, 60) * HOUR_MS;

    return {
      id,
      brand,
      channel: draft.channel,
      content: content.slice(0, getChannelConfig(draft.channel).maxLength),
      hashtags,
      imageUrls,
      scheduledAt: toIso(draft.epoch),
      status,
      createdAt: toIso(createdAt),
      updatedAt: toIso(updatedAt),
    };
  });
}
