'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mail, 
  FileText, 
  TrendingUp,
  Activity,
  CheckCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { getAllArticles, Article } from '@/src/lib/articles';
import { getKeywordsByEmployeeId } from '@/src/lib/keywords';
import { getUserFromStorage } from '@/src/lib/auth';

const newsletterData = [
  { month: '6월', count: 8 },
  { month: '7월', count: 12 },
  { month: '8월', count: 15 },
  { month: '9월', count: 18 },
  { month: '10월', count: 22 },
  { month: '11월', count: 24 }
];

const topKeywords = [
  { keyword: 'AI', matches: 45 },
  { keyword: '개발', matches: 34 },
  { keyword: '운영', matches: 28 },
  { keyword: '보안', matches: 15 },
  { keyword: '워크샵', matches: 12 }
];

export function UserStats() {
  const [weeklyPosts, setWeeklyPosts] = useState([
    { day: '월', count: 0 },
    { day: '화', count: 0 },
    { day: '수', count: 0 },
    { day: '목', count: 0 },
    { day: '금', count: 0 },
    { day: '토', count: 0 },
    { day: '일', count: 0 }
  ]);
  const [loading, setLoading] = useState(true);
  const [todayKeywordMatches, setTodayKeywordMatches] = useState(0);
  const [registeredKeywordsCount, setRegisteredKeywordsCount] = useState(0);
  const [thisWeekPostsCount, setThisWeekPostsCount] = useState(0);

  // 이번 주 게시물 데이터 로드
  useEffect(() => {
    const loadWeeklyPosts = async () => {
      try {
        setLoading(true);
        const articles = await getAllArticles();
        
        // 이번 주 시작일 계산 (월요일 00:00:00)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0(일요일) ~ 6(토요일)
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일까지의 일수
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);
        
        // 이번 주 일요일 계산
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        // 이번 주 게시물 필터링
        const thisWeekArticles = articles.filter((article: Article) => {
          if (!article.write_date) return false;
          const writeDate = new Date(article.write_date);
          return writeDate >= monday && writeDate <= sunday;
        });
        
        // 이번 주 총 게시물 수 설정
        setThisWeekPostsCount(thisWeekArticles.length);
        
        // 요일별로 그룹화
        const dayCounts: Record<number, number> = {
          0: 0, // 일요일
          1: 0, // 월요일
          2: 0, // 화요일
          3: 0, // 수요일
          4: 0, // 목요일
          5: 0, // 금요일
          6: 0  // 토요일
        };
        
        thisWeekArticles.forEach((article: Article) => {
          if (article.write_date) {
            const writeDate = new Date(article.write_date);
            const dayOfWeek = writeDate.getDay();
            dayCounts[dayOfWeek]++;
          }
        });
        
        // 차트 데이터 형식으로 변환
        const weeklyData = [
          { day: '월', count: dayCounts[1] },
          { day: '화', count: dayCounts[2] },
          { day: '수', count: dayCounts[3] },
          { day: '목', count: dayCounts[4] },
          { day: '금', count: dayCounts[5] },
          { day: '토', count: dayCounts[6] },
          { day: '일', count: dayCounts[0] }
        ];
        
        setWeeklyPosts(weeklyData);
      } catch (error) {
        console.error('주간 게시물 데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyPosts();
  }, []);

  // 등록된 키워드 개수 로드
  useEffect(() => {
    const loadRegisteredKeywordsCount = async () => {
      try {
        const user = getUserFromStorage();
        if (!user) {
          setRegisteredKeywordsCount(0);
          return;
        }

        const keywords = await getKeywordsByEmployeeId(user.employee_id);
        setRegisteredKeywordsCount(keywords.length);
      } catch (error) {
        console.error('키워드 개수 로드 오류:', error);
        setRegisteredKeywordsCount(0);
      }
    };

    loadRegisteredKeywordsCount();
  }, []);

  // 오늘 올라온 게시물 중 키워드 매칭 개수 계산
  useEffect(() => {
    const loadTodayKeywordMatches = async () => {
      try {
        const user = getUserFromStorage();
        if (!user) {
          setTodayKeywordMatches(0);
          return;
        }

        // 사용자의 키워드 목록 로드
        const keywords = await getKeywordsByEmployeeId(user.employee_id);
        const userKeywords = keywords.map(k => k.text.toLowerCase());
        
        if (userKeywords.length === 0) {
          setTodayKeywordMatches(0);
          return;
        }

        // 모든 게시물 로드
        const articles = await getAllArticles();
        
        // 오늘 날짜 계산
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        // 오늘 올라온 게시물 필터링 및 키워드 매칭 확인
        const todayArticles = articles.filter((article: Article) => {
          if (!article.write_date) return false;
          const writeDateStr = article.write_date.split('T')[0];
          return writeDateStr === todayStr;
        });

        // 키워드와 일치하는 게시물 개수 계산
        let matchCount = 0;
        todayArticles.forEach((article: Article) => {
          const subject = (article.subject || '').toLowerCase();
          const originalContent = (article.original_content || '').toLowerCase();
          const searchText = `${subject} ${originalContent}`;
          
          // 사용자 키워드 중 하나라도 포함되어 있으면 매칭
          const hasMatch = userKeywords.some(keyword => 
            searchText.includes(keyword)
          );
          
          if (hasMatch) {
            matchCount++;
          }
        });

        setTodayKeywordMatches(matchCount);
      } catch (error) {
        console.error('키워드 매칭 계산 오류:', error);
        setTodayKeywordMatches(0);
      }
    };

    loadTodayKeywordMatches();
  }, []);
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-gray-900 mb-2">내 통계</h2>
        <p className="text-gray-600">
          나의 뉴스레터 구독 및 활동 통계를 확인합니다
        </p>
      </Card>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <Badge variant="default" className="bg-blue-500">
              이번 달
            </Badge>
          </div>
          <div className="text-gray-900 mb-1">24</div>
          <div className="text-sm text-gray-600">발송된 뉴스레터</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <Badge variant="default" className="bg-purple-500">
              이번 주
            </Badge>
          </div>
          <div className="text-gray-900 mb-1">{thisWeekPostsCount}</div>
          <div className="text-sm text-gray-600">총 게시물 수</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <Badge variant="default" className="bg-green-500">
              활성
            </Badge>
          </div>
          <div className="text-gray-900 mb-1">{registeredKeywordsCount}</div>
          <div className="text-sm text-gray-600">등록된 키워드</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <Badge variant="default" className="bg-orange-500">
              오늘
            </Badge>
          </div>
          <div className="text-gray-900 mb-1">{todayKeywordMatches}</div>
          <div className="text-sm text-gray-600">키워드 매칭</div>
        </Card>
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">월별 뉴스레터 수신</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={newsletterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">주간 게시물 현황</h3>
          {loading ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-gray-500">데이터를 불러오는 중...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyPosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* 인기 키워드 */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">내 인기 키워드 TOP 5</h3>
        <p className="text-gray-600 text-sm mb-4">
          내가 등록한 키워드 중 가장 많이 매칭된 순위입니다
        </p>
        <div className="space-y-3">
          {topKeywords.map((item, index) => (
            <div key={item.keyword} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-900">{item.keyword}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(item.matches / 45) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-gray-600">{item.matches}건</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 시스템 상태 */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">시스템 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="text-sm text-green-700">크롤링 서비스</div>
              <div className="text-green-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                정상
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="text-sm text-green-700">AI 요약 엔진</div>
              <div className="text-green-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                정상
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="text-sm text-green-700">이메일 전송</div>
              <div className="text-green-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                정상
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </Card>
    </div>
  );
}
