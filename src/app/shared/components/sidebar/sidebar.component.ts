import { Component, Input, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from './nav-items';
import { LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() items: NavItem[] = [];

  private authService = inject(AuthService);
  private router = inject(Router);

  collapsed = signal(false);

  toggle(): void {
    this.collapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
