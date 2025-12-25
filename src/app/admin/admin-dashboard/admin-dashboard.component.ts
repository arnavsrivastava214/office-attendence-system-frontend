import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { EmployeeService } from '../../../services/employee.service';
import { ClockService } from '../../../services/clock.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
interface DayWiseAttendance {
  employee: string;
  department: string;
  date: string;
  firstIn: string;
  lastOut: string | null;
  totalMs: number;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  currentView: string = 'employees';
  employees: any[] = [];
  clockRecords: any[] = [];
  selectedEmployee: any = null;
  employeeClockRecords: any[] = [];
  showModal: boolean = false;
  showViewModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  formData: any = {
    full_name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    position: '',
    role: 'employee',
  };
  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  isAdmin: boolean = false;
  isAdminAndHr: boolean = false;
  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private clockService: ClockService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadClockRecords();
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }

  showView(view: string) {
    this.currentView = view;
    if (view === 'employees') {
      this.loadEmployees();
    } else if (view === 'attendance') {
      this.loadClockRecords();
    }
  }

  async loadEmployees() {
    try {
      this.employees = await this.employeeService.getAllEmployees();
    } catch (error: any) {
      this.errorMessage = 'Failed to load employees';
    }
  }

  async loadClockRecords() {
    try {
      this.clockRecords = await this.clockService.getAllClockRecords();
    } catch (error: any) {
      this.errorMessage = 'Failed to load clock records';
    }
  }

  openAddModal() {
    this.modalMode = 'add';
    this.formData = {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      position: '',
      role: 'employee',
    };
    this.showModal = true;
  }

  openEditModal(employee: any) {
    this.modalMode = 'edit';
    this.formData = {
      id: employee.id,
      full_name: employee.full_name,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      role: employee.role,
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async saveEmployee() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.modalMode === 'add') {
        await this.authService.register(this.formData);
        this.successMessage = 'Employee added successfully!';
      } else {
        await this.employeeService.updateEmployee(
          this.formData.id,
          this.formData
        );
        this.successMessage = 'Employee updated successfully!';
      }

      this.closeModal();
      await this.loadEmployees();
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to save employee';
    } finally {
      this.loading = false;
    }
  }

  async deleteEmployee(id: string) {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {

      console.log("madarcg=hod",id);
      
      await this.employeeService.deleteEmployee(id);
      this.successMessage = 'Employee deleted successfully!';
      await this.loadEmployees();
    } catch (error: any) {
      this.errorMessage = 'Failed to delete employee';
    }
  }

  async viewEmployee(employee: any) {
    this.selectedEmployee = employee;
    try {
      this.employeeClockRecords =
        await this.clockService.getEmployeeClockRecords(employee.id);
      console.log('this.employeeClockRecords', this.employeeClockRecords);
    } catch (error: any) {
      this.employeeClockRecords = [];
    }
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedEmployee = null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString();
  }

  calculateDuration(clockIn: string, clockOut: string): string {
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const duration = end - start;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  logout() {
    this.router.navigate(['admin/login']);
    localStorage.clear();
  }

  isNormalEmployee(emp: any): boolean {
    return emp.role !== 'admin' && emp.role !== 'hr';
  }

  getDayWiseWorkingTime() {
    const dayMap: {
      [date: string]: {
        date: string;
        totalMs: number;
      };
    } = {};
  
    for (const record of this.employeeClockRecords) {
      if (!record.clock_in || !record.clock_out) continue;
  
      const date = new Date(record.clock_in).toLocaleDateString();
  
      const start = new Date(record.clock_in).getTime();
      const end = new Date(record.clock_out).getTime();
      const duration = end - start;
  
      if (!dayMap[date]) {
        dayMap[date] = { date, totalMs: 0 };
      }
  
      dayMap[date].totalMs += duration;
    }
  
    return Object.values(dayMap);
  }

  formatTotalDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  getDayWiseAttendance(): DayWiseAttendance[] {
    const map: { [key: string]: DayWiseAttendance } = {};
  
    for (const record of this.clockRecords) {
      if (!record.clock_in) continue;
  
      const date = new Date(record.clock_in).toLocaleDateString();
      const key = `${record.employee_id}_${date}`;
  
      if (!map[key]) {
        map[key] = {
          employee: record.full_name,
          department: record.department,
          date,
          firstIn: record.clock_in,
          lastOut: record.clock_out,
          totalMs: 0
        };
      }
  
      const start = new Date(record.clock_in).getTime();
      const end = record.clock_out
        ? new Date(record.clock_out).getTime()
        : Date.now();
  
      map[key].totalMs += end - start;
  
      if (new Date(record.clock_in) < new Date(map[key].firstIn)) {
        map[key].firstIn = record.clock_in;
      }
  
      if (
        record.clock_out &&
        (!map[key].lastOut ||
          new Date(record.clock_out) > new Date(map[key].lastOut))
      ) {
        map[key].lastOut = record.clock_out;
      }
    }
  
    return Object.values(map);
  }

  get normalEmployees() {
    return this.employees.filter(emp => this.isNormalEmployee(emp));
  }
  
}
