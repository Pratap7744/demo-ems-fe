import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LeaveRequestService } from '../../core/services/leave-request.service';
import { LeaveRequest } from '../../models/leave-request.model';
import { ToastService } from '../../shared/components/toast/toast.service';

interface LeaveReviewRow {
  id: string;
  employeeId: string;
  employeeName: string;
  email: string;
  designation: string;
  leaveType: string;
  reason: string;
  dayType: string;
  halfDaySession: string | null;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface DeletedLeaveRequest {
  id: string;
  deletedAt: number;
  request: LeaveReviewRow;
}

@Component({
  selector: 'app-manage-leaves',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manage-leaves.component.html',
  styleUrl: './manage-leaves.component.css'
})
export class ManageLeavesComponent implements OnInit {
  private leaveRequestService = inject(LeaveRequestService);
  private toastService = inject(ToastService);

  loading = signal(true);
  filterStatus = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  requests = signal<LeaveReviewRow[]>([]);
  searchInput = signal('');
  searchTerm = signal('');
  startDate = signal('');
  endDate = signal('');
  leaveTypeFilter = signal<'ALL' | 'CASUAL' | 'SICK' | 'EARNED'>('ALL');
  showRecycleBin = signal(false);
  recycleBin = signal<DeletedLeaveRequest[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);

  recycleBinCount = computed(() => this.recycleBin().length);

  recycleBinEntries = computed(() =>
    this.recycleBin().filter((entry) => Date.now() - entry.deletedAt <= 48 * 60 * 60 * 1000)
  );

  filteredRequests = computed(() => {
    const status = this.filterStatus();
    const searchValue = this.searchTerm().trim().toLowerCase();
    const start = this.startDate();
    const end = this.endDate();
    const leaveType = this.leaveTypeFilter();
    const rows = this.requests();

    return rows.filter((item) => {
      const matchesStatus = status === 'ALL' || item.status.toUpperCase() === status;
      const matchesSearch =
        !searchValue ||
        item.employeeId.toLowerCase().includes(searchValue) ||
        item.employeeName.toLowerCase().includes(searchValue) ||
        item.email.toLowerCase().includes(searchValue);

      const matchesStartDate =
        !start ||
        new Date(item.startDate).getTime() >= new Date(`${start}T00:00:00`).getTime();

      const matchesEndDate =
        !end ||
        new Date(item.endDate).getTime() <= new Date(`${end}T23:59:59`).getTime();

      const matchesLeaveType =
        leaveType === 'ALL' || item.leaveType.toUpperCase().includes(leaveType);

      return matchesStatus && matchesSearch && matchesStartDate && matchesEndDate && matchesLeaveType;
    });
  });

  totalPages = computed(() => {
    const total = this.filteredRequests().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  paginatedRequests = computed(() => {
    const all = this.filteredRequests();
    const size = this.pageSize();
    const safePage = Math.min(this.currentPage(), this.totalPages());
    const start = (safePage - 1) * size;
    return all.slice(start, start + size);
  });

  canPreviousPage = computed(() => this.currentPage() > 1);
  canNextPage = computed(() => this.currentPage() < this.totalPages());

  summary = computed(() => {
    const rows = this.requests();
    return {
      pending: rows.filter((item) => item.status === 'Pending').length,
      approved: rows.filter((item) => item.status === 'Approved').length,
      rejected: rows.filter((item) => item.status === 'Rejected').length,
      total: rows.length
    };
  });

  constructor() {
    // Keep page index valid while filters and dataset change.
    effect(() => {
      const total = this.totalPages();
      if (this.currentPage() > total) {
        this.currentPage.set(total);
      }
    });
  }

  ngOnInit(): void {
    this.cleanupRecycleBin();
    this.loadRequests();
  }

  private loadRequests(): void {
    this.loading.set(true);
    this.leaveRequestService.getAll().subscribe({
      next: (items) => {
        const rows = items
          .map((item) => ({
            id: item.leaveId ?? '',
            employeeId: item.employee?.employeeId ?? '',
            employeeName: item.employee?.name ?? 'Unknown',
            email: item.employee?.email ?? '',
            designation: item.employee?.designation ?? '',
            leaveType: this.mapLeaveType(item.leaveType),
            reason: item.reason,
            dayType: item.dayType,
            halfDaySession: item.halfDaySession ?? null,
            startDate: item.startDate,
            endDate: item.endDate,
            days: item.numberOfDays ?? 0,
            status: this.mapStatus(item.status ?? 'PENDING')
          }))
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        this.requests.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.requests.set([]);
        this.loading.set(false);
        this.toastService.show('Failed to load leave requests from the backend.', 'error');
      }
    });
  }

  updateFilter(status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'): void {
    this.filterStatus.set(status);
    this.currentPage.set(1);
  }

  applySearch(): void {
    this.searchTerm.set(this.searchInput().trim());
    this.currentPage.set(1);
  }

  approve(id: string): void {
    const previous: LeaveReviewRow[] = [...this.requests()];
    const updated: LeaveReviewRow[] = previous.map((r) =>
      r.id === id ? { ...r, status: 'Approved' } : r
    );
    this.requests.set(updated);
    this.toastService.show('Leave request approved', 'success', 3000);

    this.leaveRequestService.approve(id).subscribe({
      error: () => {
        // rollback
        this.requests.set(previous);
        this.toastService.show('Failed to approve request (server error)', 'error', 5000);
      }
    });
  }

  reject(id: string): void {
    const previous: LeaveReviewRow[] = [...this.requests()];
    const updated: LeaveReviewRow[] = previous.map((r) =>
      r.id === id ? { ...r, status: 'Rejected' } : r
    );
    this.requests.set(updated);
    this.toastService.show('Leave request rejected', 'success', 3000);

    this.leaveRequestService.reject(id).subscribe({
      error: () => {
        this.requests.set(previous);
        this.toastService.show('Failed to reject request (server error)', 'error', 5000);
      }
    });
  }

  delete(id: string): void {
    const requestToDelete = this.requests().find((item) => item.id === id);
    if (!requestToDelete) {
      return;
    }

    const previousRequests = [...this.requests()];
    const previousBin = [...this.recycleBin()];

    this.recycleBin.update((entries) => [
      ...entries,
      {
        id,
        deletedAt: Date.now(),
        request: requestToDelete
      }
    ]);

    const updatedRequests = this.requests().filter((item) => item.id !== id);
    this.requests.set(updatedRequests);
    this.cleanupRecycleBin();
    this.toastService.show('Leave request deleted', 'success', 3000);

    // Attempt to delete on backend; rollback on failure
    this.leaveRequestService.delete(id).subscribe({
      error: () => {
        this.recycleBin.set(previousBin);
        this.requests.set(previousRequests);
        this.toastService.show('Failed to delete request (server error)', 'error', 5000);
      }
    });
  }

  restoreDeletedRequest(id: string): void {
    const deletedItem = this.recycleBin().find((item) => item.id === id);
    if (!deletedItem) {
      return;
    }

    this.recycleBin.update((items) => items.filter((item) => item.id !== id));
    const restoredRequests = [deletedItem.request, ...this.requests()];
    this.requests.set(restoredRequests);
    this.filterStatus.set('PENDING');
    this.currentPage.set(1);
    this.toastService.show('Leave request restored', 'success');
  }

  goToPreviousPage(): void {
    if (this.canPreviousPage()) {
      this.currentPage.update((page) => page - 1);
    }
  }

  goToNextPage(): void {
    if (this.canNextPage()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  getTimeLeftText(entry: DeletedLeaveRequest): string {
    const remainingMs = 48 * 60 * 60 * 1000 - (Date.now() - entry.deletedAt);
    const remainingHours = Math.max(0, Math.ceil(remainingMs / (60 * 60 * 1000)));
    return `${remainingHours}h left`;
  }

  private cleanupRecycleBin(): void {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    this.recycleBin.update((items) => items.filter((entry) => entry.deletedAt > cutoff));
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return 'pending';
    }
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