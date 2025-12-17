import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { adminGuard, employeeGuard } from '../guards/auth.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { EmployeeDashboardComponent } from './employee/employee-dashboard/employee-dashboard.component';
import { AdminloginComponent } from './admin/adminlogin/adminlogin.component';

export const routes: Routes = [
        { path: '', redirectTo: 'login', pathMatch: 'full' },
      
        { path: 'login', component: LoginComponent },
      
        { path: 'admin/login', component: AdminloginComponent },
      
        { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
      
        { path: 'employee', component: EmployeeDashboardComponent, canActivate: [employeeGuard] },
      
        { path: '**', redirectTo: 'login' }
      ];
      
      
