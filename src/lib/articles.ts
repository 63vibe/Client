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

  // 디버깅: 가져온 데이터 확인
  if (data && data.length > 0) {
    console.log('가져온 articles 샘플:', data.slice(0, 3));
    console.log('첫 번째 article의 board_id:', data[0]?.board_id);
    console.log('첫 번째 article의 모든 필드:', Object.keys(data[0] || {}));
    
    // 필드명이 다를 수 있으므로 확인
    const firstArticle = data[0];
    if (firstArticle) {
      console.log('board_id 직접 접근:', firstArticle.board_id);
      console.log('board_id 대괄호 접근:', firstArticle['board_id']);
      // snake_case로 올 수도 있으므로 확인
      if (!firstArticle.board_id && 'board_id' in firstArticle) {
        console.log('board_id 필드가 있지만 값이 undefined');
      }
    }
  }

  // 필드명이 다를 경우를 대비해 명시적으로 매핑
  return (data || []).map((item: any) => ({
    article_id: item.article_id || item.articleId,
    board_id: item.board_id ?? item.boardId ?? item.board_id, // snake_case 우선, 없으면 camelCase
    subject: item.subject,
    content_summary: item.content_summary || item.contentSummary,
    original_content: item.original_content || item.originalContent,
    write_date: item.write_date || item.writeDate,
    modify_date: item.modify_date || item.modifyDate,
    expire_date: item.expire_date || item.expireDate,
    user_name: item.user_name || item.userName,
    user_dept_name: item.user_dept_name || item.userDeptName,
    board_name: item.board_name || item.boardName,
    views: item.views || 0,
    created_at: item.created_at || item.createdAt,
    updated_at: item.updated_at || item.updatedAt,
  })) as Article[];
}

