# Vercel 환경변수 설정 가이드

## 로컬 개발 환경 설정

1. `.env.local.example` 파일을 `.env.local`로 복사합니다:
   ```bash
   cp .env.local.example .env.local
   ```

2. `.env.local` 파일을 열어 실제 Supabase 값으로 채웁니다:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hytapvvcpdnjagfjdrnp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. 개발 서버를 재시작합니다:
   ```bash
   npm run dev
   ```

## Vercel 배포 시 환경변수 설정

### 방법 1: Vercel 대시보드에서 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com 에 로그인
   - 프로젝트 선택

2. **환경변수 설정 페이지로 이동**
   - 프로젝트 대시보드에서 **Settings** 탭 클릭
   - 왼쪽 메뉴에서 **Environment Variables** 클릭

3. **환경변수 추가**
   - **Add New** 버튼 클릭
   - 다음 환경변수들을 추가:

   ```
   Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://hytapvvcpdnjagfjdrnp.supabase.co
   Environment: Production, Preview, Development (모두 선택)
   ```

   ```
   Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dGFwdnZjcGRuamFnZmpkcm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODI1NzcsImV4cCI6MjA3OTA1ODU3N30.tIspwGi8DcKaZFFrWHoL4MiAsKh-Bld-bbFvTzKiBQ8
   Environment: Production, Preview, Development (모두 선택)
   ```

4. **저장 및 재배포**
   - **Save** 버튼 클릭
   - 환경변수 변경 후에는 **Deployments** 탭에서 최신 배포를 **Redeploy** 해야 합니다

### 방법 2: Vercel CLI로 설정

```bash
# Vercel CLI 설치 (아직 설치하지 않은 경우)
npm i -g vercel

# 프로젝트 디렉토리에서 로그인
vercel login

# 환경변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 환경변수 확인
vercel env ls
```

### 중요 사항

- `NEXT_PUBLIC_` 접두사가 붙은 환경변수는 클라이언트 사이드에서 접근 가능합니다
- 환경변수 변경 후에는 반드시 재배포해야 적용됩니다
- Production, Preview, Development 환경을 모두 선택하는 것을 권장합니다

