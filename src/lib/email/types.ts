/**
 * 이메일 발송 관련 타입 정의
 */

export interface UserEmail {
  employee_id: string;
  email: string;
  name: string;
}

export interface Post {
  id: string;
  board: string;
  title: string;
  summary: string;
  keywords: string[];
  author: string;
  date: string;
  views: number;
  isNew: boolean;
  matchedKeywords: string[];
  source?: 'board' | 'naver';
  url?: string;
}

export interface UserPosts {
  user: UserEmail;
  posts: Post[];
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

