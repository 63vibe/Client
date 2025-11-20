# 배포 가이드

이 프로젝트는 여러 배포 환경을 지원합니다.

## 배포 환경별 가이드

### 1. AWS Amplify (현재 설정)

Amplify는 서버리스 환경이므로 별도의 스케줄러 프로세스를 실행할 수 없습니다.

**추천 방법**: 외부 cron 서비스 사용

- 📖 [Amplify 배포 가이드](./src/lib/email/AMPLIFY_DEPLOY.md)
- ✅ `amplify.yml` 파일 포함
- ✅ Cron API 엔드포인트: `/api/email/cron`

**빠른 시작**:
1. Amplify 콘솔에서 환경 변수 설정
2. cron-job.org에서 매일 09:00에 `/api/email/cron` 호출 설정
3. 완료!

### 2. 로컬/서버 배포

전용 서버나 VPS에서 실행하는 경우:

- 📖 [기본 README](./src/lib/email/README.md)
- ✅ `npm run scheduler` 명령으로 스케줄러 실행
- ✅ PM2 또는 systemd로 백그라운드 실행 가능

### 3. AWS Lambda + EventBridge

더 안정적인 AWS 네이티브 솔루션:

- 📖 [Lambda 설정 가이드](./aws-lambda/README.md)
- ✅ Lambda 함수 코드 포함
- ✅ EventBridge 규칙 설정 가이드

## 환경 변수 설정

모든 배포 환경에서 다음 환경 변수가 필요합니다:

```env
# SMTP 설정 (필수)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@company.com
FROM_NAME=뉴스레터 시스템

# API 보안 (Amplify/Lambda 사용 시 필수)
EMAIL_API_KEY=your-secure-random-api-key
```

## 배포 체크리스트

### Amplify 배포 전

- [ ] `amplify.yml` 파일 확인
- [ ] Amplify 콘솔에서 환경 변수 설정
- [ ] `EMAIL_API_KEY` 생성 및 설정
- [ ] 배포 후 API 엔드포인트 테스트
- [ ] 외부 cron 서비스 설정

### 로컬/서버 배포 전

- [ ] `.env.local` 파일 생성
- [ ] 환경 변수 설정
- [ ] `npm install` 실행
- [ ] `npm run scheduler` 테스트
- [ ] PM2/systemd 설정 (프로덕션)

### Lambda 배포 전

- [ ] Lambda 함수 생성
- [ ] 환경 변수 설정
- [ ] EventBridge 규칙 생성
- [ ] 테스트 실행

## API 엔드포인트

배포 후 다음 엔드포인트를 사용할 수 있습니다:

- `GET /api/email/test` - SMTP 연결 테스트
- `GET /api/email/send` - 수동 이메일 발송 (API 키 선택사항)
- `GET /api/email/cron` - Cron 서비스용 (API 키 필수)

## 문제 해결

각 배포 환경별 문제 해결 가이드는 해당 README 파일을 참고하세요.

## 다음 단계

1. 배포 환경 선택
2. 해당 환경의 가이드 읽기
3. 환경 변수 설정
4. 배포 및 테스트

