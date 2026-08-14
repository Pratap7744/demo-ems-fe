export interface AttendanceStats {
  daysPresentThisMonth: number;
  totalHoursThisMonth: number;
  avgHoursPerDay: number;
  lastClockIn: string | null;
  lastClockOut: string | null;
}

export interface UpcomingLeave {
  leaveId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: string;
}

export interface EmployeeLeaveStats {
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
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  leaveByType: Record<string, number>;
  upcomingLeave: UpcomingLeave | null;
}

export interface NextShift {
  shiftId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
}

export interface EmployeeShiftStats {
  upcomingShiftsCount: number;
  nextShift: NextShift | null;
}

export interface EmployeeDashboard {
  employeeId: string;
  name: string;
  designation: string;
  attendance: AttendanceStats;
  leave: EmployeeLeaveStats;
  shifts: EmployeeShiftStats;
}

export interface ManagerAttendanceStats {
  clockedInTodayCount: number;
  notClockedInToday: string[];
  avgTeamHoursThisMonth: number;
}

export interface ManagerLeaveStats {
  pendingLeaveRequests: number;
  approvedTotal: number;
  rejectedTotal: number;
  leaveTypeBreakdown: Record<string, number>;
  totalPaidLeaveDaysConsumed: number;
  totalUnpaidLeaveDaysConsumed: number;
  employeesNearingLeaveExhaustion: string[];
}

export interface UpcomingShiftEntry {
  employeeName: string;
  shiftDate: string;
  shiftType: string;
}

export interface ManagerShiftStats {
  upcomingShiftsThisWeek: UpcomingShiftEntry[];
}

export interface ManagerDashboard {
  totalEmployees: number;
  attendance: ManagerAttendanceStats;
  leave: ManagerLeaveStats;
  shifts: ManagerShiftStats;
}