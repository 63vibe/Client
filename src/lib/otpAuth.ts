import { IssueOTPResponse, CheckOTPResponse } from '@/src/types/auth';

/**
 * OTP 발송 API 호출 (서버 사이드 API Route를 통해 호출)
 */
export async function issueOTP(userId: string): Promise<IssueOTPResponse> {
  const response = await fetch('/api/auth/issue-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      userId,
      selectedRecvType: 0,
      otpId: '',
      locale: 'ko'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `OTP 발송 요청 실패: ${response.status}`);
  }

  const data: IssueOTPResponse = await response.json();
  return data;
}

/**
 * OTP 검증 API 호출 (서버 사이드 API Route를 통해 호출)
 */
export async function checkOTP(
  otpId: string,
  otp: string,
  userId: string
): Promise<CheckOTPResponse> {
  const response = await fetch('/api/auth/check-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ otpId, otp, userId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `OTP 검증 요청 실패: ${response.status}`);
  }

  const data: CheckOTPResponse = await response.json();
  return data;
}

