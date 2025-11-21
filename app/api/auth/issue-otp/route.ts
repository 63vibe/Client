import { NextRequest, NextResponse } from 'next/server';
import { IssueOTPRequest, IssueOTPResponse } from '@/src/types/auth';

const OTP_API_URL = 'https://hsi.cleverse.kr/api/auth/issueOTP';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, selectedRecvType, otpId, locale } = body;

    // 입력값 검증
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // OTP 발송 API 호출
    const requestBody: IssueOTPRequest = {
      userId,
      selectedRecvType: selectedRecvType ?? 0,
      otpId: otpId ?? '',
      locale: locale ?? 'ko',
    };

    // 디버깅: 요청 바디 로깅
    console.log('[Issue OTP] 요청 바디:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(OTP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // 디버깅: 응답 상태 로깅
    console.log('[Issue OTP] 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Issue OTP] 에러 응답:', errorText);
      return NextResponse.json(
        { error: `OTP 발송 요청 실패: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data: IssueOTPResponse = await response.json();
    
    // 디버깅: 응답 데이터 로깅
    console.log('[Issue OTP] 응답 데이터:', JSON.stringify(data, null, 2));

    // 응답 반환
    return NextResponse.json(data);
  } catch (error) {
    console.error('OTP 발송 API 오류:', error);
    return NextResponse.json(
      { error: 'OTP 발송 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

