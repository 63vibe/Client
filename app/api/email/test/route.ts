/**
 * 이메일 연결 테스트 API Route
 * 
 * GET /api/email/test - SMTP 연결 테스트
 */

import { NextRequest, NextResponse } from 'next/server';
import { testEmailConnection } from '@/src/lib/email/emailService';

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

    const isConnected = await testEmailConnection();

    return NextResponse.json({
      success: isConnected,
      message: isConnected
        ? 'SMTP 연결이 성공했습니다.'
        : 'SMTP 연결에 실패했습니다.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('이메일 테스트 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'SMTP 연결 테스트 실패',
      },
      { status: 500 }
    );
  }
}

