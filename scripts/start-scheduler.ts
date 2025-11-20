/**
 * 이메일 스케줄러 실행 스크립트
 * 
 * 사용법:
 *   npm run scheduler
 *   또는
 *   ts-node scripts/start-scheduler.ts
 */

import { startEmailScheduler } from '../src/lib/email/scheduler';

console.log('이메일 스케줄러 서버를 시작합니다...');
console.log('프로세스를 종료하려면 Ctrl+C를 누르세요.\n');

// 스케줄러 시작
startEmailScheduler();

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n프로세스 종료 신호를 받았습니다. 스케줄러를 정리합니다...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n프로세스 종료 신호를 받았습니다. 스케줄러를 정리합니다...');
  process.exit(0);
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('처리되지 않은 예외:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
  process.exit(1);
});

