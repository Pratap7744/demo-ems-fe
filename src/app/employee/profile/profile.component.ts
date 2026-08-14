import { Component, inject, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Employee } from '../../models/employee.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  @Input() employeeId?: string;

  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  profile = signal<Employee | null>(null);
  loadingProfile = signal(true);
  profileError = signal<string | null>(null);
  savingDetails = signal(false);
  savingPassword = signal(false);
  deactivating = signal(false);
  profileImage = signal<string>('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80');

  // Panel visibility — both closed by default
  editingDetails = signal(false);
  changingPassword = signal(false);

  isViewingOwnProfile = !this.employeeId;
  isManager = this.authService.isManager();

  detailsForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    designation: ['', Validators.required]
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  retryLoad(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loadingProfile.set(true);
    this.profileError.set(null);

    const req = this.employeeId
      ? this.employeeService.getById(this.employeeId)
      : this.employeeService.getMe();

    req.subscribe({
      next: (emp: Employee) => {
        this.profile.set(emp);
        if (emp.profileImage) {
          this.profileImage.set(emp.profileImage);
        }
        this.detailsForm.patchValue({ name: emp.name, designation: emp.designation });
        this.loadingProfile.set(false);
      },
      error: (err) => {
        this.loadingProfile.set(false);
        this.profileError.set(
          err.status === 403
            ? 'Your profile could not be loaded because the session is invalid or blocked.'
            : 'Your profile could not be loaded right now. Please try again.'
        );
        this.toast.show('Failed to load profile', 'error');
      }
    });
  }

  openEditDetails(): void {
    const emp = this.profile();
    if (emp) this.detailsForm.patchValue({ name: emp.name, designation: emp.designation });
    this.editingDetails.set(true);
  }

  cancelEditDetails(): void {
    this.editingDetails.set(false);
  }

  saveDetails(): void {
    const emp = this.profile();
    if (!emp || this.detailsForm.invalid) return;

    this.savingDetails.set(true);
    this.employeeService.update(emp.employeeId, this.detailsForm.getRawValue()).subscribe({
      next: (updated: Employee) => {
        this.profile.set(updated);
        this.savingDetails.set(false);
        this.editingDetails.set(false);
        this.toast.show('Profile updated', 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.savingDetails.set(false);
        this.toast.show(err.error?.message ?? 'Update failed', 'error');
      }
    });
  }

  openChangePassword(): void {
    this.passwordForm.reset();
    this.changingPassword.set(true);
  }

  cancelChangePassword(): void {
    this.changingPassword.set(false);
  }

  changePassword(): void {
    const emp = this.profile();
    if (!emp || this.passwordForm.invalid) return;

    this.savingPassword.set(true);
    this.authService.changePassword(emp.employeeId, this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.changingPassword.set(false);
        this.passwordForm.reset();
        this.toast.show('Password changed successfully', 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.savingPassword.set(false);
        this.toast.show(err.error?.message ?? 'Password change failed', 'error');
      }
    });
  }

  deactivate(): void {
    const emp = this.profile();
    if (!emp) return;
    if (!confirm(`Deactivate ${emp.name}? They will no longer be able to log in.`)) return;

    this.deactivating.set(true);
    this.employeeService.deactivate(emp.employeeId).subscribe({
      next: () => {
        this.profile.set({ ...emp, active: false });
        this.deactivating.set(false);
        this.toast.show('Employee deactivated', 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.deactivating.set(false);
        this.toast.show(err.error?.message ?? 'Deactivation failed', 'error');
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.profileImage.set(result);
      this.profile.set({ ...(this.profile() ?? {} as Employee), profileImage: result });
      this.toast.show('Profile photo updated', 'success');
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.profileImage.set('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80');
    this.profile.set({ ...(this.profile() ?? {} as Employee), profileImage: '' });
    this.toast.show('Profile photo reset', 'success');
  }
}