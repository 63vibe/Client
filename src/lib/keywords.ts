import { supabase } from './supabase';
import { Keyword, CreateKeywordInput } from '@/src/types/keyword';

/**
 * 특정 사용자의 키워드 목록 조회
 */
export async function getKeywordsByEmployeeId(employeeId: string): Promise<Keyword[]> {
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('키워드 조회 오류:', error);
    throw error;
  }

  return data || [];
}

/**
 * 키워드 생성
 */
export async function createKeyword(
  employeeId: string,
  input: CreateKeywordInput
): Promise<Keyword> {
  const { data, error } = await supabase
    .from('keywords')
    .insert({
      employee_id: employeeId,
      text: input.text.trim(),
      category: input.category?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    // 중복 키워드 에러 처리
    if (error.code === '23505') {
      throw new Error('이미 등록된 키워드입니다');
    }
    console.error('키워드 생성 오류:', error);
    throw error;
  }

  return data;
}

/**
 * 키워드 삭제
 */
export async function deleteKeyword(keywordId: string): Promise<void> {
  const { error } = await supabase
    .from('keywords')
    .delete()
    .eq('id', keywordId);

  if (error) {
    console.error('키워드 삭제 오류:', error);
    throw error;
  }
}

/**
 * 사용자의 키워드 개수 조회
 */
export async function getKeywordCount(employeeId: string): Promise<number> {
  const { count, error } = await supabase
    .from('keywords')
    .select('*', { count: 'exact', head: true })
    .eq('employee_id', employeeId);

  if (error) {
    console.error('키워드 개수 조회 오류:', error);
    throw error;
  }

  return count || 0;
}

