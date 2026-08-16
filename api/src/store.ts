import { buildSeedPosts } from './seed.js';
import type { Post } from './types.js';

let posts: Post[] = [];
let nextId = 1;

function refreshNextId(): void {
  nextId = posts.reduce((max, post) => {
    const numeric = Number(post.id.replace('post_', ''));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0) + 1;
}

export function reset(): void {
  posts = buildSeedPosts();
  refreshNextId();
}

export function all(): Post[] {
  return posts;
}

export function find(id: string): Post | undefined {
  return posts.find((post) => post.id === id);
}

export function insert(post: Omit<Post, 'id'>): Post {
  const created: Post = { id: `post_${String(nextId).padStart(3, '0')}`, ...post };
  nextId += 1;
  posts.push(created);
  return created;
}

export function remove(id: string): boolean {
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) {
    return false;
  }
  posts.splice(index, 1);
  return true;
}
