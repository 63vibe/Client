import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  Mail,
  Database,
  Activity,
  ArrowUp,
  ArrowDown
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const subscriberData = [
  { month: '6월', count: 12 },
  { month: '7월', count: 18 },
  { month: '8월', count: 25 },
  { month: '9월', count: 32 },
  { month: '10월', count: 45 },
  { month: '11월', count: 58 }
];

const postData = [
  { day: '월', count: 12 },
  { day: '화', count: 15 },
  { day: '수', count: 8 },
  { day: '목', count: 18 },
  { day: '금', count: 14 },
  { day: '토', count: 5 },
  { day: '일', count: 3 }
];

const boardDistribution = [
  { name: '공지사항', value: 42, color: '#3b82f6' },
  { name: '개발팀', value: 156, color: '#8b5cf6' },
  { name: '프로젝트', value: 89, color: '#10b981' },
  { name: '복지', value: 28, color: '#f59e0b' },
  { name: '기술블로그', value: 234, color: '#ef4444' },
  { name: '마케팅팀', value: 67, color: '#ec4899' }
];

const topKeywords = [
  { keyword: 'AI', matches: 45, trend: 'up' },
  { keyword: '개발', matches: 34, trend: 'up' },
  { keyword: '운영', matches: 28, trend: 'down' },
  { keyword: '보안', matches: 15, trend: 'up' },
  { keyword: '워크샵', matches: 12, trend: 'same' }
];

const recentActivity = [
  { user: '김철수', action: '키워드 "프로젝트" 추가', time: '5분 전' },
  { user: '이영희', action: '이메일 설정 변경', time: '12분 전' },
  { user: '박민수', action: '게시판 "HR팀" 추가', time: '1시간 전' },
  { user: '최지원', action: '구독 시작', time: '2시간 전' },
  { user: '정수현', action: 'Slack 연동 설정', time: '3시간 전' }
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-gray-900 mb-2">관리자 대시보드</h2>
        <p className="text-gray-600">
          서비스 전체 현황과 통계를 확인합니다
        </p>
      </Card>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <Badge variant="default" className="bg-green-500">
              <ArrowUp className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </div>
          <div className="text-gray-900 mb-1">58</div>
          <div className="text-sm text-gray-600">총 구독자</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <Badge variant="default" className="bg-green-500">
              <ArrowUp className="w-3 h-3 mr-1" />
              +8%
            </Badge>
          </div>
          <div className="text-gray-900 mb-1">616</div>
          <div className="text-sm text-gray-600">총 게시글</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <Badge variant="default" className="bg-green-500">
              <ArrowUp className="w-3 h-3 mr-1" />
              +25%
            </Badge>
          </div>
          <div className="text-gray-900 mb-1">1,247</div>
          <div className="text-sm text-gray-600">발송된 뉴스레터</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <Badge variant="secondary">
              안정
            </Badge>
          </div>
          <div className="text-gray-900 mb-1">6</div>
          <div className="text-sm text-gray-600">활성 게시판</div>
        </Card>
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">구독자 증가 추이</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={subscriberData}>
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
          <h3 className="text-gray-900 mb-4">주간 게시글 현황</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={postData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 게시판 분포 & 인기 키워드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">게시판별 게시글 분포</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={boardDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {boardDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {boardDistribution.map((board) => (
              <div key={board.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: board.color }}
                />
                <span className="text-sm text-gray-600">{board.name}</span>
                <span className="text-sm text-gray-900">{board.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">인기 키워드 TOP 5</h3>
          <div className="space-y-3">
            {topKeywords.map((item, index) => (
              <div key={item.keyword} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">{item.keyword}</span>
                    {item.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
                    {item.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(item.matches / 45) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-gray-600">{item.matches}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">최근 활동</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                {activity.user[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate">
                  <span>{activity.user}</span>
                  <span className="text-gray-600 ml-2">{activity.action}</span>
                </p>
              </div>
              <span className="text-sm text-gray-500 flex-shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          모든 활동 보기
        </Button>
      </Card>

      {/* 시스템 상태 */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">시스템 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="text-sm text-green-700">크롤링 서비스</div>
              <div className="text-green-900">정상</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="text-sm text-green-700">AI 요약 엔진</div>
              <div className="text-green-900">정상</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="text-sm text-green-700">이메일 전송</div>
              <div className="text-green-900">정상</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </Card>
    </div>
  );
}
