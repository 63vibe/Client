# AWS Amplify 배포 가이드

AWS Amplify는 서버리스 환경이므로 별도의 스케줄러 프로세스를 실행할 수 없습니다. 대신 **외부 cron 서비스**를 사용하여 API를 호출하는 방식을 사용합니다.

## 배포 전 준비사항

### 1. Amplify 빌드 설정

프로젝트 루트에 `amplify.yml` 파일이 이미 생성되어 있습니다. Amplify는 자동으로 이 파일을 인식합니다.

### 2. 환경 변수 설정

Amplify 콘솔에서 다음 환경 변수를 설정하세요:

1. AWS Amplify 콘솔 접속
2. 앱 선택 → **App settings** → **Environment variables**
3. 다음 변수 추가:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@company.com
FROM_NAME=뉴스레터 시스템
EMAIL_API_KEY=your-very-secure-random-api-key-here
```

**중요**: `EMAIL_API_KEY`는 반드시 설정하세요. 외부 cron 서비스에서 API를 호출할 때 사용됩니다.

### 3. API 엔드포인트 확인

배포 후 다음 엔드포인트가 생성됩니다:
- `https://your-app.amplifyapp.com/api/email/cron` - Cron 서비스용 (API 키 필요)
- `https://your-app.amplifyapp.com/api/email/send` - 수동 실행용
- `https://your-app.amplifyapp.com/api/email/test` - SMTP 테스트용

## 외부 Cron 서비스 설정

### 옵션 1: cron-job.org (무료, 추천)

1. [cron-job.org](https://cron-job.org) 회원가입
2. **Create cronjob** 클릭
3. 설정:
   - **Title**: Daily Email Newsletter
   - **Address**: `https://your-app.amplifyapp.com/api/email/cron?api_key=YOUR_API_KEY`
   - **Schedule**: 매일 오전 09:00 (한국 시간)
     - Cron 표현식: `0 9 * * *` (KST 기준)
     - 또는 Timezone을 Asia/Seoul로 설정
   - **Request method**: GET
   - **Request headers**: 
     ```
     x-api-key: YOUR_API_KEY
     ```
4. 저장

### 옵션 2: EasyCron

1. [EasyCron](https://www.easycron.com) 회원가입
2. 새 Cron Job 생성
3. 설정:
   - **URL**: `https://your-app.amplifyapp.com/api/email/cron`
   - **HTTP Method**: GET
   - **HTTP Headers**: `x-api-key: YOUR_API_KEY`
   - **Schedule**: 매일 오전 09:00 KST

### 옵션 3: AWS EventBridge + Lambda (고급)

더 안정적인 방법을 원한다면 AWS Lambda 함수를 별도로 생성하고 EventBridge로 스케줄링할 수 있습니다.

#### Lambda 함수 생성

1. AWS Lambda 콘솔에서 새 함수 생성
2. Node.js 런타임 선택
3. 다음 코드 사용:

```javascript
const https = require('https');

exports.handler = async (event) => {
    const apiKey = process.env.EMAIL_API_KEY;
    const apiUrl = process.env.AMPLIFY_API_URL; // https://your-app.amplifyapp.com/api/email/cron
    
    return new Promise((resolve, reject) => {
        const url = new URL(apiUrl);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.end();
    });
};
```

4. 환경 변수 설정:
   - `EMAIL_API_KEY`: Amplify에서 설정한 것과 동일한 키
   - `AMPLIFY_API_URL`: Amplify 앱의 API URL

5. EventBridge 규칙 생성:
   - **Schedule expression**: `cron(0 0 * * ? *)` (UTC 00:00 = KST 09:00)
   - **Target**: 위에서 생성한 Lambda 함수

## 테스트

### 1. 배포 후 즉시 테스트

```bash
# SMTP 연결 테스트
curl https://your-app.amplifyapp.com/api/email/test

# 수동 이메일 발송 (API 키 필요)
curl -H "x-api-key: YOUR_API_KEY" https://your-app.amplifyapp.com/api/email/cron
```

### 2. Cron 서비스 테스트

대부분의 cron 서비스는 "Test now" 기능을 제공합니다. 배포 후 즉시 테스트해보세요.

## 모니터링

### Amplify 로그 확인

1. Amplify 콘솔 → **App settings** → **Monitoring**
2. CloudWatch Logs에서 API 호출 로그 확인

### 이메일 발송 로그

API Route는 콘솔에 로그를 출력합니다. CloudWatch Logs에서 다음을 확인할 수 있습니다:
- 이메일 발송 시작/완료 시간
- 처리된 유저 수
- 성공/실패 건수
- 에러 메시지

## 문제 해결

### API가 401 Unauthorized를 반환하는 경우

- `EMAIL_API_KEY` 환경 변수가 올바르게 설정되었는지 확인
- Cron 서비스에서 API 키를 올바르게 전송하는지 확인
- 헤더 이름이 `x-api-key`인지 확인 (대소문자 구분)

### 이메일이 발송되지 않는 경우

1. **SMTP 설정 확인**
   ```bash
   curl https://your-app.amplifyapp.com/api/email/test
   ```

2. **수동 실행 테스트**
   ```bash
   curl -H "x-api-key: YOUR_API_KEY" https://your-app.amplifyapp.com/api/email/cron
   ```

3. **CloudWatch Logs 확인**
   - 에러 메시지 확인
   - 데이터베이스 연결 문제 확인

### Cron이 실행되지 않는 경우

1. Cron 서비스의 로그 확인
2. API URL이 올바른지 확인
3. 시간대 설정 확인 (KST vs UTC)
4. API 키가 올바르게 전송되는지 확인

## 보안 권장사항

1. **API 키 보안**
   - 강력한 랜덤 문자열 사용 (최소 32자)
   - Cron 서비스에만 공유
   - 정기적으로 변경

2. **HTTPS 사용**
   - Amplify는 기본적으로 HTTPS 제공
   - Cron 서비스도 HTTPS를 지원하는지 확인

3. **IP 화이트리스트 (선택사항)**
   - 일부 cron 서비스는 고정 IP 제공
   - API Route에서 IP 검증 로직 추가 가능

## 비용

- **Amplify**: Next.js API Routes는 Amplify의 무료 티어에 포함
- **Cron 서비스**: 
  - cron-job.org: 무료 (최대 2개 작업)
  - EasyCron: 무료 플랜 있음
  - AWS EventBridge: 매우 저렴 (월 $0.10/규칙)

## 대안: Vercel Cron (Vercel 사용 시)

만약 Vercel을 사용한다면, Vercel의 내장 Cron 기능을 사용할 수 있습니다:

`vercel.json`:
```json
{
  "crons": [{
    "path": "/api/email/cron",
    "schedule": "0 9 * * *"
  }]
}
```

하지만 Amplify에는 내장 Cron 기능이 없으므로 외부 서비스를 사용해야 합니다.

