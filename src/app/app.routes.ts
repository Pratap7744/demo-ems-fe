import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { managerGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Employee routes
      {
        path: 'employee/dashboard',
        loadComponent: () =>
          import('./employee/dashboard/dashboard.component').then((m) => m.EmployeeDashboardComponent)
      },
      {
        path: 'employee/attendance',
        loadComponent: () =>
          import('./employee/attendance/attendance.component').then((m) => m.AttendanceComponent)
      },
      {
        path: 'employee/apply-leave',
        loadComponent: () =>
          import('./employee/apply-leave/apply-leave.component').then((m) => m.ApplyLeaveComponent)
      },
      {
        path: 'employee/my-leaves',
        loadComponent: () =>
          import('./employee/my-leaves/my-leaves.component').then((m) => m.MyLeavesComponent)
      },
      {
        path: 'employee/my-shifts',
        loadComponent: () =>
          import('./employee/my-shifts/my-shifts.component').then((m) => m.MyShiftsComponent)
      },
      {
        path: 'employee/profile',
        loadComponent: () =>
          import('./employee/profile/profile.component').then((m) => m.ProfileComponent)
      },

      // Manager routes
      {
        path: 'manager/dashboard',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./manager/dashboard/dashboard.component').then((m) => m.ManagerDashboardComponent)
      },
      {
        path: 'manager/employees',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./manager/employees/employees.component').then((m) => m.EmployeesComponent)
      },
      {
        path: 'manager/manage-leaves',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./manager/manage-leaves/manage-leaves.component').then((m) => m.ManageLeavesComponent)
      },
      {
        path: 'manager/manage-shifts',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./manager/manage-shifts/manage-shifts.component').then((m) => m.ManageShiftsComponent)
      },

      { path: '', redirectTo: 'employee/dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];