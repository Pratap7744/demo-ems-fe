import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance',
  standalone: true,
  template: `
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Attendance</p>
          <h1 class="mt-2 text-2xl font-bold text-slate-900">Daily attendance overview</h1>
        </div>
        <button type="button" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">
          Mark attendance
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Present days</p>
          <div class="mt-3 flex items-end justify-between">
            <strong class="text-3xl font-bold text-slate-900">22</strong>
            <span class="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">+3%</span>
          </div>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Late arrivals</p>
          <div class="mt-3 flex items-end justify-between">
            <strong class="text-3xl font-bold text-slate-900">3</strong>
            <span class="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Low</span>
          </div>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Working hours</p>
          <div class="mt-3 flex items-end justify-between">
            <strong class="text-3xl font-bold text-slate-900">164</strong>
            <span class="text-xs font-medium text-slate-500">hrs</span>
          </div>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Overtime</p>
          <div class="mt-3 flex items-end justify-between">
            <strong class="text-3xl font-bold text-slate-900">8</strong>
            <span class="rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">Approved</span>
          </div>
        </article>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Recent attendance</h2>
          <span class="text-sm text-slate-500">This month</span>
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Date</th>
                <th class="px-4 py-3 font-medium">Check-in</th>
                <th class="px-4 py-3 font-medium">Check-out</th>
                <th class="px-4 py-3 font-medium">Hours</th>
                <th class="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr>
                <td class="px-4 py-3">Jul 18</td>
                <td class="px-4 py-3">08:55 AM</td>
                <td class="px-4 py-3">05:45 PM</td>
                <td class="px-4 py-3">8.8 hrs</td>
                <td class="px-4 py-3"><span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">Present</span></td>
              </tr>
              <tr>
                <td class="px-4 py-3">Jul 17</td>
                <td class="px-4 py-3">09:10 AM</td>
                <td class="px-4 py-3">05:50 PM</td>
                <td class="px-4 py-3">8.6 hrs</td>
                <td class="px-4 py-3"><span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Late</span></td>
              </tr>
              <tr>
                <td class="px-4 py-3">Jul 16</td>
                <td class="px-4 py-3">08:50 AM</td>
                <td class="px-4 py-3">05:40 PM</td>
                <td class="px-4 py-3">8.8 hrs</td>
                <td class="px-4 py-3"><span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">Present</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      button { font: inherit; }
    `
  ]
})
export class AttendanceComponent {}