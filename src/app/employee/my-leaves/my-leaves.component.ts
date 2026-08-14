import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LeaveBalanceService } from '../../core/services/leave-balance.service';
import { LeaveRequestService } from '../../core/services/leave-request.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { LeaveBalance } from '../../models/leave-balance.model';
import { LeaveRequest } from '../../models/leave-request.model';

interface LeaveBalanceItem {
  label: string;
  value: number;
  total: number;
  accent: 'teal' | 'blue' | 'amber' | 'rose';
}

interface LeaveHistoryRow {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  approver: string;
  createdAt?: string;
}

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-leaves.component.html',
  styleUrl: './my-leaves.component.css'
})
export class MyLeavesComponent implements OnInit {
  private authService = inject(AuthService);
  private leaveBalanceService = inject(LeaveBalanceService);
  private leaveRequestService = inject(LeaveRequestService);
  private toast = inject(ToastService);

  leaveBalance = signal<LeaveBalanceItem[]>([]);
  requests = signal<LeaveHistoryRow[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  selectedMonth = signal('ALL');
  // New filters: date range and leave type
  startFilter = signal<string | null>(null);
  endFilter = signal<string | null>(null);
  leaveTypeFilter = signal<'ALL' | 'CASUAL' | 'SICK' | 'EARNED'>('ALL');
  currentPage = signal(1);
  pageSize = signal(10);

  monthOptions = computed(() => {
    const months = new Set(
      this.requests().map((request) => {
        const date = new Date(request.startDate);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    );

    return Array.from(months).sort().reverse();
  });

  filteredRequests = computed(() => {
    const start = this.startFilter() ? new Date(this.startFilter() as string) : null;
    const end = this.endFilter() ? new Date(this.endFilter() as string) : null;

    const items = this.requests().filter((request) => {
      // filter by leave type
      if (this.leaveTypeFilter() !== 'ALL') {
        const t = request.type.toUpperCase();
        if (!t.includes(this.leaveTypeFilter())) return false;
      }

      // filter by date range if provided (use startDate of request)
      if (start || end) {
        const rDate = new Date(request.startDate);
        if (start && rDate < start) return false;
        if (end && rDate > end) return false;
      }

      return true;
    });

    return [...items].sort((a, b) => {
      // Always keep pending requests at the top.
      const aIsPending = (a.status ?? '').trim().toLowerCase() === 'pending';
      const bIsPending = (b.status ?? '').trim().toLowerCase() === 'pending';
      if (aIsPending !== bIsPending) {
        return aIsPending ? -1 : 1;
      }

      // For pending and non-pending groups, keep newest first.
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.startDate).getTime();
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.startDate).getTime();
      return bTime - aTime;
    });
  });

  paginatedRequests = computed(() => {
    const all = this.filteredRequests();
    const size = this.pageSize();
    const page = this.currentPage();
    const start = (page - 1) * size;
    const end = start + size;
    return all.slice(start, end);
  });

  totalPages = computed(() => {
    const total = this.filteredRequests().length;
    return Math.ceil(total / this.pageSize());
  });

  canPreviousPage = computed(() => this.currentPage() > 1);
  canNextPage = computed(() => this.currentPage() < this.totalPages());

  // expose role info for template
  isManager = this.authService.isManager();

  ngOnInit(): void {
    this.loadData();
  }

  retryLoad(): void {
    this.loadData();
  }

  remainingDays = computed(() => 
    this.leaveBalance()
      .filter(item => item.label !== 'Unpaid Taken')
      .reduce((sum, item) => sum + item.value, 0)
  );

  getProgressWidth(value: number, total: number): number {
    if (!total) {
      return 0;
    }

    return Math.min((value / total) * 100, 100);
  }

  onMonthChange(value: string): void {
    this.selectedMonth.set(value);
  }

  private loadData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      balance: this.leaveBalanceService.getMyBalance(),
      requests: this.leaveRequestService.getMine()
    }).subscribe({
      next: ({ balance, requests }) => {
        this.leaveBalance.set([
          { label: 'Casual Leave', value: balance.balanceCasualLeave ?? 0, total: balance.totalCasualLeave ?? 12, accent: 'teal' },
          { label: 'Sick Leave', value: balance.balanceSickLeave ?? 0, total: balance.totalSickLeave ?? 10, accent: 'blue' },
          { label: 'Earned Leave', value: balance.balanceEarnedLeave ?? 0, total: balance.totalEarnedLeave ?? 0, accent: 'amber' },
          { label: 'Unpaid Taken', value: balance.unpaidLeavesTaken ?? 0, total: Math.max(balance.unpaidLeavesTaken ?? 0, 0), accent: 'rose' }
        ]);
        this.requests.set(this.mapRequests(requests));
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.leaveBalance.set([]);
        this.requests.set([]);
        this.errorMessage.set(
          err?.status === 403
            ? 'Your leave data could not be loaded because the session is invalid or blocked.'
            : 'Leave data is temporarily unavailable. Please try again in a moment.'
        );
      }
    });
  }

  private mapRequests(items: LeaveRequest[]): LeaveHistoryRow[] {
    if (!items || items.length === 0) {
      return [];
    }

    return [...items]
      .map((item) => ({
        id: item.leaveId ?? '',
        type: this.mapLeaveType(item.leaveType),
        startDate: this.parseDate((item as any).startDate),
        endDate: this.parseDate((item as any).endDate),
        days: item.numberOfDays ?? 0,
        status: this.mapStatus(item.status ?? 'PENDING'),
        approver: item.approvedByName ?? 'N/A',
        createdAt: item.createdAt ?? undefined
      }))
      .sort((a, b) => {
        const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
        return bTime - aTime;
      });
  }

  withdrawRequest(id: string): void {
    this.leaveRequestService.cancel(id).subscribe({
      next: () => {
        this.toast.show('Request withdrawn', 'success');
        this.loadData();
      },
      error: (err: any) => {
        const msg = (err && (err.error || err.message)) || 'Failed to withdraw request';
        this.toast.show(msg, 'error');
      }
    });
  }

  approveRequest(id: string): void {
    if (!confirm('Approve this request?')) return;
    this.leaveRequestService.approve(id).subscribe({
      next: () => {
        this.toast.show('Request approved', 'success');
        this.loadData();
      },
      error: () => this.toast.show('Approve failed', 'error')
    });
  }

  rejectRequest(id: string): void {
    if (!confirm('Reject this request?')) return;
    this.leaveRequestService.reject(id).subscribe({
      next: () => {
        this.toast.show('Request rejected', 'success');
        this.loadData();
      },
      error: () => this.toast.show('Reject failed', 'error')
    });
  }

  deleteRequest(id: string): void {
    if (!confirm('Delete this request?')) return;
    this.leaveRequestService.delete(id).subscribe({
      next: () => {
        this.toast.show('Request deleted', 'success');
        this.loadData();
      },
      error: () => this.toast.show('Delete failed', 'error')
    });
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

  // Converts date from backend: handles both ISO string "2026-08-13"
  // and Java LocalDate array format [2026, 8, 13] (if Jackson config is missing).
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

  goToPreviousPage(): void {
    if (this.canPreviousPage()) {
      this.currentPage.update(page => page - 1);
    }
  }

  goToNextPage(): void {
    if (this.canNextPage()) {
      this.currentPage.update(page => page + 1);
    }
  }
}
