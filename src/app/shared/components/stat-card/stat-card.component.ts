import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html'
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number | null>();
  hint = input<string>('');
  accent = input<'slate' | 'green' | 'red' | 'blue' | 'amber'>('slate');
}