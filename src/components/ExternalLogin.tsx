'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authenticateExternal, saveAccessTokenToStorage } from '@/src/lib/externalAuth';
import { saveUserToStorage } from '@/src/lib/auth';
import { ensureUserAndUpdateToken } from '@/src/lib/users';
import { OTPAuth } from './OTPAuth';

interface ExternalLoginProps {
  onSuccess: () => void;
}

export function ExternalLogin({ onSuccess }: ExternalLoginProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpId, setOtpId] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  const performLogin = async (providedOtpId?: string, providedOtp?: string) => {
    setError('');

    if (!userId.trim()) {
      setError('아이디를 입력해주세요');
      return;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // OTP 값이 파라미터로 제공된 경우 우선 사용, 없으면 상태값 사용
      const finalOtpId = providedOtpId || otpId;
      const finalOtp = providedOtp || otp;
      
      // OTP 값이 있는 경우 함께 전달
      const response = await authenticateExternal(
        userId.trim(), 
        password,
        finalOtpId || undefined,
        finalOtp || undefined
      );

      // OTP 인증이 필요한 경우
      if (response.errorCode === 'EXTERNAL_ACCESS_OTP_EXCEPTION') {
        setShowOTP(true);
        setIsLoading(false);
        return;
      }

      // 에러가 있는 경우
      if (response.errorCode) {
        setError(response.errorMessage || '로그인에 실패했습니다');
        setIsLoading(false);
        return;
      }

      // 성공한 경우
      if (response.result) {
        const { user, accessToken } = response.result;
        
        // accessToken 저장 (localStorage)
        saveAccessTokenToStorage(accessToken);
        
        // 사용자 정보를 기존 로그인 방식과 동일하게 localStorage에 저장
        // ExternalUser.userName -> name
        // ExternalUser.employeeNo -> employee_id
        // role은 기본값 'user' (기존 users 테이블에서 가져올 수도 있음)
        saveUserToStorage({
          employee_id: user.employeeNo,
          name: user.userName,
          role: 'user', // 기본값, 필요시 users 테이블에서 조회 가능
        });
        
        // Supabase users 테이블에 사용자가 없으면 생성하고, 있으면 access_token 업데이트
        try {
          await ensureUserAndUpdateToken(
            user.employeeNo,
            user.userName,
            accessToken,
            user.email, // email 추가
            'user' // 기본 role
          );
        } catch (dbError) {
          console.error('Supabase 사용자 처리 오류:', dbError);
          // DB 처리 실패해도 로그인은 진행
        }
        
        toast.success('로그인 성공!');
        
        // 성공 후 콜백 실행 (뉴스레터 화면으로 이동)
        // 약간의 지연을 두어 localStorage 저장이 완료되도록 함
        setTimeout(() => {
          onSuccess();
        }, 100);
      } else {
        setError('로그인에 실패했습니다');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin();
  };

  // OTP 검증 성공 핸들러
  const handleOTPVerified = async (verifiedOtpId: string, verifiedOtp: string) => {
    // OTP 값 저장
    setOtpId(verifiedOtpId);
    setOtp(verifiedOtp);
    // 로그인 화면으로 돌아가기
    setShowOTP(false);
    toast.success('OTP 인증이 완료되었습니다. 로그인을 진행합니다.');
    // 자동으로 로그인 시도
    await performLogin(verifiedOtpId, verifiedOtp);
  };

  // OTP 화면 표시
  if (showOTP) {
    return (
      <OTPAuth 
        userId={userId} 
        onBack={() => {
          setShowOTP(false);
          setOtpId('');
          setOtp('');
        }}
        onOTPVerified={handleOTPVerified}
      />
    );
  }

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
              아이디와 비밀번호를 입력하여 로그인하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="userId">아이디</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setError('');
                  }}
                  className={`pl-10 ${error ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={`pl-10 ${error ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

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

