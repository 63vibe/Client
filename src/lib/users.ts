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

/**
 * 사용자의 accessToken 업데이트
 */
export async function updateUserAccessToken(employeeId: string, accessToken: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ access_token: accessToken })
    .eq('employee_id', employeeId);

  if (error) {
    console.error('accessToken 업데이트 오류:', error);
    throw error;
  }
}

/**
 * 새 사용자 생성 (회원가입)
 */
export async function createUser(
  employeeId: string,
  name: string,
  accessToken: string,
  email?: string,
  role: 'user' | 'admin' = 'user'
): Promise<void> {
  const userData: {
    employee_id: string;
    name: string;
    role: 'user' | 'admin';
    access_token: string;
    email?: string;
  } = {
    employee_id: employeeId,
    name: name,
    role: role,
    access_token: accessToken,
  };

  // email이 있으면 추가
  if (email) {
    userData.email = email;
  }

  const { error } = await supabase
    .from('users')
    .insert(userData);

  if (error) {
    console.error('사용자 생성 오류:', error);
    throw error;
  }
}

/**
 * 사용자가 존재하는지 확인하고, 없으면 생성하고, 있으면 accessToken 업데이트
 */
export async function ensureUserAndUpdateToken(
  employeeId: string,
  name: string,
  accessToken: string,
  email?: string,
  role: 'user' | 'admin' = 'user'
): Promise<void> {
  // 사용자 존재 여부 확인
  const existingUser = await getUserByEmployeeId(employeeId);
  
  if (!existingUser) {
    // 사용자가 없으면 새로 생성
    await createUser(employeeId, name, accessToken, email, role);
  } else {
    // 사용자가 있으면 accessToken만 업데이트
    await updateUserAccessToken(employeeId, accessToken);
  }
}

