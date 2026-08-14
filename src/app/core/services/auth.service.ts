import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, ChangePasswordRequest } from '../../models/auth.model';
import { RegisterRequest } from '../../models/employee.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    private tokenSignal = signal<string | null>(null);
    private employeeIdSignal = signal<string | null>(null);
    private roleSignal = signal<'EMPLOYEE' | 'MANAGER' | null>(null);

    isLoggedIn = computed(() => !!this.tokenSignal());
    isManager = computed(() => this.roleSignal() === 'MANAGER');
    currentEmployeeId = computed(() => this.employeeIdSignal());
    currentRole = computed(() => this.roleSignal());

    constructor(private http: HttpClient) {
        this.loadSessionFromStorage();
    }

    private loadSessionFromStorage(): void {
        if (!this.isBrowser) {
            return;
        }

        const token = localStorage.getItem('token');
        const employeeId = localStorage.getItem('employeeId');
        const role = localStorage.getItem('role');

        if (token) {
            this.tokenSignal.set(token);
        }
        if (employeeId) {
            this.employeeIdSignal.set(employeeId);
        }
        if (role === 'EMPLOYEE' || role === 'MANAGER') {
            this.roleSignal.set(role);
        }
    }

    getToken(): string | null {
        if (this.isBrowser && !this.tokenSignal()) {
            this.loadSessionFromStorage();
        }

        return this.tokenSignal();
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
            .pipe(tap((res) => this.setSession(res)));
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
            .pipe(tap((res) => this.setSession(res)));
    }

    changePassword(id: string, request: ChangePasswordRequest): Observable<string> {
        return this.http.put(`${environment.apiUrl}/auth/change-password`, request, { responseType: 'text' });
    }

    logout(): void {
        if (this.isBrowser) {
            localStorage.removeItem('token');
            localStorage.removeItem('employeeId');
            localStorage.removeItem('role');
        }
        this.tokenSignal.set(null);
        this.employeeIdSignal.set(null);
        this.roleSignal.set(null);
    }

    private setSession(res: AuthResponse): void {
        if (this.isBrowser) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('employeeId', res.employeeId);
            localStorage.setItem('role', res.role);
        }
        this.tokenSignal.set(res.token);
        this.employeeIdSignal.set(res.employeeId);
        this.roleSignal.set(res.role);
    }
}
