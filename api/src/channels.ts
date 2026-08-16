import type { Channel, ChannelConfig } from './types.js';

export const CHANNEL_IDS: Channel[] = ['instagram', 'telegram', 'linkedin', 'x'];

export const CHANNEL_CONFIGS: ChannelConfig[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    dailyLimit: 3,
    allowedWindow: { start: '08:00', end: '23:00' },
    maxLength: 2200,
    maxHashtags: 30,
    requiresImage: true,
    maxImages: 10,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    dailyLimit: 10,
    allowedWindow: { start: '00:00', end: '23:59' },
    maxLength: 4096,
    maxHashtags: 100,
    requiresImage: false,
    maxImages: 10,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    dailyLimit: 2,
    allowedWindow: { start: '09:00', end: '18:00' },
    maxLength: 3000,
    maxHashtags: 5,
    requiresImage: false,
    maxImages: 9,
  },
  {
    id: 'x',
    label: 'X',
    dailyLimit: 8,
    allowedWindow: { start: '00:00', end: '23:59' },
    maxLength: 280,
    maxHashtags: 10,
    requiresImage: false,
    maxImages: 4,
  },
];

const BY_ID = new Map<Channel, ChannelConfig>(CHANNEL_CONFIGS.map((config) => [config.id, config]));

export function getChannelConfig(channel: Channel): ChannelConfig {
  return BY_ID.get(channel)!;
}

export function isChannel(value: unknown): value is Channel {
  return typeof value === 'string' && BY_ID.has(value as Channel);
}
