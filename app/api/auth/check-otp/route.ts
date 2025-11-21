import { NextRequest, NextResponse } from 'next/server';
import { CheckOTPRequest, CheckOTPResponse } from '@/src/types/auth';

const CHECK_OTP_API_URL = 'https://hsi.cleverse.kr/api/auth/checkOTP';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otpId, otp, userId } = body;

    // 입력값 검증
    if (!otpId || !otp || !userId) {
      return NextResponse.json(
        { error: 'OTP ID, OTP 코드, 사용자 ID가 모두 필요합니다' },
        { status: 400 }
      );
    }

    // OTP 검증 API 호출
    const requestBody: CheckOTPRequest = {
      otpId,
      otp,
      userId,
    };

    // 디버깅: 요청 바디 로깅
    console.log('[Check OTP] 요청 바디:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(CHECK_OTP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // 디버깅: 응답 상태 로깅
    console.log('[Check OTP] 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Check OTP] 에러 응답:', errorText);
      return NextResponse.json(
        { error: `OTP 검증 요청 실패: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data: CheckOTPResponse = await response.json();
    
    // 디버깅: 응답 데이터 로깅
    console.log('[Check OTP] 응답 데이터:', JSON.stringify(data, null, 2));

    // 응답 반환
    return NextResponse.json(data);
  } catch (error) {
    console.error('OTP 검증 API 오류:', error);
    return NextResponse.json(
      { error: 'OTP 검증 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

