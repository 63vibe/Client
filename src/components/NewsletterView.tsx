'use client';

import { useState } from 'react';
import { NewsletterCard } from './NewsletterCard';
import { DomainNews } from './DomainNews';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Calendar, Search, RefreshCw, Filter, X, Tag, Globe, TrendingUp, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    board: '공지사항',
    title: '2024년 하반기 전사 워크샵 안내',
    summary: '11월 25-26일 제주도에서 전사 워크샵이 진행됩니다. 참석 여부는 11월 20일까지 회신 바랍니다.',
    keywords: ['워크샵', '행사', '전사'],
    author: '인사팀',
    date: '2024-11-18',
    views: 342,
    isNew: true,
    matchedKeywords: ['워크샵'],
    source: 'board' // board or naver
  },
  {
    id: '2',
    board: '개발팀',
    title: '[긴급] 운영 서버 보안 패치 일정 공지',
    summary: '11월 20일 02:00-04:00 사이 보안 패치 진행으로 일시적인 서비스 중단이 예정되어 있습니다. 모니터링 당번 확인 요망.',
    keywords: ['보안', '운영', '긴급'],
    author: 'DevOps팀',
    date: '2024-11-18',
    views: 156,
    isNew: true,
    matchedKeywords: ['보안', '운영'],
    source: 'board'
  },
  {
    id: '3',
    board: '프로젝트',
    title: 'AI 챗봇 프로젝트 1차 스프린트 회고',
    summary: '11월 1-15일 진행된 1차 스프린트 완료. MVP 기능 구현 완료, 다음 스프린트는 성능 최적화 및 UX 개선에 집중 예정.',
    keywords: ['AI', '프로젝트', '스프린트'],
    author: '김철수',
    date: '2024-11-17',
    views: 89,
    isNew: false,
    matchedKeywords: ['AI'],
    source: 'board'
  },
  {
    id: '4',
    board: '복지',
    title: '사내 도서 구입 신청 안내 (11월)',
    summary: '업무 관련 도서 구입 신청을 11월 22일까지 받습니다. 1인당 월 5만원 한도, 승인 후 구입 가능.',
    keywords: ['복지', '도서', '신청'],
    author: '총무팀',
    date: '2024-11-17',
    views: 234,
    isNew: false,
    matchedKeywords: [],
    source: 'board'
  },
  {
    id: '5',
    board: '기술블로그',
    title: 'React 19 주요 변경사항 및 마이그레이션 가이드',
    summary: 'React 19의 새로운 기능(Server Components, Actions 등)과 기존 프로젝트 마이그레이션 시 주의사항을 정리했습니다.',
    keywords: ['React', '기술', '개발'],
    author: '이영희',
    date: '2024-11-16',
    views: 421,
    isNew: false,
    matchedKeywords: ['개발'],
    source: 'board'
  },
  {
    id: '6',
    board: '공지사항',
    title: '연말 인사 평가 일정 및 가이드',
    summary: '12월 1-15일 자기평가 작성, 12월 18-20일 1:1 면담 진행 예정. 평가 시스템은 11월 25일 오픈.',
    keywords: ['인사', '평가', '연말'],
    author: '인사팀',
    date: '2024-11-16',
    views: 512,
    isNew: false,
    matchedKeywords: [],
    source: 'board'
  },
  {
    id: '7',
    board: '개발팀',
    title: '새로운 코드 리뷰 가이드라인 적용',
    summary: 'PR 크기는 500줄 이하 권장, 리뷰어는 최소 2명 지정, 24시간 내 1차 피드백 원칙으로 변경됩니다.',
    keywords: ['코드리뷰', '개발', '가이드'],
    author: 'CTO',
    date: '2024-11-15',
    views: 287,
    isNew: false,
    matchedKeywords: ['개발'],
    source: 'board'
  },
  {
    id: '8',
    board: '마케팅팀',
    title: 'Q4 마케팅 캠페인 성과 공유',
    summary: '11월 진행된 블랙프라이데이 캠페인 결과: 전환율 전월 대비 43% 상승, ROI 2.8배 달성. 주요 성공 요인 분석 포함.',
    keywords: ['마케팅', '성과', '캠페인'],
    author: '박지민',
    date: '2024-11-15',
    views: 178,
    isNew: false,
    matchedKeywords: [],
    source: 'board'
  },
  // 네이버 뉴스 추가
  {
    id: 'n1',
    board: '네이버 뉴스',
    title: 'AI 기술 혁신, 2024년 주요 트렌드 정리',
    summary: '생성형 AI부터 멀티모달 AI까지, 올해 가장 주목받은 인공지능 기술 발전 방향과 산업별 적용 사례를 종합 정리했습니다.',
    keywords: ['AI', '기술', '트렌드'],
    author: '네이버 뉴스',
    date: '2024-11-18',
    views: 1250,
    isNew: true,
    matchedKeywords: ['AI'],
    source: 'naver'
  },
  {
    id: 'n2',
    board: '네이버 뉴스',
    title: '개발자 연봉 협상 가이드, 실전 팁 공개',
    summary: 'IT 업계 개발자들의 연봉 협상 전략과 성공 사례를 분석. 효과적인 협상 타이밍과 준비 방법을 상세히 소개합니다.',
    keywords: ['개발', '커리어', '연봉'],
    author: '네이버 뉴스',
    date: '2024-11-17',
    views: 890,
    isNew: false,
    matchedKeywords: ['개발'],
    source: 'naver'
  },
  {
    id: 'n3',
    board: '네이버 뉴스',
    title: '클라우드 보안 강화 필수, 최신 위협 대응법',
    summary: '최근 급증하는 클라우드 보안 위협에 대응하기 위한 기업의 보안 전략과 실전 적용 가능한 보안 솔루션을 소개합니다.',
    keywords: ['보안', '클라우드', '운영'],
    author: '네이버 뉴스',
    date: '2024-11-16',
    views: 634,
    isNew: false,
    matchedKeywords: ['보안', '운영'],
    source: 'naver'
  }
];

// 사용 가능한 모든 키워드 (등록된 키워드)
const availableKeywords = ['워크샵', 'AI', '개발', '보안', '운영', 'React', '프로젝트'];

const BUSINESS_DOMAINS = [
  { id: 'manufacturing', name: '제조' },
  { id: 'finance', name: '금융' },
  { id: 'defense', name: '방산' },
  { id: 'energy', name: '에너지' },
  { id: 'ai', name: 'AI' },
  { id: 'leisure', name: '레저' }
];

export function NewsletterView() {
  const [posts, setPosts] = useState(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBoard, setFilterBoard] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'domain'>('board'); // 토글 상태
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['ai', 'finance']); // 선택된 도메인

  const boards = ['all', ...Array.from(new Set(mockPosts.map(p => p.board)))];

  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const clearKeywordFilter = () => {
    setSelectedKeywords([]);
  };

  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(id => id !== domainId));
    } else {
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBoard = filterBoard === 'all' || post.board === filterBoard;
    
    const matchesDate = filterDate === 'all' || 
      (filterDate === 'today' && post.date === '2024-11-18') ||
      (filterDate === 'week' && new Date(post.date) >= new Date('2024-11-12'));
    
    const matchesKeywords = selectedKeywords.length === 0 || 
      selectedKeywords.some(keyword => post.matchedKeywords.includes(keyword));
    
    return matchesSearch && matchesBoard && matchesDate && matchesKeywords;
  });

  const handleRefresh = () => {
    console.log('Refreshing newsletter...');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-gray-900 mb-2">오늘의 뉴스레터</h2>
            <p className="text-gray-600">
              {viewMode === 'board' 
                ? `최근 게시글 ${filteredPosts.length}개 · 내 키워드 매칭 ${filteredPosts.filter(p => p.matchedKeywords.length > 0).length}개`
                : '선택한 사업 도메인의 최신 동향을 확인하세요'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 토글 버튼 */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('board')}
                className={viewMode === 'board' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
              >
                <Building2 className="w-4 h-4 mr-2" />
                사내 게시판
              </Button>
              <Button
                variant={viewMode === 'domain' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('domain')}
                className={viewMode === 'domain' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
              >
                <Globe className="w-4 h-4 mr-2" />
                도메인 동향
              </Button>
            </div>
            
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        {viewMode === 'domain' ? (
          // 도메인 뉴스 보기
          <>
            {/* 도메인 필터 UI */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-gray-900">관심 도메인 선택</span>
                <Badge variant="secondary" className="ml-2">
                  {selectedDomains.length}개 선택됨
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_DOMAINS.map(domain => {
                  const isSelected = selectedDomains.includes(domain.id);
                  
                  return (
                    <Button
                      key={domain.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDomain(domain.id)}
                      className={isSelected ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                      {domain.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {selectedDomains.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">관심 도메인을 선택해주세요</p>
                <p className="text-sm text-gray-500 mt-1">위의 버튼을 클릭하여 도메인을 선택하면 관련 뉴스를 볼 수 있습니다</p>
              </div>
            ) : (
              <DomainNews selectedDomains={selectedDomains} />
            )}
          </>
        ) : (
          // 사내 게시판 뉴스 보기
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="제목, 내용 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filterBoard} onValueChange={setFilterBoard}>
                <SelectTrigger>
                  <SelectValue placeholder="게시판 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 게시판</SelectItem>
                  {boards.filter(b => b !== 'all').map(board => (
                    <SelectItem key={board} value={board}>{board}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 기간</SelectItem>
                  <SelectItem value="today">오늘</SelectItem>
                  <SelectItem value="week">최근 7일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 키워드 필터 UI */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-900">관심 키워드로 필터링</span>
                </div>
                {selectedKeywords.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearKeywordFilter}
                  >
                    <X className="w-4 h-4 mr-1" />
                    전체 해제
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableKeywords.map(keyword => {
                  const isSelected = selectedKeywords.includes(keyword);
                  const matchCount = posts.filter(p => p.matchedKeywords.includes(keyword)).length;
                  
                  return (
                    <Button
                      key={keyword}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleKeyword(keyword)}
                      className={isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      #{keyword}
                      <Badge 
                        variant="secondary" 
                        className="ml-2 text-xs"
                      >
                        {matchCount}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>

            {filteredPosts.filter(p => p.matchedKeywords.length > 0).length > 0 && selectedKeywords.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900">관심 키워드 매칭</span>
                </div>
                <p className="text-sm text-blue-700">
                  내가 등록한 키워드와 일치하는 게시글 {filteredPosts.filter(p => p.matchedKeywords.length > 0).length}개가 있습니다.
                </p>
              </div>
            )}

            {selectedKeywords.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900">키워드 필터 적용 중</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-blue-700">선택된 키워드:</span>
                  {selectedKeywords.map(keyword => (
                    <Badge key={keyword} variant="default" className="bg-blue-600">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {viewMode === 'board' && (
        <div className="space-y-3">
          {filteredPosts.map((post, index) => (
            <NewsletterCard key={post.id} post={post} index={index} />
          ))}

          {filteredPosts.length === 0 && (
            <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}