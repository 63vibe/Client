// 외부 인증 API 응답 타입
export interface ExternalAuthResponse {
  errorCode: string | null;
  errorMessage: string | null;
  result: ExternalAuthResult | null;
  fncAuthRst: any | null;
}

export interface ExternalAuthResult {
  accessToken: string;
  refreshToken: string;
  cookieToken: string;
  user: ExternalUser;
}

export interface ExternalUser {
  userName: string;
  email: string;
  companyId: string;
  deptId: string;
  sysop: boolean;
  additionalJob: boolean;
  externalUser: boolean;
  sso: boolean;
  systemAdmin: boolean;
  externalWeb: boolean;
  companyName: string;
  deptName: string;
  jobPositionName: string;
  jobClassName: string;
  employeeNo: string;
  pwdExpireUser: boolean;
  jobFunctionName: string;
}

export interface ExternalAuthRequest {
  userId: string;
  password: string;
  domain: string;
  otpId?: string;
  otp?: string;
}

// OTP 발송 요청 타입
export interface IssueOTPRequest {
  userId: string;
  selectedRecvType: number;
  otpId: string;
  locale: string;
}

// OTP 발송 응답 타입
export interface IssueOTPResponse {
  errorCode: string | null;
  errorMessage: string | null;
  result: IssueOTPResult | null;
  fncAuthRst: any | null;
}

export interface IssueOTPResult {
  result: string;
  otpId: string;
  cellphoneno: string;
  type: string;
  testOtp: string;
  status: string;
}

// OTP 검증 요청 타입
export interface CheckOTPRequest {
  otpId: string;
  otp: string;
  userId: string;
}

// OTP 검증 응답 타입
export interface CheckOTPResponse {
  errorCode: string | null;
  errorMessage: string | null;
  result: CheckOTPResult | null;
  fncAuthRst: any | null;
}

export interface CheckOTPResult {
  result: string;
  otaId: string | null;
}

