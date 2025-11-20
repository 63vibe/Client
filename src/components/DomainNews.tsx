import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, TrendingUp, Clock } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from './ui/pagination';
import { getAllNewsArticles, NewsArticle } from '@/src/lib/news_articles';

interface DomainNewsItem {
  id: string;
  domain: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  link: string;
}

const DOMAIN_COLORS: Record<string, string> = {
  'AI': 'bg-purple-100 text-purple-700 border-purple-200',
  '금융': 'bg-blue-100 text-blue-700 border-blue-200',
  '방산': 'bg-red-100 text-red-700 border-red-200',
  '에너지': 'bg-green-100 text-green-700 border-green-200',
  '제조': 'bg-orange-100 text-orange-700 border-orange-200',
  '레저': 'bg-pink-100 text-pink-700 border-pink-200'
};

interface DomainNewsProps {
  selectedDomains: string[]; // NewsletterView에서 전달받는 도메인 ID 목록
}

export function DomainNews({ selectedDomains }: DomainNewsProps) {
  const [newsArticles, setNewsArticles] = useState<DomainNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 선택된 도메인 매핑
  const domainMap: Record<string, string> = {
    'ai': 'AI',
    'finance': '금융',
    'defense': '방산',
    'energy': '에너지',
    'manufacturing': '제조',
    'leisure': '레저'
  };

  // 뉴스 기사 데이터 로드
  useEffect(() => {
    const loadNewsArticles = async () => {
      try {
        setLoading(true);
        const articles = await getAllNewsArticles();
        
        // NewsArticle을 DomainNewsItem으로 변환
        const transformedNews: DomainNewsItem[] = articles.map((article: NewsArticle) => ({
          id: 'd1', // 고정값
          domain: article.domain || '',
          title: article.title || '',
          summary: article.summary || '',
          source: article.publisher || '',
          date: article.pub_date || '',
          link: article.link
        }));

        setNewsArticles(transformedNews);
      } catch (error) {
        console.error('뉴스 기사 로드 오류:', error);
        setNewsArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadNewsArticles();
  }, []);

  // selectedDomains 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDomains]);

  const activeDomainNames = selectedDomains.map(id => domainMap[id]);
  const filteredNews = newsArticles.filter(news => 
    activeDomainNames.includes(news.domain)
  );

  // 페이지네이션 설정
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <p className="text-gray-500 text-center">뉴스를 불러오는 중...</p>
      </Card>
    );
  }

  if (filteredNews.length === 0) {
    return null;
  }

  if (selectedDomains.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '날짜 없음';
    
    try {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '오늘';
      if (diffDays === 1) return '어제';
      if (diffDays < 7) return `${diffDays}일 전`;
      
      // 날짜 포맷팅 (YYYY-MM-DD)
      return dateStr.split('T')[0];
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-gray-900">사업 도메인 최신 동향</h3>
          <p className="text-sm text-gray-600">외부 온라인 뉴스 크롤링 기반</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedNews.map((news, index) => (
          <Card 
            key={`${news.link}-${index}`} 
            className="p-5 hover:shadow-md transition-shadow bg-white cursor-pointer"
            onClick={() => {
              if (news.link) {
                window.open(news.link, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <Badge 
                variant="outline" 
                className={DOMAIN_COLORS[news.domain]}
              >
                {news.domain}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(news.date)}
              </span>
            </div>

            <h4 className="text-gray-900 mb-2 hover:text-indigo-600">
              {news.title}
            </h4>

            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {news.summary}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{news.source}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (news.link) {
                    window.open(news.link, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 페이지네이션 */}
      {filteredNews.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(prev => prev - 1);
                    }
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 페이지 번호 표시 로직 (현재 페이지 주변만 표시)
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(prev => prev + 1);
                    }
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 게시물 개수 표시 */}
      {filteredNews.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          {startIndex + 1} - {Math.min(endIndex, filteredNews.length)} / {filteredNews.length}개
        </div>
      )}
    </Card>
  );
}
