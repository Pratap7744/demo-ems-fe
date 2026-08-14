import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
// import { ToastComponent } from '../../shared/components/toast/toast.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { EMPLOYEE_NAV, MANAGER_NAV, NavItem } from '../../shared/components/sidebar/nav-items';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  // Reactively picks the nav config based on the logged-in role
  navItems = computed<NavItem[]>(() =>
    this.authService.currentRole() === 'MANAGER' ? MANAGER_NAV : EMPLOYEE_NAV
  );
}