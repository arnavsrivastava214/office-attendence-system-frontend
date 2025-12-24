import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../environment/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {


  
  private apiUrl = `${environment.apiUrl}/api`;

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  async login(
    email: string,
    password: string,
    photo: File,
    location?: { latitude: number; longitude: number; accuracy: number }
  ): Promise<any> {
  
    const formData = new FormData();
  
    formData.append('email', email.trim());
    formData.append('password', password);
  
    if (photo instanceof File) {
      formData.append('photo', photo); 
    }
  
    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('accuracy', location.accuracy.toString());
    }
  
    const response: any = await firstValueFrom(
      this.http.post(`${this.apiUrl}/login`, formData)
    );
  
    const user = response.user || response.employee;
  
    localStorage.setItem('currentUser', JSON.stringify(response));
    localStorage.setItem('userId', user.id.toString());
    localStorage.setItem('userRole', user.role);
  
    this.currentUserSubject.next(response);
  
    return response;
  }
  

  async register(employeeData: any): Promise<any> {
    return await firstValueFrom(
      this.http.post(`${this.apiUrl}/register`, employeeData)
    );
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.apiUrl}/logout`, {}));

    localStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-user-id': localStorage.getItem('userId') || '',
      'x-user-role': localStorage.getItem('userRole') || '',
    });
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.user?.role === 'admin';
  }
  isAdminOrHr(): boolean {
    const role = localStorage.getItem('userRole');
    return role === 'admin' || role === 'hr';
  }

  async loginAdmin(email: string, password: string): Promise<any> {
    const response: any = await firstValueFrom(
      this.http.post(`${this.apiUrl}/admin/login`, {
        email: email.trim(),
        password,
      })
    );

    const user = response.user;

    localStorage.setItem('currentUser', JSON.stringify(response));
    localStorage.setItem('userId', user.id.toString());
    localStorage.setItem('userRole', user.role);

    this.currentUserSubject.next(response);

    return response;
  }

  getLoginLocations(employeeId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/employees/${employeeId}/login-locations`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
  
}
