import { Component } from '@angular/core';

@Component({
  selector: 'app-my-shifts',
  standalone: true,
  template: `
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">My shifts</p>
          <h1 class="mt-2 text-2xl font-bold text-slate-900">Upcoming schedule</h1>
        </div>
        <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
          Swap shift
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Current shift</p>
          <div class="mt-3">
            <strong class="text-xl font-bold text-slate-900">Morning</strong>
            <p class="mt-2 text-sm text-slate-600">08:00 AM – 05:00 PM</p>
          </div>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Next rotation</p>
          <div class="mt-3">
            <strong class="text-xl font-bold text-slate-900">Evening</strong>
            <p class="mt-2 text-sm text-slate-600">Starts Jul 22</p>
          </div>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Working days</p>
          <div class="mt-3">
            <strong class="text-xl font-bold text-slate-900">5 / 7</strong>
            <p class="mt-2 text-sm text-slate-600">2 days off this week</p>
          </div>
        </article>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Shift timeline</h2>
          <span class="text-sm text-slate-500">Week of Jul 18</span>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p class="font-semibold text-slate-900">Mon, Jul 18</p>
              <p class="text-sm text-slate-500">Morning shift</p>
            </div>
            <span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">08:00 - 17:00</span>
          </div>
          <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p class="font-semibold text-slate-900">Tue, Jul 19</p>
              <p class="text-sm text-slate-500">Morning shift</p>
            </div>
            <span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">08:00 - 17:00</span>
          </div>
          <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p class="font-semibold text-slate-900">Wed, Jul 20</p>
              <p class="text-sm text-slate-500">Evening shift</p>
            </div>
            <span class="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">13:00 - 22:00</span>
          </div>
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
export class MyShiftsComponent {}