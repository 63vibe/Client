'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { issueOTP, checkOTP } from '@/src/lib/otpAuth';

interface OTPAuthProps {
  userId: string;
  onBack: () => void;
  onOTPVerified?: (otpId: string, otp: string) => void;
}

export function OTPAuth({ userId, onBack, onOTPVerified }: OTPAuthProps) {
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpId, setOtpId] = useState<string>('');

  const handleSendOTP = async () => {
    if (!userId) {
      setError('사용자 ID가 없습니다');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const response = await issueOTP(userId);

      // 에러가 있는 경우
      if (response.errorCode) {
        setError(response.errorMessage || 'OTP 발송에 실패했습니다');
        setIsSending(false);
        return;
      }

      // 성공한 경우
      if (response.result && response.result.result === 'success') {
        setOtpId(response.result.otpId);
        setOtpSent(true);
        toast.success('OTP 코드가 발송되었습니다');
      } else {
        setError('OTP 발송에 실패했습니다');
      }
    } catch (err: any) {
      console.error('OTP 발송 오류:', err);
      setError(err.message || 'OTP 발송 중 오류가 발생했습니다');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      setError('OTP 코드를 입력해주세요');
      return;
    }

    if (!otpId) {
      setError('OTP ID가 없습니다. 다시 발송해주세요.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await checkOTP(otpId, otpCode.trim(), userId);

      // 에러가 있는 경우
      if (response.errorCode) {
        setError(response.errorMessage || 'OTP 검증에 실패했습니다');
        setIsVerifying(false);
        return;
      }

      // 성공한 경우
      if (response.result && response.result.result === 'success') {
        toast.success('OTP 인증이 완료되었습니다');
        // OTP 검증 성공 시 otpId와 otp를 전달
        if (onOTPVerified) {
          onOTPVerified(otpId, otpCode.trim());
        } else {
          // 로그인 화면으로 돌아가기
          setTimeout(() => {
            onBack();
          }, 500);
        }
      } else {
        setError('OTP 검증에 실패했습니다');
        setIsVerifying(false);
      }
    } catch (err: any) {
      console.error('OTP 검증 오류:', err);
      setError(err.message || 'OTP 검증 중 오류가 발생했습니다');
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otpSent && otpCode.trim()) {
      handleVerifyOTP();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">OTP 인증</h1>
            <p className="text-gray-600">
              OTP 코드를 입력해주세요
            </p>
          </div>

          <div className="space-y-5">
            {!otpSent ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    OTP 코드를 발송하시겠습니까?
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    뒤로가기
                  </Button>
                  
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={handleSendOTP}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        발송 중...
                      </>
                    ) : (
                      'OTP 발송'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    OTP 코드가 발송되었습니다. 입력해주세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otpCode">OTP 코드</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="otpCode"
                      type="text"
                      placeholder="OTP 코드를 입력하세요 (엔터로 확인)"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value);
                        setError('');
                      }}
                      onKeyPress={handleKeyPress}
                      className="pl-10"
                      autoFocus
                      disabled={!otpSent || isVerifying}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                    disabled={isVerifying}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    뒤로가기
                  </Button>
                  
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={handleVerifyOTP}
                    disabled={!otpCode.trim() || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        확인 중...
                      </>
                    ) : (
                      '확인'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleSendOTP}
                    disabled={isSending || isVerifying}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        발송 중...
                      </>
                    ) : (
                      '재발송'
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

