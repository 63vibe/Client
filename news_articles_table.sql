-- Supabase news_articles 테이블 생성
CREATE TABLE IF NOT EXISTS public.news_articles (
    link TEXT NOT NULL PRIMARY KEY,
    domain TEXT NOT NULL,
    title TEXT,
    summary TEXT,
    description TEXT,
    publisher TEXT,
    pub_date TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_news_articles_domain ON public.news_articles(domain);
CREATE INDEX IF NOT EXISTS idx_news_articles_pub_date ON public.news_articles(pub_date);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON public.news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 설정 (선택사항)
-- CREATE POLICY "Allow public read access" ON public.news_articles
--     FOR SELECT
--     USING (true);

