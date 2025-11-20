'use client';

import { useState, useEffect } from 'react';
import { NewsletterCard } from './NewsletterCard';
import { DomainNews } from './DomainNews';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Calendar, Search, RefreshCw, Filter, X, Tag, Globe, TrendingUp, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from './ui/pagination';
import { getKeywordsByEmployeeId } from '@/src/lib/keywords';
import { getUserFromStorage } from '@/src/lib/auth';
import { getAllArticles, Article } from '@/src/lib/articles';

const BUSINESS_DOMAINS = [
  { id: 'manufacturing', name: '제조' },
  { id: 'finance', name: '금융' },
  { id: 'defense', name: '방산' },
  { id: 'energy', name: '에너지' },
  { id: 'ai', name: 'AI' },
  { id: 'leisure', name: '레저' }
];

interface Post {
  article_id: string;
  board_id: number;
  board: string;
  subject: string;
  content_summary: string;
  user_name: string;
  write_date: string;
  views: number;
  isNew: boolean;
  matchedKeywords: string[];
  source: string;
}

export function NewsletterView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBoard, setFilterBoard] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'domain'>('board'); // 토글 상태
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['ai', 'finance']); // 선택된 도메인
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const boards = ['all', ...Array.from(new Set(posts.map(p => p.board)))];

  // 게시물 데이터와 키워드 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 게시물 데이터 로드
        const articles = await getAllArticles();
        
        // 로그인한 사용자의 키워드 목록 로드
        const user = getUserFromStorage();
        let userKeywords: string[] = [];
        
        if (user) {
          const keywords = await getKeywordsByEmployeeId(user.employee_id);
          userKeywords = keywords.map(k => k.text);
          setAvailableKeywords(userKeywords);
        }

        // 게시물 데이터를 Post 형식으로 변환하고 matchedKeywords 계산
        const transformedPosts: Post[] = articles.map((article: Article) => {
          const subject = article.subject || '';
          const originalContent = article.original_content || '';
          const searchText = `${subject} ${originalContent}`.toLowerCase();
          
          // 유저 키워드 중 게시물의 subject나 original_content에 포함된 키워드 찾기
          const matched: string[] = [];
          userKeywords.forEach(keyword => {
            if (searchText.includes(keyword.toLowerCase())) {
              matched.push(keyword);
            }
          });
          
          // 디버깅: board_id 확인
          if (!article.board_id) {
            console.warn('board_id가 없는 article:', article);
          }
          
          return {
            article_id: article.article_id,
            board_id: article.board_id,
            board: article.board_name || '알 수 없음',
            subject: subject,
            content_summary: article.content_summary || '',
            user_name: article.user_name || '알 수 없음',
            write_date: article.write_date || '',
            views: article.views || 0,
            isNew: true, // 우선 true로 설정
            matchedKeywords: [...new Set(matched)], // 중복 제거
            source: 'board'
          };
        });
        
        // 디버깅: 변환된 데이터 확인
        console.log('변환된 posts 샘플:', transformedPosts.slice(0, 3));

        setPosts(transformedPosts);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const selectAllKeywords = () => {
    setSelectedKeywords([...availableKeywords]);
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
      post.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content_summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBoard = filterBoard === 'all' || post.board === filterBoard;
    
    let matchesDate = true;
    if (filterDate !== 'all' && post.write_date) {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      const postDate = post.write_date.split('T')[0]; // TIMESTAMP에서 날짜만 추출
      
      if (filterDate === 'today') {
        matchesDate = postDate === today;
      } else if (filterDate === 'week') {
        matchesDate = postDate >= weekAgoStr;
      }
    } else if (filterDate !== 'all' && !post.write_date) {
      // 날짜 필터가 설정되었지만 write_date가 없는 경우 제외
      matchesDate = false;
    }
    
    const matchesKeywords = selectedKeywords.length === 0 || 
      selectedKeywords.some(keyword => post.matchedKeywords.includes(keyword));
    
    return matchesSearch && matchesBoard && matchesDate && matchesKeywords;
  });

  // 필터 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBoard, filterDate, selectedKeywords]);

  // 페이지네이션 설정
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

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
                className={viewMode === 'board' ? 'bg-white shadow-sm text-gray-900 hover:bg-white' : 'hover:bg-gray-200 text-gray-700'}
              >
                <Building2 className={`w-4 h-4 mr-2 ${viewMode === 'board' ? 'text-gray-900' : 'text-gray-600'}`} />
                사내 게시판
              </Button>
              <Button
                variant={viewMode === 'domain' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('domain')}
                className={viewMode === 'domain' ? 'bg-white shadow-sm text-gray-900 hover:bg-white' : 'hover:bg-gray-200 text-gray-700'}
              >
                <Globe className={`w-4 h-4 mr-2 ${viewMode === 'domain' ? 'text-gray-900' : 'text-gray-600'}`} />
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
                <div className="flex items-center gap-2">
                  {availableKeywords.length > 0 && selectedKeywords.length < availableKeywords.length && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllKeywords}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      전체 선택
                    </Button>
                  )}
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
          {loading ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
              <p className="text-gray-500">데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {paginatedPosts.map((post, index) => (
                <NewsletterCard key={post.article_id} post={post} index={startIndex + index} />
              ))}

              {filteredPosts.length === 0 && (
                <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              )}

              {filteredPosts.length > 0 && totalPages > 1 && (
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

              {filteredPosts.length > 0 && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  {startIndex + 1} - {Math.min(endIndex, filteredPosts.length)} / {filteredPosts.length}개
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}