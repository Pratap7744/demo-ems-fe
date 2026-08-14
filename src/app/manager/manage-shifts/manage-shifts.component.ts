import { Component } from '@angular/core';

@Component({
  selector: 'app-manage-shifts',
  standalone: true,
  template: `
    <h1 class="text-xl font-semibold text-slate-800">Manage Shifts</h1>
    <p class="mt-2 text-sm text-slate-500">Ongoing — shift assignment will appear here.</p>
  `
})
export class ManageShiftsComponent {}