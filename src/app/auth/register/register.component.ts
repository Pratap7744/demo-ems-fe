import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ErrorResponse } from '../../models/error-response.model';
import { noNumbersValidator, strongPasswordValidator } from '../../core/validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = false;
  showPassword = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, noNumbersValidator()]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPasswordValidator()]],
    designation: ['', Validators.required],
    role: ['EMPLOYEE' as 'EMPLOYEE' | 'MANAGER', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.authService.register(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.show('Registration successful!', 'success', 2000);
        this.router.navigate([res.role === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        const message = err?.error?.message || err?.message || 'Registration failed. Please check your input and backend connection.';
        this.toast.show(message, 'error', 5000);
      }
    });
  }
}