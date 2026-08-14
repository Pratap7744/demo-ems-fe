import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toast = inject(ToastService);

    loading = signal(false);
    showPassword = false;

    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    submit(): void {
        if (this.form.invalid) return;
        this.loading.set(true);

        this.authService.login(this.form.getRawValue()).subscribe({
            next: (res) => {
                this.loading.set(false);
                this.toast.show('Login successful!', 'success', 2000);
                this.router.navigate([res.role === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard']);
            },
            error: (err) => {
                this.loading.set(false);
                const message = err?.error?.message || err?.message || 'Login failed. Please check your credentials and backend connection.';
                this.toast.show(message, 'error', 5000);
            }
        });
    }
}