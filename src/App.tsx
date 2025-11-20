import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { NewsletterView } from './components/NewsletterView';
import { BoardManager } from './components/BoardManager';
import { KeywordManager } from './components/KeywordManager';
import { SubscriptionSettings } from './components/SubscriptionSettings';
import { AdminDashboard } from './components/AdminDashboard';
import { UserStats } from './components/UserStats';
import { SignUp } from './components/SignUp';
import { Newspaper, Settings, Tag, LayoutDashboard, Database, BarChart3, LogIn } from 'lucide-react';
import { Button } from './components/ui/button';

export default function App() {
  const [activeTab, setActiveTab] = useState('newsletter');
  const [isAdmin, setIsAdmin] = useState(false); // 관리자/일반 유저 구분
  const [showSignUp, setShowSignUp] = useState(false);

  // 계정 타입 토글 (데모용)
  const toggleAccountType = () => {
    setIsAdmin(!isAdmin);
  };

  if (showSignUp) {
    return <SignUp onBack={() => setShowSignUp(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">사내 AI 뉴스레터</h1>
                <p className="text-sm text-gray-500">게시판 요약 & 맞춤형 정보 제공</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 데모용: 계정 타입 전환 버튼 */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleAccountType}
              >
                {isAdmin ? '👤 관리자' : '👤 일반 유저'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSignUp(true)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                회원가입
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              <span className="hidden sm:inline">뉴스레터</span>
            </TabsTrigger>
            
            <TabsTrigger value="boards" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">게시판 관리</span>
            </TabsTrigger>
            
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">키워드 관리</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">구독 설정</span>
            </TabsTrigger>
            
            {isAdmin ? (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">관리자</span>
              </TabsTrigger>
            ) : (
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">통계</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="newsletter" className="space-y-6">
            <NewsletterView />
          </TabsContent>

          <TabsContent value="boards" className="space-y-6">
            <BoardManager isAdmin={isAdmin} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <KeywordManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SubscriptionSettings />
          </TabsContent>

          {isAdmin ? (
            <TabsContent value="admin" className="space-y-6">
              <AdminDashboard />
            </TabsContent>
          ) : (
            <TabsContent value="stats" className="space-y-6">
              <UserStats />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}