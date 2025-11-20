export type UserRole = 'user' | 'admin';

export interface User {
  employee_id: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  employee_id: string;
  name: string;
  role: UserRole;
}

