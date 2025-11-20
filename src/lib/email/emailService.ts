/**
 * 이메일 발송 서비스
 */

import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { UserEmail, Post, EmailConfig } from './types';
import { generateEmailHTML, generateEmailText } from './templates';

/**
 * 이메일 설정 로드
 */
function getEmailConfig(): EmailConfig {
  const config: EmailConfig = {
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
 * Nodemailer Transporter 생성
 */
function createTransporter(): Transporter {
  const config = getEmailConfig();

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  });
}

/**
 * 이메일 발송 (재시도 로직 포함)
 */
async function sendEmailWithRetry(
  transporter: Transporter,
  to: string,
  subject: string,
  html: string,
  text: string,
  maxRetries: number = 3,
  retryDelay: number = 5000
): Promise<boolean> {
  const config = getEmailConfig();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`이메일 발송 성공 [${to}]:`, info.messageId);
      return true;
    } catch (error: any) {
      console.error(`이메일 발송 실패 [${to}] (시도 ${attempt}/${maxRetries}):`, error.message);

      if (attempt < maxRetries) {
        console.log(`${retryDelay / 1000}초 후 재시도...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        // 재시도 시 지연 시간 증가 (exponential backoff)
        retryDelay *= 1.5;
      } else {
        console.error(`이메일 발송 최종 실패 [${to}]:`, error);
        return false;
      }
    }
  }

  return false;
}

/**
 * 단일 유저에게 이메일 발송
 */
export async function sendEmailToUser(user: UserEmail, posts: Post[]): Promise<boolean> {
  try {
    // 게시물이 없으면 발송하지 않음
    if (posts.length === 0) {
      console.log(`유저 ${user.email}에게 발송할 게시물이 없어 이메일을 발송하지 않습니다.`);
      return true; // 에러가 아니므로 true 반환
    }

    const transporter = createTransporter();
    const subject = `[뉴스레터] ${new Date().toLocaleDateString('ko-KR')} 일일 요약 (${posts.length}개)`;
    const html = generateEmailHTML(user, posts);
    const text = generateEmailText(user, posts);

    return await sendEmailWithRetry(transporter, user.email, subject, html, text);
  } catch (error: any) {
    console.error(`유저 ${user.email}에게 이메일 발송 중 오류:`, error.message);
    return false;
  }
}

/**
 * 여러 유저에게 순차적으로 이메일 발송
 */
export async function sendEmailsToUsers(
  users: Array<{ user: UserEmail; posts: Post[] }>,
  delayBetweenEmails: number = 1000
): Promise<{ success: number; failed: number; failedEmails: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    failedEmails: [] as string[],
  };

  console.log(`총 ${users.length}명의 유저에게 이메일 발송을 시작합니다.`);

  for (let i = 0; i < users.length; i++) {
    const { user, posts } = users[i];
    console.log(`[${i + 1}/${users.length}] ${user.email}에게 이메일 발송 중...`);

    const success = await sendEmailToUser(user, posts);

    if (success) {
      results.success++;
    } else {
      results.failed++;
      results.failedEmails.push(user.email);
    }

    // 마지막 이메일이 아니면 지연
    if (i < users.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenEmails));
    }
  }

  console.log(`이메일 발송 완료: 성공 ${results.success}건, 실패 ${results.failed}건`);

  return results;
}

/**
 * SMTP 연결 테스트
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('SMTP 연결 테스트 성공');
    return true;
  } catch (error: any) {
    console.error('SMTP 연결 테스트 실패:', error.message);
    return false;
  }
}

