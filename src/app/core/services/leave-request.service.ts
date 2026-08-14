import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaveRequest } from '../../models/leave-request.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private baseUrl = `${environment.apiUrl}/leave`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  applyLeave(employeeId: string, payload: LeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.baseUrl}/apply/${employeeId}`, payload);
  }

  applyMine(payload: LeaveRequest): Observable<LeaveRequest> {
    const employeeId = this.authService.currentEmployeeId();
    if (!employeeId) {
      return throwError(() => new Error('Employee session not found'));
    }
    return this.http.post<LeaveRequest>(`${this.baseUrl}/apply/${employeeId}`, payload);
  }

  getByEmployee(employeeId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/${employeeId}`);
  }

  getMine(): Observable<LeaveRequest[]> {
    const employeeId = this.authService.currentEmployeeId();
    if (!employeeId) {
      return throwError(() => new Error('Employee session not found'));
    }
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/${employeeId}`);
  }

  getAll(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/all`);
  }

  approve(id: string): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.baseUrl}/approve/${id}`, {});
  }

  reject(id: string): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.baseUrl}/reject/${id}`, {});
  }

  cancel(id: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/cancel/${id}`, { responseType: 'text' });
  }

  delete(id: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { responseType: 'text' });
  }
}
