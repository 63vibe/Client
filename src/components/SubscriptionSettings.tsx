'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Mail, Clock, Bell, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUserFromStorage } from '@/src/lib/auth';
import { supabase } from '@/src/lib/supabase';
import { Article } from '@/src/lib/articles';
import { NewsArticle } from '@/src/lib/news_articles';

export function SubscriptionSettings() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [time, setTime] = useState('09:00');
  const [minPosts, setMinPosts] = useState('1');
  const [onlyMatched, setOnlyMatched] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // 컴포넌트 마운트 시 유저 이메일 로드
  useEffect(() => {
    const loadUserEmail = async () => {
      const user = getUserFromStorage();
      if (!user) {
        return;
      }

      try {
        // DB에서 유저의 이메일 주소 가져오기
        const { data, error } = await supabase
          .from('users')
          .select('email')
          .eq('employee_id', user.employee_id)
          .single();

        if (!error && data?.email) {
          setEmail(data.email);
        }
      } catch (error) {
        console.error('유저 이메일 로드 오류:', error);
      }
    };

    loadUserEmail();
  }, []);

  const handleSave = () => {
    toast.success('설정이 저장되었습니다');
  };

  const handleTestEmail = async () => {
    const user = getUserFromStorage();
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!email || !email.includes('@')) {
      toast.error('올바른 이메일 주소를 입력해주세요');
      return;
    }

    setIsSendingTest(true);

    try {
      // 오늘 날짜 계산 (YYYY-MM-DD 형식)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      // 오늘 날짜를 news_articles 형식으로 변환 (예: "Fri, 21 Nov 2025 02:00:00 +0900")
      // 날짜 부분만 비교하기 위해 오늘 날짜의 시작과 끝 시간 범위 생성
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      // articles 테이블에서 오늘 write_date인 게시물 조회
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .gte('write_date', `${todayStr}T00:00:00`)
        .lt('write_date', `${todayStr}T23:59:59`)
        .order('write_date', { ascending: false });

      if (articlesError) {
        console.error('게시물 조회 오류:', articlesError);
        throw new Error('게시물을 불러오는 중 오류가 발생했습니다');
      }

      // news_articles 테이블에서 모든 뉴스 기사 조회 후 클라이언트에서 오늘 날짜 필터링
      // pub_date 형식이 "Fri, 21 Nov 2025 02:00:00 +0900"이므로 서버 사이드 필터링이 어려움
      const { data: allNewsData, error: newsError } = await supabase
        .from('news_articles')
        .select('*')
        .order('pub_date', { ascending: false });

      if (newsError) {
        console.error('뉴스 기사 조회 오류:', newsError);
        throw new Error('뉴스 기사를 불러오는 중 오류가 발생했습니다');
      }

      // 오늘 날짜인 뉴스 기사만 필터링
      const newsData = (allNewsData || []).filter((news: any) => {
        if (!news.pub_date) return false;
        try {
          // "Fri, 21 Nov 2025 02:00:00 +0900" 형식을 Date로 파싱
          const pubDate = new Date(news.pub_date);
          // 날짜 부분만 비교 (시간 제외)
          return pubDate >= todayStart && pubDate <= todayEnd;
        } catch (error) {
          console.error('날짜 파싱 오류:', news.pub_date, error);
          return false;
        }
      });

      if (newsError) {
        console.error('뉴스 기사 조회 오류:', newsError);
        throw new Error('뉴스 기사를 불러오는 중 오류가 발생했습니다');
      }

      // HTML 템플릿 생성 (글자 크기 조정을 위한 스타일 포함)
      let htmlContent = `<article style="font-size: 14px; line-height: 1.6; color: #333;">
  <style>
    article h1 { font-size: 20px; font-weight: bold; margin: 20px 0 15px 0; color: #1a1a1a; }
    article h2 { font-size: 16px; font-weight: bold; margin: 15px 0 10px 0; color: #2c3e50; }
    article h3 { font-size: 15px; font-weight: 600; margin: 12px 0 8px 0; color: #34495e; }
    article p { font-size: 14px; margin: 8px 0; color: #555; }
    article hr { border: none; border-top: 1px solid #e0e0e0; margin: 15px 0; }
  </style>`;

      // articles 데이터 추가
      if (articlesData && articlesData.length > 0) {
        // 사내게시물 뉴스레터 섹션 제목 추가
        htmlContent += '\n  <h3>사내게시물 뉴스레터</h3>';
        
        articlesData.forEach((article: any, index: number) => {
          const articleNum = index + 1;
          const boardName = article.board_name || '기타';
          const subject = article.subject || '제목 없음';
          const summary = article.content_summary || article.original_content?.substring(0, 200) || '';
          const author = article.user_name || '알 수 없음';
          const views = article.views || 0;

          htmlContent += `
  <h4>${articleNum}. ${boardName}</h4>
  <h5>${subject}</h5>
  <p>${summary}</p>
  <p>작성자: ${author} / 오늘 / ${views}뷰</p>`;
          
          if (index < articlesData.length - 1) {
            htmlContent += '\n  <hr/>';
          }
        });
      }

      // news_articles 데이터 추가
      if (newsData && newsData.length > 0) {
        // articles와 news_articles 사이 구분선 및 도메인 뉴스레터 섹션 제목 추가
        if (articlesData && articlesData.length > 0) {
          htmlContent += '\n  <hr style="margin: 25px 0; border-top: 2px solid #ccc;"/>';
        }
        htmlContent += '\n  <h3>도메인 뉴스레터</h3>';
        
        newsData.forEach((news: any, index: number) => {
          const newsNum = index + 1;
          const domain = news.domain || '기타';
          const title = news.title || '제목 없음';
          const summary = news.summary || news.description?.substring(0, 200) || '';
          const publisher = news.publisher || '알 수 없음';

          htmlContent += `
  <h4>${newsNum}. ${domain}</h4>
  <h5>${title}</h5>
  <p>${summary}</p>
  <p>출처: ${publisher} / 오늘</p>`;
          
          if (index < newsData.length - 1) {
            htmlContent += '\n  <hr/>';
          }
        });
      }

      // 데이터가 없는 경우
      if ((!articlesData || articlesData.length === 0) && (!newsData || newsData.length === 0)) {
        htmlContent += '\n  <p>오늘 발행된 게시물이 없습니다.</p>';
      }

      htmlContent += '\n</article>';

      // 서버 사이드 API Route를 통해 Lambda 호출
      const response = await fetch('/api/email/test-send-lambda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          subject: '테스트 이메일',
          to: email,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // 응답 확인
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // 성공 메시지 표시
      toast.success('테스트 메일 발송 완료');
    } catch (error: any) {
      console.error('테스트 이메일 발송 오류:', error);
      toast.error(error.message || '테스트 이메일 발송 중 오류가 발생했습니다');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 현재 설정 요약 - 최상단으로 이동 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-gray-900 mb-4">현재 설정 요약</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={emailEnabled ? 'default' : 'secondary'}>
              {emailEnabled ? '활성' : '비활성'}
            </Badge>
            <span className="text-sm">이메일 뉴스레터</span>
            {emailEnabled && <span className="text-sm text-gray-500">→ {email}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">주기</Badge>
            <span className="text-sm">
              {frequency === 'realtime' && '실시간'}
              {frequency === 'hourly' && '1시간마다'}
              {frequency === 'daily' && `매일 ${time}`}
              {frequency === 'weekly' && '주 1회 (월요일)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">필터</Badge>
            <span className="text-sm">
              {onlyMatched ? '키워드 매칭 게시글만' : '모든 게시글'}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-gray-900 mb-2">구독 설정</h2>
          <p className="text-gray-600">
            뉴스레터 전송 방식과 주기를 설정합니다
          </p>
        </div>

        <div className="space-y-6">
          {/* 이메일 설정 */}
          <Card className="p-5 bg-gray-50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">이메일 뉴스레터</h3>
                  <p className="text-sm text-gray-600">매일 아침 이메일로 요약본을 받습니다</p>
                </div>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            {emailEnabled && (
              <div className="space-y-4 ml-11">
                <div className="space-y-2">
                  <Label htmlFor="email">수신 이메일</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@company.com"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleTestEmail}
                      disabled={isSendingTest || !email}
                    >
                      {isSendingTest ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          발송 중...
                        </>
                      ) : (
                        '발송'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 전송 주기 설정 */}
          <Card className="p-5 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900">전송 주기</h3>
                <p className="text-sm text-gray-600">뉴스레터 전송 빈도를 설정합니다</p>
              </div>
            </div>

            <div className="space-y-4 ml-11">
              <div className="space-y-2">
                <Label htmlFor="frequency">전송 빈도</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">실시간 (새 게시글 즉시)</SelectItem>
                    <SelectItem value="hourly">1시간마다</SelectItem>
                    <SelectItem value="daily">매일 1회</SelectItem>
                    <SelectItem value="weekly">주 1회 (월요일)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {frequency === 'daily' && (
                <div className="space-y-2">
                  <Label htmlFor="time">전송 시간</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="min-posts">최소 게시글 수</Label>
                <Select value={minPosts} onValueChange={setMinPosts}>
                  <SelectTrigger id="min-posts">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1개 이상</SelectItem>
                    <SelectItem value="3">3개 이상</SelectItem>
                    <SelectItem value="5">5개 이상</SelectItem>
                    <SelectItem value="10">10개 이상</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  이 개수 미만이면 뉴스레터를 발송하지 않습니다
                </p>
              </div>
            </div>
          </Card>

          {/* 필터 설정 */}
          <Card className="p-5 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-900">필터 설정</h3>
                <p className="text-sm text-gray-600">뉴스레터에 포함될 게시글을 필터링합니다</p>
              </div>
            </div>

            <div className="space-y-4 ml-11">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <Label htmlFor="only-matched" className="cursor-pointer">
                    키워드 매칭 게시글만 포함
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    내가 등록한 키워드와 매칭되는 게시글만 받습니다
                  </p>
                </div>
                <Switch
                  id="only-matched"
                  checked={onlyMatched}
                  onCheckedChange={setOnlyMatched}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>마지막 저장: 오늘 08:00</span>
          </div>
          <Button onClick={handleSave}>
            설정 저장
          </Button>
        </div>
      </Card>
    </div>
  );
}