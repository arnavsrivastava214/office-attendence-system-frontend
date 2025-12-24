import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environment/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = `${environment.apiUrl}/api/employees`;

  constructor(private http: HttpClient) {}

  /* ================= ALL EMPLOYEES (ADMIN) ================= */
  async getAllEmployees(): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(this.apiUrl)
    );
  }

  /* ================= EMPLOYEE BY ID (ADMIN) ================= */
  async getEmployeeById(id: string): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}`)
    );
  }

  /* ================= MY PROFILE ================= */
  async getMyProfile(): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/api/me`)
    );
  }

  /* ================= UPDATE EMPLOYEE (ADMIN) ================= */
  async updateEmployee(id: string, updates: any): Promise<any> {
    return await firstValueFrom(
      this.http.put(`${this.apiUrl}/${id}`, updates)
    );
  }

  /* ================= DELETE EMPLOYEE (ADMIN) ================= */
  async deleteEmployee(id: string): Promise<any> {
    return await firstValueFrom(
      this.http.delete(`${this.apiUrl}/${id}`)
    );
  }
}
