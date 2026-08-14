export interface NavItem {
  label: string;
  route: string;
  icon: string; // Lucide icon name, e.g. 'home', 'clock'
}

export const EMPLOYEE_NAV: NavItem[] = [
  { label: 'Dashboard', route: '/employee/dashboard', icon: 'home' },
  { label: 'Attendance', route: '/employee/attendance', icon: 'clock' },
  { label: 'Apply Leave', route: '/employee/apply-leave', icon: 'calendar-plus' },
  { label: 'My Leaves', route: '/employee/my-leaves', icon: 'calendar' },
  { label: 'My Shifts', route: '/employee/my-shifts', icon: 'briefcase' },
  { label: 'Profile', route: '/employee/profile', icon: 'user' }
];

export const MANAGER_NAV: NavItem[] = [
  { label: 'Dashboard', route: '/manager/dashboard', icon: 'home' },
  { label: 'Employees', route: '/manager/employees', icon: 'users' },
  { label: 'Manage Leaves', route: '/manager/manage-leaves', icon: 'calendar-check' },
  { label: 'Manage Shifts', route: '/manager/manage-shifts', icon: 'briefcase' }
];