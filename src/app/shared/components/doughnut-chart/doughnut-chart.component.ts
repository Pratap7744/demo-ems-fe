import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './doughnut-chart.component.html'
})
export class DoughnutChartComponent {
  labels = input.required<string[]>();
  values = input.required<number[]>();
  colors = input<string[]>(['#16a34a', '#ef4444', '#3b82f6', '#f59e0b']);

  chartData = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: this.labels(),
    datasets: [
      {
        data: this.values(),
        backgroundColor: this.colors(),
        borderWidth: 0
      }
    ]
  }));

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, padding: 16, font: { size: 12 } }
      }
    }
  };
}