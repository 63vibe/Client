/**
 * 테스트 이메일 발송 API Route
 * 
 * POST /api/email/test-send - 로그인한 유저에게 테스트 이메일 발송
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { sendEmailToUser } from '@/src/lib/email/emailService';
import { UserEmail, Post } from '@/src/lib/email/types';

/**
 * 테스트용 더미 게시물 생성
 */
function createTestPost(): Post {
  return {
    id: 'test-1',
    board: '테스트',
    title: '테스트 이메일 발송 확인',
    summary: '이 이메일은 뉴스레터 시스템의 테스트 이메일입니다. 정상적으로 수신되었다면 이메일 발송 기능이 올바르게 작동하고 있습니다.',
    keywords: ['테스트'],
    author: '시스템',
    date: new Date().toISOString().split('T')[0],
    views: 0,
    isNew: true,
    matchedKeywords: ['테스트'],
    source: 'board',
  };
}

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 employee_id 가져오기
    const body = await request.json();
    const { employee_id, email } = body;

    if (!employee_id || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'employee_id와 email이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 유저 정보 확인
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('employee_id, email, name')
      .eq('employee_id', employee_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        {
          success: false,
          error: '유저를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 이메일 주소 확인
    const userEmail = email || userData.email;
    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: '유저의 이메일 주소가 설정되지 않았습니다.',
        },
        { status: 400 }
      );
    }

    // 테스트 이메일 발송
    const testUser: UserEmail = {
      employee_id: userData.employee_id,
      email: userEmail,
      name: userData.name || '사용자',
    };

    const testPost = createTestPost();
    const success = await sendEmailToUser(testUser, [testPost]);

    if (success) {
      return NextResponse.json({
        success: true,
        message: '테스트 이메일이 발송되었습니다.',
        email: userEmail,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '이메일 발송에 실패했습니다. SMTP 설정을 확인해주세요.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('테스트 이메일 발송 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '테스트 이메일 발송 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

