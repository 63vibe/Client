import { ExternalAuthResponse } from '@/src/types/auth';

/**
 * 외부 인증 API 호출 (서버 사이드 API Route를 통해 호출)
 */
export async function authenticateExternal(
  userId: string,
  password: string,
  otpId?: string,
  otp?: string
): Promise<ExternalAuthResponse> {
  const requestBody: { userId: string; password: string; domain: string; otpId?: string; otp?: string } = {
    userId,
    password,
    domain: 'hsi.cleverse.kr',
  };

  // OTP 값이 있는 경우에만 추가
  if (otpId && otp) {
    requestBody.otpId = otpId;
    requestBody.otp = otp;
  }

  const response = await fetch('/api/auth/external-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `인증 요청 실패: ${response.status}`);
  }

  const data: ExternalAuthResponse = await response.json();
  return data;
}

/**
 * accessToken을 localStorage에 저장
 */
export function saveAccessTokenToStorage(accessToken: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('external_access_token', accessToken);
  }
}

/**
 * localStorage에서 accessToken 가져오기
 */
export function getAccessTokenFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem('external_access_token');
  } catch (error) {
    console.error('AccessToken 조회 오류:', error);
    return null;
  }
}

/**
 * localStorage에서 accessToken 삭제
 */
export function removeAccessTokenFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('external_access_token');
  }
}

