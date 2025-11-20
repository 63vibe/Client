# AWS Lambda + EventBridge 설정 가이드

이 디렉토리에는 AWS Lambda와 EventBridge를 사용하여 이메일 발송을 스케줄링하는 방법이 포함되어 있습니다.

## 왜 Lambda를 사용하나요?

- **안정성**: AWS의 관리형 서비스로 높은 가용성 보장
- **비용 효율**: 사용한 만큼만 지불 (매월 무료 티어 포함)
- **모니터링**: CloudWatch를 통한 자동 로깅 및 알림
- **확장성**: 자동으로 트래픽 처리

## 설정 단계

### 1. Lambda 함수 생성

1. AWS Lambda 콘솔 접속: https://console.aws.amazon.com/lambda
2. **Create function** 클릭
3. 설정:
   - **Function name**: `email-newsletter-scheduler`
   - **Runtime**: Node.js 18.x 이상
   - **Architecture**: x86_64
4. **Create function** 클릭

### 2. 함수 코드 배포

1. Lambda 함수 페이지에서 **Code** 탭 선택
2. `email-scheduler.js` 파일의 내용을 복사
3. Lambda 에디터에 붙여넣기
4. **Deploy** 클릭

### 3. 환경 변수 설정

1. Lambda 함수 페이지에서 **Configuration** → **Environment variables** 선택
2. **Edit** 클릭
3. 다음 변수 추가:

```
EMAIL_API_KEY=your-amplify-api-key
AMPLIFY_API_URL=https://your-app.amplifyapp.com/api/email/cron
```

4. **Save** 클릭

### 4. EventBridge 규칙 생성

1. AWS EventBridge 콘솔 접속: https://console.aws.amazon.com/events
2. **Rules** → **Create rule** 클릭
3. 설정:
   - **Name**: `daily-email-newsletter`
   - **Description**: 매일 오전 09:00 (KST) 이메일 발송
   - **Event bus**: default
   - **Rule type**: Schedule
   - **Schedule pattern**: 
     - **Schedule type**: Recurring schedule
     - **Schedule expression**: `cron(0 0 * * ? *)`
       - 이는 UTC 00:00 (한국 시간 09:00)에 실행됩니다
4. **Next** 클릭
5. **Targets** 설정:
   - **Target types**: AWS service
   - **Select a target**: Lambda function
   - **Function**: 위에서 생성한 `email-newsletter-scheduler` 선택
6. **Next** → **Next** → **Create rule** 클릭

### 5. Lambda 권한 설정

EventBridge가 Lambda를 호출할 수 있도록 권한이 자동으로 설정됩니다. 만약 문제가 있다면:

1. Lambda 함수 → **Configuration** → **Permissions** 확인
2. EventBridge가 자동으로 생성한 리소스 기반 정책 확인

## 시간대 설정

- **UTC 00:00** = 한국 시간(KST) 09:00
- EventBridge는 UTC 기준이므로 `cron(0 0 * * ? *)` 사용
- 다른 시간에 실행하려면 UTC로 변환:
  - KST 09:00 = UTC 00:00 → `cron(0 0 * * ? *)`
  - KST 10:00 = UTC 01:00 → `cron(0 1 * * ? *)`

## 비용

- **Lambda**: 
  - 무료 티어: 월 100만 요청, 400,000 GB-초
  - 이후: $0.20/100만 요청
- **EventBridge**: 
  - 무료 티어: 월 100만 이벤트
  - 이후: $1.00/100만 이벤트

일일 1회 실행 기준으로는 거의 무료입니다.

## 모니터링

### CloudWatch Logs

1. Lambda 함수 → **Monitor** 탭
2. **View CloudWatch logs** 클릭
3. 로그 스트림에서 실행 기록 확인

### CloudWatch Metrics

- **Invocations**: 함수 호출 횟수
- **Duration**: 실행 시간
- **Errors**: 에러 발생 횟수
- **Throttles**: 제한 초과 횟수

### 알림 설정 (선택사항)

1. CloudWatch → **Alarms** → **Create alarm**
2. Lambda 함수의 에러 메트릭 선택
3. SNS 토픽에 알림 전송 설정

## 테스트

### 수동 실행

1. Lambda 함수 페이지에서 **Test** 탭 선택
2. **Test event** 생성 (빈 이벤트로 충분)
3. **Test** 클릭
4. 실행 결과 확인

### 로그 확인

CloudWatch Logs에서 다음을 확인:
- API 호출 성공 여부
- 응답 상태 코드
- 에러 메시지 (있는 경우)

## 문제 해결

### Lambda가 타임아웃되는 경우

1. **Configuration** → **General configuration** → **Edit**
2. **Timeout** 증가 (최대 15분)
3. 기본값 3초는 충분하지 않을 수 있음

### API 키 오류

1. 환경 변수 확인
2. Amplify의 `EMAIL_API_KEY`와 일치하는지 확인
3. Lambda 함수 로그에서 실제 전송된 API 키 확인 (마스킹됨)

### EventBridge가 실행되지 않는 경우

1. EventBridge 규칙 상태 확인 (Enabled)
2. Lambda 함수의 리소스 기반 정책 확인
3. CloudWatch Logs에서 EventBridge 로그 확인

## 대안: 외부 Cron 서비스

Lambda 설정이 복잡하다면, 더 간단한 방법으로 외부 cron 서비스를 사용할 수 있습니다:
- cron-job.org (무료)
- EasyCron (무료 플랜)
- GitHub Actions (무료)

자세한 내용은 `src/lib/email/AMPLIFY_DEPLOY.md`를 참고하세요.

