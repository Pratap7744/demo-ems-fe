import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    authService = inject(AuthService);
    private router = inject(Router);

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}