import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  photoFile!: File;
  photoPreview: string | null = null;

  cameraStarted = false;
  photoCaptured = false;
  stream!: MediaStream;
  isCameraReady = false;


  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async startCamera() {
    if (this.cameraStarted) return;
  
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = this.video.nativeElement;
      video.srcObject = this.stream;
  
      await new Promise<void>((resolve) => {
        video.onloadeddata = () => {
          video.play();
          this.cameraStarted = true;
          this.isCameraReady = true;
          resolve();
        };
      });
  
    } catch (err: any) {
      console.error('Camera error:', err);
  
      if (err.name === 'NotAllowedError') {
        this.errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        this.errorMessage = 'No camera device found.';
      } else {
        this.errorMessage = 'Unable to access camera.';
      }
    }
  }
  
  
  
  capturePhoto() {
    // First click → open camera
    if (!this.cameraStarted) {
      this.startCamera();
      return;
    }
  
    // 🚫 prevent capture until ready
    if (!this.isCameraReady) return;
  
    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
  
    canvas.toBlob(blob => {
      if (!blob) return;
  
      this.photoFile = new File([blob], 'login.jpg', { type: 'image/jpeg' });
      this.photoPreview = URL.createObjectURL(blob);
      this.photoCaptured = true;
  
      this.stream.getTracks().forEach(track => track.stop());
    }, 'image/jpeg');
  }
  
  
  
  async onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password || !this.photoCaptured) {
      this.errorMessage = 'Email, password and photo are required';
      return;
    }

    this.loading = true;

    try {
      const result = await this.authService.login(
        this.email,
        this.password,
        this.photoFile
      );

      if (result.employee.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/employee']);
      }

    } catch (error: any) {
      this.errorMessage = error?.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
