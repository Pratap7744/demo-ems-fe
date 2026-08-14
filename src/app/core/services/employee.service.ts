import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, UpdateEmployeeRequest } from '../../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private baseUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/me`);
  }

  getById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  update(id: string, request: UpdateEmployeeRequest): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, request);
  }

  deactivate(id: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

 
}