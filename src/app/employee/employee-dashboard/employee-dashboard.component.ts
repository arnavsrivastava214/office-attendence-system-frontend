import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { EmployeeService } from '../../../services/employee.service';
import { ClockService } from '../../../services/clock.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent {
  employee: any = null;
  clockRecords: any[] = [];
  activeRecord: any = null;
  isClockedIn: boolean = false;
  currentTime: string = "";
  successMessage: string = "";
  errorMessage: string = "";
  loading: boolean = false;
  elapsedTime: string = "";
  timerInterval: any;
  private destroy$ = new Subject<void>();


  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private clockService: ClockService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.reloadAllData();
  
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.reloadAllData();
      });
  }
  
  

  async reloadAllData() {
    await this.loadEmployeeData();
    await this.loadClockRecords();
    await this.syncClockState();

    this.cdr.detectChanges();
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  async loadEmployeeData() {
    try {
      this.employee = await this.employeeService.getMyProfile();
    } catch (error: any) {
      this.errorMessage = "Failed to load employee data";
    }
  }

  async loadClockRecords() {
    try {
      this.clockRecords = await this.clockService.getMyClockRecords();
    } catch (error: any) {
      this.errorMessage = "Failed to load clock records";
    }
  }

  async checkActiveClockRecord() {
    try {
      this.activeRecord = await this.clockService.getActiveClockRecord();
      this.isClockedIn = !!this.activeRecord;

      if (this.isClockedIn) {
        this.startElapsedTimer();
      }
    } catch (error) {
      console.error("Error checking active clock record:", error);
    }
  }

  async clockIn() {
    this.loading = true;
  
    try {
      const record = await this.clockService.clockIn();
  
      // ✅ CLEAR ERROR ONLY AFTER SUCCESS
      this.errorMessage = "";
  
      this.activeRecord = record;
      this.isClockedIn = true;
  
      this.startElapsedTimer();
  
      this.successMessage = "Successfully clocked in!";
  
      await this.loadClockRecords();
  
    } catch (error: any) {
      this.successMessage = "";
      this.errorMessage = error?.error?.error || "Failed to clock in";
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
  
  

  async clockOut() {
    this.loading = true;
    this.errorMessage = "";
    this.successMessage = "";
  
    try {
      await this.clockService.clockOut();
  
      this.activeRecord = null;
      this.isClockedIn = false;
  
      this.stopElapsedTimer();
  
      this.successMessage = "Successfully clocked out!";
      await this.loadClockRecords();
  
      // 🔥 FORCE UI UPDATE
      this.cdr.detectChanges();
  
    } catch (error: any) {
      this.errorMessage = error?.error?.error || "Failed to clock out";
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
  

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
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

  async logout() {
    try {
      if (this.isClockedIn) {
        await this.clockService.clockOut();

        this.activeRecord = null;
        this.isClockedIn = false;
        this.stopElapsedTimer();
      }
    } catch (error) {
      console.error("Auto clock-out failed on logout", error);
    } finally {
      this.authService.logout();
    }
  }

  startElapsedTimer() {
    if (!this.activeRecord) return;
  
    clearInterval(this.timerInterval);
  
    this.timerInterval = setInterval(() => {
      const start = new Date(this.activeRecord.clock_in).getTime();
      const now = Date.now();
      const diff = now - start;
  
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
      this.elapsedTime = `${hours}h ${minutes}m ${seconds}s`;
  
      // 🔥 FORCE CHANGE DETECTION EVERY SECOND
      this.cdr.detectChanges();
  
    }, 1000);
  }
  

  stopElapsedTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.elapsedTime = "";
  }

  async syncClockState() {
    try {
      const record = await this.clockService.getActiveClockRecord();

      this.activeRecord = record;
      this.isClockedIn = !!record;

      if (this.isClockedIn) {
        this.startElapsedTimer();
      } else {
        this.stopElapsedTimer();
      }
    } catch (error) {
      console.error("Failed to sync clock state", error);
    }
  }

  getTodayRecords(): number {
    const today = new Date().toDateString();
    return this.clockRecords.filter(
      (record) => new Date(record.clock_in).toDateString() === today
    ).length;
  }

  getWeeklyHours(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyRecords = this.clockRecords.filter(
      (record) => new Date(record.clock_in) >= oneWeekAgo && record.clock_out
    );

    let totalHours = 0;
    weeklyRecords.forEach((record) => {
      const hours = this.calculateDuration(
        record.clock_in,
        record.clock_out
      ).split("h")[0];
      totalHours += parseInt(hours) || 0;
    });

    return totalHours;
  }

  getAverageHours(): number {
    if (this.clockRecords.length === 0) return 0;

    let totalHours = 0;
    let completedRecords = 0;

    this.clockRecords.forEach((record) => {
      if (record.clock_out) {
        const hours = this.calculateDuration(
          record.clock_in,
          record.clock_out
        ).split("h")[0];
        totalHours += parseInt(hours) || 0;
        completedRecords++;
      }
    });

    return completedRecords > 0 ? Math.round(totalHours / completedRecords) : 0;
  }

  ngOnDestroy() {
    this.stopElapsedTimer();
      this.destroy$.next();
      this.destroy$.complete();
    
  }

  getTodayTotalTime(): string {
    const today = new Date().toDateString();
    let totalMinutes = 0;
  
    this.clockRecords.forEach((record) => {
      if (
        new Date(record.clock_in).toDateString() === today
      ) {
        const start = new Date(record.clock_in).getTime();
        const end = record.clock_out
          ? new Date(record.clock_out).getTime()
          : Date.now(); // 🔥 live session
  
        totalMinutes += Math.floor((end - start) / (1000 * 60));
      }
    });
  
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return `${hours}h ${minutes}m`;
  }
  
  
}
