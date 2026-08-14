export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER';
  designation: string;
  active: boolean;
  profileImage?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'EMPLOYEE' | 'MANAGER';
  designation: string;
}

export interface UpdateEmployeeRequest {
  name: string;
  designation: string;
}
