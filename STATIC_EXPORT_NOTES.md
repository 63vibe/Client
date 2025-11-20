# 정적 사이트 Export 주의사항

## ⚠️ 중요: API Routes 제한

정적 사이트로 export하면 **API Routes가 작동하지 않습니다**.

현재 프로젝트에는 다음 API Routes가 있습니다:
- `/api/email/test` - SMTP 연결 테스트
- `/api/email/send` - 수동 이메일 발송
- `/api/email/cron` - Cron 서비스용 이메일 발송
- `/api/email/test-send` - 테스트 이메일 발송

이 API Routes들은 정적 사이트에서는 **사용할 수 없습니다**.

## 해결 방법

### 옵션 1: Amplify SSR 사용 (권장)

정적 export 대신 Amplify의 SSR 기능을 사용하면 API Routes가 정상 작동합니다.

`next.config.js`에서 `output: 'export'`를 제거하고 `amplify.yml`을 원래대로 되돌리세요.

### 옵션 2: 별도 API 서버 사용

- API Routes를 별도의 서버(예: AWS Lambda, Express 서버)로 분리
- 프론트엔드는 정적 사이트로 배포
- API 호출 시 별도 서버 URL 사용

### 옵션 3: 클라이언트 사이드만 사용

- API Routes 기능을 제거하고 클라이언트에서 직접 Supabase 호출
- 이메일 발송은 외부 서비스(예: AWS SES API 직접 호출) 사용

## 현재 설정

현재 프로젝트는 정적 export로 설정되어 있습니다:
- `next.config.js`: `output: 'export'` 설정됨
- `package.json`: `build` 스크립트에 `next export` 포함
- `amplify.yml`: `baseDirectory: out` 설정됨

이 설정으로 배포하면:
- ✅ 정적 파일들이 `/out` 폴더에 생성됨
- ✅ CloudFront가 정상적으로 서빙
- ✅ 404 문제 해결
- ❌ API Routes 작동 안 함
- ❌ 이메일 발송 기능 사용 불가

## 권장 사항

이메일 발송 기능을 사용하려면 **Amplify SSR**을 사용하는 것을 권장합니다.

