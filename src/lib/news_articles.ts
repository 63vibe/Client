import { supabase } from './supabase';

export interface NewsArticle {
  link: string;
  domain: string;
  title: string | null;
  summary: string | null;
  description: string | null;
  publisher: string | null;
  pub_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 모든 뉴스 기사 조회
 */
export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('pub_date', { ascending: false });

  if (error) {
    console.error('뉴스 기사 조회 오류:', error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 도메인의 뉴스 기사 조회
 */
export async function getNewsArticlesByDomain(domain: string): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('domain', domain)
    .order('pub_date', { ascending: false });

  if (error) {
    console.error('뉴스 기사 조회 오류:', error);
    throw error;
  }

  return data || [];
}

