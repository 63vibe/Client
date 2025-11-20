'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUserByEmployeeId } from '@/src/lib/users';
import { saveUserToStorage } from '@/src/lib/auth';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId.trim()) {
      setError('사번을 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      const user = await getUserByEmployeeId(employeeId.trim());

      if (!user) {
        setError('일치하는 사번을 찾을 수 없습니다');
        setIsLoading(false);
        return;
      }

      // localStorage에 사용자 정보 저장
      saveUserToStorage({
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
      });

      toast.success(`${user.name}님, 환영합니다!`);
      
      // 성공 후 콜백 실행
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">로그인</h1>
            <p className="text-gray-600">
              사번을 입력하여 로그인하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="employeeId">사번</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="사번을 입력하세요"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    setError('');
                  }}
                  className={`pl-10 ${error ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

