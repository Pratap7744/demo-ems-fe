import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaveBalance } from '../../models/leave-balance.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LeaveBalanceService {
  private baseUrl = `${environment.apiUrl}/balance`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getBalance(employeeId: string): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.baseUrl}/${employeeId}`);
  }

  getMyBalance(): Observable<LeaveBalance> {
    const employeeId = this.authService.currentEmployeeId();
    if (!employeeId) {
      return throwError(() => new Error('Employee session not found'));
    }
    return this.http.get<LeaveBalance>(`${this.baseUrl}/${employeeId}`);
  }

  adjustLeaves(employeeId: string, casual: number, sick: number, earned: number): Observable<LeaveBalance> {
    return this.http.put<LeaveBalance>(`${this.baseUrl}/adjust/${employeeId}`, null, {
      params: {
        casual: casual.toString(),
        sick: sick.toString(),
        earned: earned.toString()
      }
    });
  }
}