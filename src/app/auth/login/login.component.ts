import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
export class LoginComponent implements AfterViewInit {

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
  viewReady = false;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('video')
  video!: ElementRef<HTMLVideoElement>;
  

  
  

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewReady = true;
    });
  }

  async startCamera() {
    if (this.cameraStarted) return;
  
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
  
      setTimeout(() => {
        if (!this.video) {
          this.errorMessage = 'Camera view not ready';
          return;
        }
  
        const videoEl = this.video.nativeElement;
        videoEl.srcObject = this.stream;
  
        videoEl.onloadeddata = () => {
          videoEl.play();
          this.cameraStarted = true;
          this.isCameraReady = true;
        };
      });
  
    } catch (err: any) {
      console.error('Camera error:', err);
      this.errorMessage = 'Unable to access camera.';
    }
  }
  
  
  
  capturePhoto() {

    if (!this.viewReady) {
      console.warn('View not ready yet');
      return;
    }
    if (!this.cameraStarted) {
      this.startCamera();
      return;
    }
  
    if (this.photoCaptured) {
      this.resetCamera();
      return;
    }
  
    if (!this.video || !this.canvas || !this.isCameraReady) {
      console.warn('Video or canvas not ready');
      return;
    }
  
    const videoEl: HTMLVideoElement = this.video.nativeElement;
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
  
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
  
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
  
    ctx.drawImage(videoEl, 0, 0);
    const dataUrl = canvasEl.toDataURL('image/jpeg');
    this.photoPreview = dataUrl;
    this.photoCaptured = true;
    this.photoFile = this.dataURLtoFile(dataUrl, 'login.jpg');
  
    setTimeout(() => {
      this.stream?.getTracks().forEach(t => t.stop());
    }, 100);
  }
  
  dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], filename, { type: mime });
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

  resetCamera() {
    this.photoCaptured = false;
    this.photoPreview = null;
    this.cameraStarted = false;
    this.isCameraReady = false;
  
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }


  
  
  
}
