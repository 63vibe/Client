/**
 * 이메일 발송 API Route (수동 실행용)
 * 
 * GET /api/email/send - 수동으로 이메일 발송 작업 실행
 */

import { NextRequest, NextResponse } from 'next/server';
import { runEmailJobManually } from '@/src/lib/email/scheduler';

export async function GET(request: NextRequest) {
  try {
    // 보안을 위해 API 키 확인 (선택사항)
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.EMAIL_API_KEY;

    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
    console.error('이메일 발송 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '이메일 발송 작업 시작 실패',
      },
      { status: 500 }
    );
  }
}

