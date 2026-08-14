import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LeaveBalanceService } from '../../core/services/leave-balance.service';
import { LeaveRequestService } from '../../core/services/leave-request.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { LeaveRequest, LeaveType } from '../../models/leave-request.model';

interface LeaveSummary {
  label: string;
  value: number;
  total: number;
  accent: 'teal' | 'blue' | 'amber' | 'rose';
}

interface RecentLeaveRow {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;

  if (!start || !end) {
    return null;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  return endDate < startDate ? { invalidDateRange: true } : null;
}

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './apply-leave.component.html',
  styleUrl: './apply-leave.component.css'
})
export class ApplyLeaveComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveBalanceService = inject(LeaveBalanceService);
  private leaveRequestService = inject(LeaveRequestService);
  private toastService = inject(ToastService);

  leaveForm = this.fb.nonNullable.group(
    {
      leaveType: ['CASUAL' as LeaveType, Validators.required],
      dayType: ['FULL_DAY' as 'FULL_DAY' | 'HALF_DAY', Validators.required],
      halfDaySession: [null as 'FIRST_HALF' | 'SECOND_HALF' | null],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    },
    { validators: dateRangeValidator }
  );

  submitting = signal(false);
  leaveSummary = signal<LeaveSummary[]>([]);
  recentRequests = signal<RecentLeaveRow[]>([]);
  loadingData = signal(true);
  loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.watchDayType();
    this.loadData();
  }

  retryLoad(): void {
    this.loadData();
  }

  private watchDayType(): void {
    this.leaveForm.get('dayType')?.valueChanges.subscribe((dayType) => {
      const halfDaySession = this.leaveForm.get('halfDaySession');
      const selectedDayType = (dayType ?? 'FULL_DAY') as 'FULL_DAY' | 'HALF_DAY';

      if ((selectedDayType ?? 'FULL_DAY') === 'HALF_DAY') {
        halfDaySession?.setValidators([Validators.required]);
        if (!halfDaySession?.value) {
          halfDaySession?.setValue('FIRST_HALF');
        }
      } else {
        halfDaySession?.clearValidators();
        halfDaySession?.setValue(null);
      }

      halfDaySession?.updateValueAndValidity();
    });
  }

  totalDays = computed(() => {
    const start = this.leaveForm.controls.startDate.value;
    const end = this.leaveForm.controls.endDate.value;
    const dayType = (this.leaveForm.controls.dayType.value ?? 'FULL_DAY') as 'FULL_DAY' | 'HALF_DAY';

    if (!start || !end) {
      return 0;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return 0;
    }

    if ((dayType ?? 'FULL_DAY') === 'HALF_DAY') {
      return 0.5;
    }

    let weekdays = 0;
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) {
        weekdays++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return weekdays;
  });

  remainingLeaveDays = computed(() => {
    const cards = this.leaveSummary();
    return cards
      .filter(item => item.label !== 'Unpaid Taken')
      .reduce((sum, item) => sum + item.value, 0);
  });

  selectedLeaveBalance = computed(() => {
    const activeType = (this.leaveForm.controls.leaveType.value ?? 'CASUAL') as LeaveType;
    const item = this.leaveSummary().find((entry) => {
      const label = entry.label.toLowerCase();
      return activeType === 'CASUAL' ? label.includes('casual') : activeType === 'SICK' ? label.includes('sick') : label.includes('earned');
    });

    if (!item) {
      return { label: this.mapLeaveType(activeType), value: 0, total: 0, used: 0 };
    }

    return {
      label: item.label,
      value: item.value,
      total: item.total,
      used: Math.max(item.total - item.value, 0)
    };
  });

  private loadData(): void {
    this.loadingData.set(true);
    this.loadError.set(null);

    forkJoin({
      balance: this.leaveBalanceService.getMyBalance(),
      requests: this.leaveRequestService.getMine()
    }).subscribe({
      next: ({ balance, requests }) => {
        this.leaveSummary.set([
          { label: 'Casual Leave', value: balance.balanceCasualLeave ?? 0, total: balance.totalCasualLeave ?? 12, accent: 'teal' },
          { label: 'Sick Leave', value: balance.balanceSickLeave ?? 0, total: balance.totalSickLeave ?? 10, accent: 'blue' },
          { label: 'Earned Leave', value: balance.balanceEarnedLeave ?? 0, total: balance.totalEarnedLeave ?? 0, accent: 'amber' },
          { label: 'Unpaid Taken', value: balance.unpaidLeavesTaken ?? 0, total: Math.max(balance.unpaidLeavesTaken ?? 0, 0), accent: 'rose' }
        ]);

        this.recentRequests.set(
          [...requests]
            .map((request) => ({
              id: request.leaveId ?? '',
              type: this.mapLeaveType(request.leaveType),
              startDate: this.parseDate((request as any).startDate),
              endDate: this.parseDate((request as any).endDate),
              days: request.numberOfDays ?? 0,
              status: this.mapStatus(request.status ?? 'PENDING')
            }))
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .slice(0, 4)
        );

        this.loadingData.set(false);
      },
      error: (err: any) => {
        this.loadingData.set(false);
        this.leaveSummary.set([]);
        this.recentRequests.set([]);
        this.loadError.set(
          err?.status === 403
            ? 'Your leave data could not be loaded because the session is invalid or blocked.'
            : 'Leave data is temporarily unavailable. Please try again in a moment.'
        );
      }
    });
  }

  resetForm(): void {
    this.leaveForm.reset({
      leaveType: 'CASUAL',
      dayType: 'FULL_DAY',
      halfDaySession: null,
      startDate: '',
      endDate: '',
      reason: ''
    });
    this.leaveForm.markAsPristine();
    this.leaveForm.markAsUntouched();
  }

  submitLeave(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    const selectedLeaveType = (this.leaveForm.value.leaveType ?? 'CASUAL') as LeaveType;
    const requestedDays = this.totalDays();

    // Validate available balance for each paid leave type
    const labelMap: Record<string, string> = { CASUAL: 'Casual Leave', SICK: 'Sick Leave', EARNED: 'Earned Leave' };
    const targetLabel = labelMap[selectedLeaveType];
    if (this.leaveSummary().length === 0) {
      this.toastService.show('Leave balance is not loaded. Please retry.', 'error', 4000, 'bottom-right');
      return;
    }
    if (targetLabel) {
      const balanceItem = this.leaveSummary().find((item) => item.label === targetLabel);
      if (!balanceItem || balanceItem.value <= 0) {
        this.toastService.show(`No ${targetLabel} balance available.`, 'error', 4000, 'bottom-right');
        return;
      }
      if (requestedDays > balanceItem.value) {
        this.toastService.show(`Only ${balanceItem.value} day(s) of ${targetLabel} remaining.`, 'error', 4000, 'bottom-right');
        return;
      }
    }

    this.submitting.set(true);

    const selectedDayType = (this.leaveForm.value.dayType ?? 'FULL_DAY') as 'FULL_DAY' | 'HALF_DAY';

    const payload: LeaveRequest = {
      leaveType: selectedLeaveType,
      reason: this.leaveForm.value.reason ?? '',
      dayType: selectedDayType,
      halfDaySession: selectedDayType === 'HALF_DAY' ? (this.leaveForm.value.halfDaySession as 'FIRST_HALF' | 'SECOND_HALF' | null) : null,
      startDate: this.leaveForm.value.startDate ?? '',
      endDate: this.leaveForm.value.endDate ?? '',
      numberOfDays: requestedDays,
      status: 'PENDING'
    };

    this.leaveRequestService.applyMine(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastService.show('Leave request submitted successfully.', 'success', 3500, 'bottom-right');

        // Refresh server-authoritative data instead of mutating local balances optimistically
        this.resetForm();
        this.loadData();
      },
      error: (err) => {
        this.submitting.set(false);
        const message = err?.error?.message ?? 'Leave request could not be submitted.';
        this.toastService.show(message, 'error', 5000, 'bottom-right');
      }
    });
  }

  getLeaveOptionText(type: LeaveType): string {
    const labelMap: Record<LeaveType, string> = {
      CASUAL: 'Casual Leave',
      SICK: 'Sick Leave',
      EARNED: 'Earned Leave'
    };

    const item = this.leaveSummary().find((entry) => entry.label === labelMap[type]);
    const available = item ? item.value : 0;
    return `${available}`;
  }

  private mapLeaveType(value: string): string {
    switch (value) {
      case 'CASUAL':
        return 'Casual Leave';
      case 'SICK':
        return 'Sick Leave';
      case 'EARNED':
        return 'Earned Leave';
      default:
        return value;
    }
  }

  // Handles both ISO string "2026-08-13" and Java LocalDate array [2026, 8, 13].
  private parseDate(value: any): string {
    if (!value) return '';
    if (Array.isArray(value)) {
      const [year, month, day] = value;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return String(value);
  }

  private mapStatus(value: string): 'Pending' | 'Approved' | 'Rejected' {
    switch ((value ?? '').toUpperCase()) {
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Pending';
    }
  }
}

