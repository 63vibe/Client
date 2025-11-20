-- users 테이블에 email 필드 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email TEXT;

-- email 필드에 인덱스 추가 (검색 성능 향상 및 중복 체크)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- email 필드에 UNIQUE 제약조건 추가 (선택사항 - 이메일 중복 방지)
-- ALTER TABLE public.users 
-- ADD CONSTRAINT unique_email UNIQUE (email);

-- email 필드에 NOT NULL 제약조건 추가 (선택사항 - 필수 필드로 만들 경우)
-- ALTER TABLE public.users 
-- ALTER COLUMN email SET NOT NULL;

