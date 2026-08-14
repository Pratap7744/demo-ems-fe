export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    employeeId: string;
    role: 'EMPLOYEE' | 'MANAGER';
}


export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}