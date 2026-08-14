export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED';
export type DayType = 'FULL_DAY' | 'HALF_DAY';
export type HalfDaySession = 'FIRST_HALF' | 'SECOND_HALF';
export type LeaveCategory = 'PAID' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  leaveId?: string;
  employee?: {
    employeeId?: string;
    name?: string;
    email?: string;
    designation?: string;
  };
  createdAt?: string;
  leaveType: LeaveType;
  reason: string;
  dayType: DayType;
  halfDaySession?: HalfDaySession | null;
  startDate: string;
  endDate: string;
  numberOfDays?: number;
  leaveCategory?: LeaveCategory;
  status?: LeaveStatus | string;
  approvedByName?: string;
}
