export type BlogReactionType = "heart" | "fire" | "rocket" | "like" | "bulb";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  featuredImageUrl: string | null;
  published: boolean;
  featured: boolean;
  allowComments: boolean;
  readTimeMinutes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  featuredImageUrl: string | null;
  published: boolean;
  featured: boolean;
  allowComments: boolean;
  readTimeMinutes: number;
  views: number;
  commentCount: number;
  reactionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogPostsResponse {
  featured: BlogPostSummary[];
  posts: BlogPostSummary[];
  pagination: BlogPagination;
}

export interface BlogCommentAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
  profileUrl: string;
  isGuest?: boolean;
}

export interface BlogComment {
  id: number;
  postId: number;
  userId: string;
  parentId: number | null;
  content: string;
  createdAt: string;
  author: BlogCommentAuthor;
  replies: BlogComment[];
  reactionCount: number;
  userReacted: boolean;
}

export interface BlogReactionsSummary {
  counts: Record<BlogReactionType, number>;
  userReactions: BlogReactionType[];
  total: number;
}
