import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environment/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = `${environment.apiUrl}/api/employees`;
  apiUrlforme = `${environment.apiUrl}/api`;


  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /* ================= ALL EMPLOYEES (ADMIN) ================= */
  async getAllEmployees(): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(
        this.apiUrl,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }

  /* ================= EMPLOYEE BY ID (ADMIN) ================= */
  async getEmployeeById(id: string): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/${id}`,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }


  async getMyProfile(): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrlforme}/me`,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }
  

  /* ================= UPDATE EMPLOYEE (ADMIN) ================= */
  async updateEmployee(id: string, updates: any): Promise<any> {
    return await firstValueFrom(
      this.http.put(
        `${this.apiUrl}/${id}`,
        updates,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }

  /* ================= DELETE EMPLOYEE (ADMIN) ================= */
  async deleteEmployee(id: string): Promise<any> {
    return await firstValueFrom(
      this.http.delete(
        `${this.apiUrl}/${id}`,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }
}
