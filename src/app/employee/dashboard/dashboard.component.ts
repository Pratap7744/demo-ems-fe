import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { EmployeeDashboard } from '../../models/analytics.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { DoughnutChartComponent } from '../../shared/components/doughnut-chart/doughnut-chart.component';
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [StatCardComponent, DatePipe, BarChartComponent, DoughnutChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);

  dashboard = signal<EmployeeDashboard | null>(null);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  leaveTypeEntries = signal<{ type: string; days: number }[]>([]);

  leaveStatusSplit = computed(() => {
    const d = this.dashboard();
    if (!d) return { labels: [], values: [] };
    return {
      labels: ['Pending', 'Approved', 'Rejected'],
      values: [d.leave.pendingCount, d.leave.approvedCount, d.leave.rejectedCount]
    };
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  retryLoad(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const id = this.authService.currentEmployeeId();
    if (!id) {
      this.loading.set(false);
      this.errorMessage.set('Your session has expired. Please log in again.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.analyticsService.getEmployeeDashboard(id).subscribe({
      next: (res) => {
        this.dashboard.set(res);
        this.leaveTypeEntries.set(
          Object.entries(res.leave.leaveByType).map(([type, days]) => ({ type, days }))
        );
        this.loading.set(false);
      },
      error: (err) => {
        const status = err?.status;
        this.loading.set(false);
        this.errorMessage.set(
          status === 403
            ? 'The dashboard could not load because your session is blocked or expired. Please log in again.'
            : 'The dashboard is temporarily unavailable. Please try again in a moment.'
        );
      }
    });
  }
}