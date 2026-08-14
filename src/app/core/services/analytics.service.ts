import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmployeeDashboard, ManagerDashboard } from '../../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private baseUrl = `${environment.apiUrl}/analytics`;

    constructor(private http: HttpClient) { }

    getEmployeeDashboard(employeeId: string): Observable<EmployeeDashboard> {
        return this.http.get<EmployeeDashboard>(`${this.baseUrl}/employee/${employeeId}`);
    }

    getManagerDashboard(): Observable<ManagerDashboard> {
        return this.http.get<ManagerDashboard>(`${this.baseUrl}/manager`);
    }
}