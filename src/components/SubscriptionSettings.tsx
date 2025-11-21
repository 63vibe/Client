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
import { sendTestEmail } from '@/src/lib/email/actions';

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
      // Server Action 직접 호출 (API 라우트 거치지 않음)
      const result = await sendTestEmail(user.employee_id, email, user.name);

      if (result.success) {
        toast.success(result.message || `테스트 이메일이 ${email}로 발송되었습니다`);
      } else {
        toast.error(result.message || '테스트 이메일 발송에 실패했습니다');
      }
    } catch (error) {
      console.error('테스트 이메일 발송 오류:', error);
      toast.error('테스트 이메일 발송 중 오류가 발생했습니다');
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
                        '테스트'
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