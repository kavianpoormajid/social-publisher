export type ConflictType =
  | 'MIN_INTERVAL'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'OUTSIDE_ALLOWED_WINDOW';

export interface PostConflict {
  postId: string;
  type: ConflictType;
  message: string;
  relatedPostIds: string[];
}

export interface ConflictResult {
  conflicts: PostConflict[];
  hasConflicts: boolean;
}
