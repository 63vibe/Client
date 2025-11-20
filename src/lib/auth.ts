import { LoginResponse } from '@/src/types/user';

const USER_STORAGE_KEY = 'user';

/**
 * 로그인한 사용자 정보를 localStorage에 저장
 */
export function saveUserToStorage(user: LoginResponse): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

/**
 * localStorage에서 사용자 정보 가져오기
 */
export function getUserFromStorage(): LoginResponse | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr) as LoginResponse;
  } catch (error) {
    console.error('사용자 정보 파싱 오류:', error);
    return null;
  }
}

/**
 * localStorage에서 사용자 정보 삭제 (로그아웃)
 */
export function removeUserFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * 로그인 상태 확인
 */
export function isAuthenticated(): boolean {
  return getUserFromStorage() !== null;
}

