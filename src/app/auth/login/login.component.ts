import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  locationCaptured = false;
  latitude!: number;
  longitude!: number;
  accuracy!: number;
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


  constructor(private authService: AuthService, private router: Router) {}




  ngOnInit() {
    this.prefetchLocation();
  }
  
  prefetchLocation() {
    if (!navigator.geolocation) return;
  
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
        this.accuracy = pos.coords.accuracy;
        this.locationCaptured = true;
      },
      () => {},
      {
        enableHighAccuracy: false,
        maximumAge: 60000,         
        timeout: 5000
      }
    );
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.viewReady = true;
    });
  }

  async startCamera() {
    if (this.cameraStarted) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
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
      this.stream?.getTracks().forEach((t) => t.stop());
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

  // async onLogin() {
  //   this.errorMessage = '';

  //   // 🔒 Basic validation
  //   if (!this.email || !this.password) {
  //     this.errorMessage = 'Email and password are required';
  //     return;
  //   }

  //   // Photo is mandatory (as per your requirement)
  //   if (!this.photoCaptured || !this.photoFile) {
  //     this.errorMessage = 'Photo is required for login';
  //     return;
  //   }

  //   this.loading = true;

  //   try {
  //     const result = await this.authService.login(
  //       this.email.trim(), 
  //       this.password,
  //       this.photoFile 
  //     );

  //     if (result?.employee?.role === 'admin') {
  //       this.router.navigate(['/admin']);
  //     } else {
  //       this.router.navigate(['/employee']);
  //     }
  //   } catch (error: any) {
  //     this.errorMessage =
  //       error?.error?.error || error?.message || 'Invalid email or password';
  //   } finally {
  //     this.loading = false;
  //   }
  // }

  resetCamera() {
    this.photoCaptured = false;
    this.photoPreview = null;
    this.cameraStarted = false;
    this.isCameraReady = false;

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

  async getLocation(): Promise<void> {
    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation not supported';
      return;
    }
  
    // Step 1: FAST attempt (PC friendly)
    try {
      await this.getLocationFast();
      return;
    } catch (err) {
      console.warn('Fast location failed, trying high accuracy...');
    }
  
    // Step 2: HIGH accuracy fallback (Mobile GPS)
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.accuracy = position.coords.accuracy;
          this.locationCaptured = true;
          resolve();
        },
        (error) => {
          console.error('Location error:', error);
          this.errorMessage = this.getLocationErrorMessage(error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    });
  }

  getLocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return '❌ Location permission denied. Please allow location access.';
      case error.POSITION_UNAVAILABLE:
        return '❌ Location unavailable. Check GPS or network.';
      case error.TIMEOUT:
        return '❌ Location request timed out. Try again.';
      default:
        return '❌ Failed to get location.';
    }
  }
  
  
  getLocationFast() {
  return new Promise<void>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
        this.accuracy = pos.coords.accuracy;
        this.locationCaptured = true;
        resolve();
      },
      reject,
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 5000
      }
    );
  });
}


  async onLogin() {
    this.errorMessage = '';
  
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }
  
    if (!this.photoCaptured || !this.photoFile) {
      this.errorMessage = 'Photo is required for login';
      return;
    }
  
    if (!this.locationCaptured) {
      await this.getLocationFast();
    }
    
  
    this.loading = true;
  
    try {
      const result = await this.authService.login(
        this.email.trim(),
        this.password,
        this.photoFile,
        {
          latitude: this.latitude,
          longitude: this.longitude,
          accuracy: this.accuracy
        }
      );
  
      if (result?.employee?.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/employee']);
      }
    } catch (error: any) {
      this.errorMessage =
        error?.error?.error || error?.message || 'Invalid email or password';
    } finally {
      this.loading = false;
    }
  }
  
  
}
