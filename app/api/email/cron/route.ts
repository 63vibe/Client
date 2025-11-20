/**
 * 이메일 발송 Cron API Route (외부 cron 서비스용)
 * 
 * GET /api/email/cron - 외부 cron 서비스에서 호출하는 엔드포인트
 * 
 * 보안을 위해 API 키 인증이 필요합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runEmailJobManually } from '@/src/lib/email/scheduler';

export async function GET(request: NextRequest) {
  try {
    // API 키 인증 (필수)
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key');
    const expectedApiKey = process.env.EMAIL_API_KEY;

    if (!expectedApiKey) {
      console.error('EMAIL_API_KEY 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { 
          success: false,
          error: '서버 설정 오류: API 키가 설정되지 않았습니다.' 
        },
        { status: 500 }
      );
    }

    if (apiKey !== expectedApiKey) {
      console.warn('잘못된 API 키로 접근 시도:', request.headers.get('x-api-key') ? '헤더에 있음' : '없음');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized: 올바른 API 키가 필요합니다.' 
        },
        { status: 401 }
      );
    }

    // 비동기로 실행 (응답은 즉시 반환)
    runEmailJobManually().catch((error) => {
      console.error('이메일 발송 작업 실행 중 오류:', error);
    });

    return NextResponse.json({
      success: true,
      message: '이메일 발송 작업이 시작되었습니다.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('이메일 발송 Cron API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '이메일 발송 작업 시작 실패',
      },
      { status: 500 }
    );
  }
}

// POST 메서드도 지원 (일부 cron 서비스에서 POST 사용)
export async function POST(request: NextRequest) {
  return GET(request);
}

