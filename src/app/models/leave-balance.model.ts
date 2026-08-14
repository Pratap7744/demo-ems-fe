export interface LeaveBalance {
  balanceId: string;
  employee?: {
    employeeId?: string;
    name?: string;
    email?: string;
    designation?: string;
  };
  totalCasualLeave: number;
  usedCasualLeave: number;
  balanceCasualLeave: number;
  totalSickLeave: number;
  usedSickLeave: number;
  balanceSickLeave: number;
  totalEarnedLeave: number;
  usedEarnedLeave: number;
  balanceEarnedLeave: number;
  unpaidLeavesTaken: number;
  leaveResetYear?: number | null;
}