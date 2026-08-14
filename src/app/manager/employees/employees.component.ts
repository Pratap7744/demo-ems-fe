import { Component } from '@angular/core';

@Component({
  selector: 'app-employees',
  standalone: true,
  template: `
    <h1 class="text-xl font-semibold text-slate-800">Employees</h1>
    <p class="mt-2 text-sm text-slate-500">Ongoing — the employee list will appear here.</p>
  `
})
export class EmployeesComponent {}