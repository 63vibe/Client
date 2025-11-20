import { supabase } from './supabase';

export interface UserDomain {
  id: string;
  employee_id: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

/**
 * 특정 사용자의 선택한 도메인 목록 조회
 */
export async function getUserDomainsByEmployeeId(employeeId: string): Promise<UserDomain[]> {
  const { data, error } = await supabase
    .from('user_domains')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('사용자 도메인 조회 오류:', error);
    throw error;
  }

  return data || [];
}

/**
 * 사용자의 도메인 추가
 */
export async function addUserDomain(employeeId: string, domain: string): Promise<UserDomain> {
  const { data, error } = await supabase
    .from('user_domains')
    .insert({
      employee_id: employeeId,
      domain: domain,
    })
    .select()
    .single();

  if (error) {
    // 중복 도메인 에러 처리
    if (error.code === '23505') {
      throw new Error('이미 등록된 도메인입니다');
    }
    console.error('도메인 추가 오류:', error);
    throw error;
  }

  return data;
}

/**
 * 사용자의 도메인 삭제
 */
export async function deleteUserDomain(domainId: string): Promise<void> {
  const { error } = await supabase
    .from('user_domains')
    .delete()
    .eq('id', domainId);

  if (error) {
    console.error('도메인 삭제 오류:', error);
    throw error;
  }
}

/**
 * 사용자의 모든 도메인 삭제 후 새로 추가 (전체 교체)
 */
export async function replaceUserDomains(employeeId: string, domains: string[]): Promise<void> {
  // 기존 도메인 모두 삭제
  const { error: deleteError } = await supabase
    .from('user_domains')
    .delete()
    .eq('employee_id', employeeId);

  if (deleteError) {
    console.error('기존 도메인 삭제 오류:', deleteError);
    throw deleteError;
  }

  // 새 도메인 추가
  if (domains.length > 0) {
    const newDomains = domains.map(domain => ({
      employee_id: employeeId,
      domain: domain,
    }));

    const { error: insertError } = await supabase
      .from('user_domains')
      .insert(newDomains);

    if (insertError) {
      console.error('도메인 추가 오류:', insertError);
      throw insertError;
    }
  }
}

