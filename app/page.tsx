'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { NewsletterView } from '@/src/components/NewsletterView';
import { BoardManager } from '@/src/components/BoardManager';
import { KeywordManager } from '@/src/components/KeywordManager';
import { SubscriptionSettings } from '@/src/components/SubscriptionSettings';
import { AdminDashboard } from '@/src/components/AdminDashboard';
import { UserStats } from '@/src/components/UserStats';
import { Login } from '@/src/components/Login';
import { ExternalLogin } from '@/src/components/ExternalLogin';
import { Newspaper, Settings, Tag, LayoutDashboard, Database, BarChart3, LogOut } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { getUserFromStorage, removeUserFromStorage } from '@/src/lib/auth';
import { LoginResponse } from '@/src/types/user';
import { toast } from 'sonner';

export default function Home() {
  const [activeTab, setActiveTab] = useState('newsletter');
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 상태 확인
  useEffect(() => {
    const savedUser = getUserFromStorage();
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  // 로그인 성공 핸들러
  const handleLoginSuccess = () => {
    const savedUser = getUserFromStorage();
    setUser(savedUser);
    setActiveTab('newsletter'); // 뉴스레터 탭으로 이동
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    removeUserFromStorage();
    setUser(null);
    toast.success('로그아웃되었습니다');
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  // 로그인되지 않은 경우
  if (!user) {
    return <ExternalLogin onSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user.role === 'admin';

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
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-400 ml-2">({user.employee_id})</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
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
            <BoardManager isAdmin={isAdmin} />
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

