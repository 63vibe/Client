/**
 * 테스트 이메일 발송 API Route
 * 
 * POST /api/email/test-send - 로그인한 유저에게 테스트 이메일 발송
 * 입력된 이메일 주소로 write_date가 24시간 이내인 게시물들을 HTML로 구성해서 발송
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { sendEmailToUser } from '@/src/lib/email/emailService';
import { UserEmail, Post } from '@/src/lib/email/types';

/**
 * 24시간 이내의 게시물 조회
 */
async function getRecentPosts(): Promise<Post[]> {
  try {
    // 24시간 전 시간 계산
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // ISO 형식으로 변환
    const cutoffTime = twentyFourHoursAgo.toISOString();

    // articles 테이블에서 write_date가 24시간 이내인 게시물 조회
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .gte('write_date', cutoffTime)
      .order('write_date', { ascending: false });

    if (error) {
      console.error('게시물 조회 오류:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('24시간 이내 게시물이 없습니다.');
      return [];
    }

    // Article 타입을 Post 타입으로 변환
    return data.map((article: any) => ({
      id: article.article_id || String(article.article_id) || '',
      board: article.board_name || '기타',
      title: article.subject || '제목 없음',
      summary: article.content_summary || article.original_content?.substring(0, 200) || '',
      keywords: [], // 키워드는 별도로 관리되는 것으로 보임
      author: article.user_name || '알 수 없음',
      date: article.write_date ? article.write_date.split('T')[0] : new Date().toISOString().split('T')[0],
      views: article.views || 0,
      isNew: true, // 24시간 이내이므로 모두 새 게시물
      matchedKeywords: [],
      source: 'board' as const,
    }));
  } catch (error) {
    console.error('최근 게시물 조회 실패:', error);
    return [];
  }
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

    // 24시간 이내 게시물 조회
    const recentPosts = await getRecentPosts();

    if (recentPosts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '24시간 이내 게시물이 없습니다.',
        },
        { status: 404 }
      );
    }

    // 테스트 이메일 발송
    const testUser: UserEmail = {
      employee_id: userData.employee_id,
      email: userEmail,
      name: userData.name || '사용자',
    };

    const success = await sendEmailToUser(testUser, recentPosts);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `테스트 이메일이 발송되었습니다. (${recentPosts.length}개 게시물)`,
        email: userEmail,
        postCount: recentPosts.length,
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

