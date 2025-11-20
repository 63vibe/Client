-- 사용자 선택 도메인 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL REFERENCES users(employee_id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, domain)
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_domains_employee_id ON public.user_domains(employee_id);
CREATE INDEX IF NOT EXISTS idx_user_domains_domain ON public.user_domains(domain);

-- updated_at 자동 업데이트를 위한 트리거 함수 (이미 존재할 수 있으므로 CREATE OR REPLACE 사용)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_user_domains_updated_at ON public.user_domains;
CREATE TRIGGER update_user_domains_updated_at
    BEFORE UPDATE ON public.user_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 도메인 값 제약조건 (선택사항: 유효한 도메인만 저장하도록)
-- ALTER TABLE public.user_domains 
-- ADD CONSTRAINT check_valid_domain 
-- CHECK (domain IN ('AI', '금융', '방산', '에너지', '제조', '레저'));

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- ALTER TABLE public.user_domains ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 도메인만 조회/수정/삭제할 수 있도록 정책 설정 (선택사항)
-- CREATE POLICY "Users can view their own domains" ON public.user_domains
--     FOR SELECT
--     USING (auth.uid()::text = employee_id);

-- CREATE POLICY "Users can insert their own domains" ON public.user_domains
--     FOR INSERT
--     WITH CHECK (auth.uid()::text = employee_id);

-- CREATE POLICY "Users can update their own domains" ON public.user_domains
--     FOR UPDATE
--     USING (auth.uid()::text = employee_id);

-- CREATE POLICY "Users can delete their own domains" ON public.user_domains
--     FOR DELETE
--     USING (auth.uid()::text = employee_id);

