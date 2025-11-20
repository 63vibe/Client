/**
 * 이메일 발송 스케줄러
 */

import * as cron from 'node-cron';
import { getUserPostsData } from './dataService';
import { sendEmailsToUsers } from './emailService';

let scheduledTask: cron.ScheduledTask | null = null;

/**
 * 매일 오전 09:00에 이메일 발송 작업 실행
 */
async function runDailyEmailJob(): Promise<void> {
  const startTime = new Date();
  console.log('========================================');
  console.log(`[${startTime.toISOString()}] 일일 이메일 발송 작업 시작`);

  try {
    // 1. 유저별 게시물 데이터 조회
    console.log('유저별 게시물 데이터 조회 중...');
    const userPostsList = await getUserPostsData();

    // 게시물이 있는 유저만 필터링
    const usersWithPosts = userPostsList.filter((item) => item.posts.length > 0);

    if (usersWithPosts.length === 0) {
      console.log('발송할 게시물이 있는 유저가 없습니다.');
      return;
    }

    console.log(`게시물이 있는 유저 수: ${usersWithPosts.length}`);

    // 2. 이메일 발송
    const results = await sendEmailsToUsers(usersWithPosts, 1000); // 이메일 간 1초 지연

    // 3. 결과 로깅
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log('========================================');
    console.log(`[${endTime.toISOString()}] 일일 이메일 발송 작업 완료`);
    console.log(`소요 시간: ${duration.toFixed(2)}초`);
    console.log(`성공: ${results.success}건`);
    console.log(`실패: ${results.failed}건`);

    if (results.failedEmails.length > 0) {
      console.log(`실패한 이메일: ${results.failedEmails.join(', ')}`);
    }
    console.log('========================================');
  } catch (error: any) {
    const endTime = new Date();
    console.error('========================================');
    console.error(`[${endTime.toISOString()}] 일일 이메일 발송 작업 실패`);
    console.error('에러:', error.message);
    console.error(error.stack);
    console.error('========================================');
  }
}

/**
 * 스케줄러 시작
 * 매일 오전 09:00 (KST)에 실행
 */
export function startEmailScheduler(): void {
  if (scheduledTask) {
    console.warn('이메일 스케줄러가 이미 실행 중입니다.');
    return;
  }

  // 크론 표현식: 매일 오전 09:00 (한국 시간 기준)
  // timezone이 'Asia/Seoul'로 설정되어 있으므로 크론 표현식은 한국 시간 기준으로 해석됨
  // '0 9 * * *' = 매일 오전 09:00 (한국 시간)
  const cronExpression = process.env.EMAIL_CRON_EXPRESSION || '0 9 * * *'; // 기본값: 매일 오전 09:00 KST

  console.log(`이메일 스케줄러 시작: ${cronExpression} (매일 오전 09:00 KST)`);
  console.log('현재 시간:', new Date().toISOString());

  scheduledTask = cron.schedule(cronExpression, async () => {
    await runDailyEmailJob();
  }, {
    timezone: 'Asia/Seoul', // 한국 시간대
  });

  console.log('이메일 스케줄러가 성공적으로 시작되었습니다.');
}

/**
 * 스케줄러 중지
 */
export function stopEmailScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('이메일 스케줄러가 중지되었습니다.');
  } else {
    console.warn('실행 중인 이메일 스케줄러가 없습니다.');
  }
}

/**
 * 수동으로 이메일 발송 작업 실행 (테스트용)
 */
export async function runEmailJobManually(): Promise<void> {
  console.log('수동으로 이메일 발송 작업을 실행합니다...');
  await runDailyEmailJob();
}

