import { supabase } from './supabase';
import { LoginResponse } from '@/src/types/user';

/**
 * 사번으로 사용자 조회 (로그인용)
 */
export async function getUserByEmployeeId(employeeId: string): Promise<LoginResponse | null> {
  const { data, error } = await supabase
    .from('users')
    .select('employee_id, name, role')
    .eq('employee_id', employeeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 사용자를 찾을 수 없음
      return null;
    }
    console.error('사용자 조회 오류:', error);
    throw error;
  }

  return data;
}

