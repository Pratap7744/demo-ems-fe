import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './bar-chart.component.html'
})
export class BarChartComponent {
  data = input.required<{ label: string; value: number }[]>();

  chartData = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.data().map((d) => d.label),
    datasets: [
      {
        data: this.data().map((d) => d.value),
        backgroundColor: '#1e293b',
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  }));

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' }
      },
      x: {
        grid: { display: false }
      }
    }
  };
}