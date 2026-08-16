export type Channel = 'instagram' | 'telegram' | 'linkedin' | 'x';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface Post {
  id: string;
  brand: string;
  channel: Channel;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  scheduledAt: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelConfig {
  id: Channel;
  label: string;
  dailyLimit: number;
  allowedWindow: { start: string; end: string };
  maxLength: number;
  maxHashtags: number;
  requiresImage: boolean;
  maxImages: number;
}
