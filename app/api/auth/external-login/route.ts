import { NextRequest, NextResponse } from 'next/server';
import { ExternalAuthRequest, ExternalAuthResponse } from '@/src/types/auth';

const AUTH_API_URL = 'https://hsi.cleverse.kr/api/auth/authenticate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, password, otpId, otp, domain } = body;

    // 입력값 검증
    if (!userId || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    // 외부 인증 API 호출
    const requestBody: ExternalAuthRequest = {
      userId,
      password,
      domain: domain || 'hsi.cleverse.kr',
    };

    // OTP 값이 있는 경우에만 추가
    if (otpId && otp) {
      requestBody.otpId = otpId;
      requestBody.otp = otp;
    }

    // 디버깅: 요청 바디 로깅
    console.log('[External Login] 요청 바디:', JSON.stringify(requestBody, null, 2));

    // OTP 값이 있으면 Cookie 헤더에 추가
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (otpId && otp) {
      const cookieKey = `otpconfirmed_${userId}`;
      const cookieValue = `${otpId}_${otp}`;
      headers['Cookie'] = `${cookieKey}=${cookieValue}`;
      console.log('[External Login] Cookie 설정:', `${cookieKey}=${cookieValue}`);
    }

    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    // 디버깅: 응답 상태 로깅
    console.log('[External Login] 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[External Login] 에러 응답:', errorText);
      return NextResponse.json(
        { error: `인증 요청 실패: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data: ExternalAuthResponse = await response.json();
    
    // 디버깅: 응답 데이터 로깅
    console.log('[External Login] 응답 데이터:', JSON.stringify(data, null, 2));

    // 응답 반환
    return NextResponse.json(data);
  } catch (error) {
    console.error('외부 인증 API 오류:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

