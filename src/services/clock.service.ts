import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environment/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ClockService {

  private apiUrl = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /* ================= MY CLOCK RECORDS ================= */
  async getMyClockRecords(): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(
        `${this.apiUrl}/my-records`,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }

  /* ================= ACTIVE CLOCK RECORD ================= */
  async getActiveClockRecord(): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(
        `${this.apiUrl}/active`,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }

  /* ================= CLOCK IN ================= */
  async clockIn(): Promise<any> {
    return await firstValueFrom(
      this.http.post(
        `${this.apiUrl}/clock-in`,
        {},
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }
  
  /* ================= CLOCK OUT ================= */
  async clockOut(): Promise<any> {
    return await firstValueFrom(
      this.http.post(
        `${this.apiUrl}/clock-out`,
        {},
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }

  /* ================= ALL RECORDS (ADMIN) ================= */
  async getAllClockRecords(): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(
        `${this.apiUrl}/all`,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }

  /* ================= EMPLOYEE RECORDS (ADMIN) ================= */
  async getEmployeeClockRecords(employeeId: string): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(
        `${this.apiUrl}/employee/${employeeId}`,
        { headers: this.authService.getAuthHeaders() }
      )
    );
  }
}
