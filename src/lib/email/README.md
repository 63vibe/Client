# 이메일 자동 발송 기능

매일 오전 09:00에 활성 유저들에게 하루치 게시물을 정리한 이메일을 자동으로 발송하는 기능입니다.

## 배포 환경별 가이드

- **로컬/서버 배포**: [기본 README](./README.md) 참고
- **AWS Amplify 배포**: [AMPLIFY_DEPLOY.md](./AMPLIFY_DEPLOY.md) 참고
- **AWS Lambda + EventBridge**: [../aws-lambda/README.md](../../aws-lambda/README.md) 참고

## 기능

- ✅ 매일 오전 09:00 (KST) 자동 이메일 발송
- ✅ DB에서 활성 유저 이메일 목록 조회
- ✅ 각 유저의 키워드 기반 게시물 필터링
- ✅ HTML 템플릿 기반 이메일 발송
- ✅ 재시도 로직 (최대 3회)
- ✅ 상세한 로그 기록

## 파일 구조

```
src/lib/email/
├── types.ts              # 타입 정의
├── dataService.ts        # DB 데이터 조회 서비스
├── templates.ts          # HTML 이메일 템플릿
├── emailService.ts       # 이메일 발송 서비스
├── scheduler.ts          # 스케줄러 모듈
└── config.example.ts     # 설정 예시

scripts/
└── start-scheduler.ts    # 스케줄러 실행 스크립트

app/api/email/
├── send/route.ts         # 수동 이메일 발송 API
└── test/route.ts         # SMTP 연결 테스트 API
```

## 설정

### 1. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
# SMTP 설정
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@company.com
FROM_NAME=뉴스레터 시스템

# 스케줄러 설정 (선택사항)
EMAIL_CRON_EXPRESSION=0 0 * * *  # 기본값: 매일 UTC 00:00 (KST 09:00)

# API 보안 (선택사항)
EMAIL_API_KEY=your-secret-api-key
```

### 2. Gmail 사용 시

1. Google 계정에서 2단계 인증 활성화
2. [앱 비밀번호 생성](https://myaccount.google.com/apppasswords)
3. 생성된 앱 비밀번호를 `SMTP_PASSWORD`에 설정

### 3. 데이터베이스 스키마

다음 테이블과 컬럼이 필요합니다:

**users 테이블:**
- `employee_id` (string)
- `email` (string)
- `name` (string)
- `is_active` (boolean) - 활성 유저 여부

**posts 테이블 (또는 실제 게시물 테이블명):**
- `id` 또는 `post_id` (string)
- `board` 또는 `board_name` (string)
- `title` 또는 `subject` (string)
- `summary` 또는 `content` (string)
- `author` 또는 `author_name` (string)
- `created_at` (timestamp)
- `views` 또는 `view_count` (number)
- `keywords` (array, 선택사항)
- `url` 또는 `link` (string, 선택사항)

**keywords 테이블:**
- `employee_id` (string)
- `text` (string)

> **참고:** `dataService.ts`의 `getDailyPosts()` 함수에서 실제 테이블명과 컬럼명에 맞게 수정이 필요할 수 있습니다.

## 사용법

### 1. 스케줄러 실행

스케줄러를 별도 프로세스로 실행하여 매일 자동으로 이메일을 발송합니다:

```bash
npm run scheduler
```

프로세스를 종료하려면 `Ctrl+C`를 누르세요.

### 2. 수동 이메일 발송

API를 통해 수동으로 이메일 발송 작업을 실행할 수 있습니다:

```bash
# API 키가 설정된 경우
curl -H "x-api-key: your-secret-api-key" http://localhost:3000/api/email/send

# API 키가 설정되지 않은 경우
curl http://localhost:3000/api/email/send
```

### 3. SMTP 연결 테스트

SMTP 설정이 올바른지 테스트합니다:

```bash
curl http://localhost:3000/api/email/test
```

## 프로덕션 배포

### PM2 사용 (권장)

```bash
# PM2 설치
npm install -g pm2

# 스케줄러 실행
pm2 start npm --name "email-scheduler" -- run scheduler

# 자동 재시작 설정
pm2 startup
pm2 save
```

### systemd 사용 (Linux)

`/etc/systemd/system/email-scheduler.service` 파일 생성:

```ini
[Unit]
Description=Email Scheduler Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/project
ExecStart=/usr/bin/npm run scheduler
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

서비스 시작:

```bash
sudo systemctl enable email-scheduler
sudo systemctl start email-scheduler
```

### Docker 사용

Dockerfile에 스케줄러 실행 명령 추가하거나, 별도 컨테이너로 실행:

```dockerfile
# 스케줄러 전용 컨테이너
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "scheduler"]
```

## 로그

스케줄러는 콘솔에 상세한 로그를 출력합니다:

- 작업 시작/완료 시간
- 처리된 유저 수
- 발송 성공/실패 건수
- 실패한 이메일 주소
- 에러 메시지

프로덕션 환경에서는 로그를 파일로 저장하거나 로그 관리 시스템에 전송하는 것을 권장합니다.

## 문제 해결

### 이메일이 발송되지 않는 경우

1. **SMTP 설정 확인**
   ```bash
   curl http://localhost:3000/api/email/test
   ```

2. **환경 변수 확인**
   - `.env.local` 파일이 올바른 위치에 있는지 확인
   - 환경 변수가 올바르게 설정되었는지 확인

3. **로그 확인**
   - 스케줄러 콘솔 출력 확인
   - 에러 메시지 확인

4. **데이터베이스 확인**
   - `users` 테이블에 `is_active=true`인 유저가 있는지 확인
   - `email` 필드가 NULL이 아닌지 확인
   - 게시물 데이터가 있는지 확인

### 게시물이 필터링되지 않는 경우

- `dataService.ts`의 `getDailyPosts()` 함수에서 실제 테이블명과 컬럼명을 확인
- 키워드 매칭 로직이 올바른지 확인

## 보안 고려사항

- API Route에 접근 제어를 추가하려면 `EMAIL_API_KEY` 환경 변수를 설정하세요
- SMTP 비밀번호는 절대 코드에 하드코딩하지 마세요
- 프로덕션 환경에서는 HTTPS를 사용하세요

