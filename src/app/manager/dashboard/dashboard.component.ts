import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ManagerDashboard } from '../../models/analytics.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [StatCardComponent, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  dashboard = signal<ManagerDashboard | null>(null);
  loading = signal(true);
  leaveTypeEntries = signal<{ type: string; days: number }[]>([]);

  ngOnInit(): void {
    this.analyticsService.getManagerDashboard().subscribe({
      next: (res) => {
        this.dashboard.set(res);
        this.leaveTypeEntries.set(
          Object.entries(res.leave.leaveTypeBreakdown).map(([type, days]) => ({ type, days }))
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}