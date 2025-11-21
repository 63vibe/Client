import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_ENDPOINT = 'https://uiwg30rlu7.execute-api.ap-northeast-2.amazonaws.com/default/emailSend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, subject, to } = body;

    // 입력값 검증
    if (!html || !subject || !to) {
      return NextResponse.json(
        { error: 'html, subject, to 필드가 모두 필요합니다' },
        { status: 400 }
      );
    }

    if (!to.includes('@')) {
      return NextResponse.json(
        { error: '올바른 이메일 주소를 입력해주세요' },
        { status: 400 }
      );
    }

    // Lambda로 전달할 payload
    const payload = {
      html,
      subject,
      to,
    };

    // 디버깅: 요청 바디 로깅
    console.log('[Test Email Lambda] 요청 바디:', JSON.stringify({ ...payload, html: html.substring(0, 100) + '...' }, null, 2));

    // Lambda 직접 호출
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // 디버깅: 응답 상태 로깅
    console.log('[Test Email Lambda] 응답 상태:', response.status, response.statusText);

    const data = await response.json().catch(() => ({}));

    // Lambda 응답 확인
    if (!response.ok || !data.success) {
      console.error('[Test Email Lambda] 에러 응답:', data);
      
      // AWS 권한 오류인 경우 더 명확한 메시지 제공
      let errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
      if (errorMessage.includes('not authorized') || errorMessage.includes('ses:SendEmail')) {
        errorMessage = 'AWS SES 권한 오류: Lambda 함수의 IAM 역할에 SES 이메일 발송 권한이 없습니다. AWS 콘솔에서 IAM 역할에 ses:SendEmail 권한을 추가해주세요.';
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          details: data.error || data.message
        },
        { status: response.ok ? 200 : response.status }
      );
    }

    // 디버깅: 응답 데이터 로깅
    console.log('[Test Email Lambda] 응답 데이터:', JSON.stringify(data, null, 2));

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      message: '테스트 메일 발송 완료',
      data,
    });
  } catch (error) {
    console.error('테스트 이메일 Lambda 호출 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '테스트 이메일 발송 중 오류가 발생했습니다' 
      },
      { status: 500 }
    );
  }
}

