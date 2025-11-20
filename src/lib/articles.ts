import { supabase } from './supabase';

export interface Article {
  article_id: string;
  board_id: number;
  subject: string | null;
  content_summary: string | null;
  original_content: string | null;
  write_date: string | null;
  modify_date: string | null;
  expire_date: string | null;
  user_name: string | null;
  user_dept_name: string | null;
  board_name: string | null;
  views: number;
  created_at: string;
  updated_at: string;
}

/**
 * 모든 게시물 조회
 */
export async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('write_date', { ascending: false });

  if (error) {
    console.error('게시물 조회 오류:', error);
    throw error;
  }

  return data || [];
}

