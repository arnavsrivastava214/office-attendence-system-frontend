import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adminlogin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adminlogin.component.html',
  styleUrl: './adminlogin.component.scss'
})
export class AdminloginComponent {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  showAlert = false;
  alertType: 'success' | 'error' = 'success';
  alertTitle = '';
  alertMessage = '';
  private alertTimeout: any;
  

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router:Router) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }
  

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
  
      if (this.isLoading) return;
      this.isLoading = true;
  
      const { email, password, rememberMe } = this.loginForm.value;
  
      try {
        const result = await this.authService.loginAdmin(
          email.trim(),
          password
        );
  
        this.showAlertMessage(
          'success',
          'Login Successful!',
          `Welcome back! ${rememberMe ? 'You will stay logged in.' : ''}`
        );
  
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1000);
  
      } catch (error: any) {
        this.showAlertMessage(
          'error',
          'Login Failed',
          error?.error?.error || 'Invalid email or password'
        );
  
      } finally {
        this.isLoading = false;
      }
  
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
  
      this.showAlertMessage(
        'error',
        'Validation Error',
        'Please fill in all required fields correctly.'
      );
    }
  }

  showAlertMessage(type: 'success' | 'error', title: string, message: string): void {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
    this.showAlert = true;

    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }

    this.alertTimeout = setTimeout(() => {
      this.closeAlert();
    }, 3000);
  }

  closeAlert(): void {
    this.showAlert = false;
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
  }

  ngOnDestroy(): void {
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
  }
}
