/**
 * 이메일 발송 Server Actions
 * 프론트엔드에서 직접 호출 가능한 서버 액션
 */

'use server';

import { supabase } from '@/src/lib/supabase';
import nodemailer from 'nodemailer';
import { Post } from './types';
import { generateEmailHTML, generateEmailText } from './templates';

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
      keywords: [],
      author: article.user_name || '알 수 없음',
      date: article.write_date ? article.write_date.split('T')[0] : new Date().toISOString().split('T')[0],
      views: article.views || 0,
      isNew: true,
      matchedKeywords: [],
      source: 'board' as const,
    }));
  } catch (error) {
    console.error('최근 게시물 조회 실패:', error);
    return [];
  }
}

/**
 * 이메일 설정 로드
 */
function getEmailConfig() {
  const config = {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@company.com',
    fromName: process.env.FROM_NAME || '뉴스레터 시스템',
  };

  if (!config.smtpUser || !config.smtpPassword) {
    throw new Error('SMTP 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.');
  }

  return config;
}

/**
 * 테스트 이메일 발송 (Server Action)
 * 프론트엔드에서 직접 호출 가능
 */
export async function sendTestEmail(
  employeeId: string,
  email: string,
  userName?: string
): Promise<{ success: boolean; message: string; postCount?: number }> {
  try {
    // 유저 정보 확인
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('employee_id, email, name')
      .eq('employee_id', employeeId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message: '유저를 찾을 수 없습니다.',
      };
    }

    // 이메일 주소 확인
    const userEmail = email || userData.email;
    if (!userEmail) {
      return {
        success: false,
        message: '이메일 주소가 설정되지 않았습니다.',
      };
    }

    // 24시간 이내 게시물 조회
    const recentPosts = await getRecentPosts();

    if (recentPosts.length === 0) {
      return {
        success: false,
        message: '24시간 이내 게시물이 없습니다.',
      };
    }

    // SMTP 설정
    const config = getEmailConfig();

    // Nodemailer Transporter 생성
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });

    // 이메일 내용 생성
    const subject = `[뉴스레터] ${new Date().toLocaleDateString('ko-KR')} 테스트 이메일 (${recentPosts.length}개 게시물)`;
    const html = generateEmailHTML(
      {
        employee_id: userData.employee_id,
        email: userEmail,
        name: userName || userData.name || '사용자',
      },
      recentPosts
    );
    const text = generateEmailText(
      {
        employee_id: userData.employee_id,
        email: userEmail,
        name: userName || userData.name || '사용자',
      },
      recentPosts
    );

    // 이메일 발송
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: userEmail,
      subject,
      text,
      html,
    });

    console.log(`테스트 이메일 발송 성공 [${userEmail}]:`, info.messageId);

    return {
      success: true,
      message: `테스트 이메일이 발송되었습니다. (${recentPosts.length}개 게시물)`,
      postCount: recentPosts.length,
    };
  } catch (error: any) {
    console.error('테스트 이메일 발송 오류:', error);
    return {
      success: false,
      message: error.message || '테스트 이메일 발송 중 오류가 발생했습니다.',
    };
  }
}

