import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

interface QuickLink {
  label: string;
  url: string;
}

interface ContactInfo {
  icon: string;
  text: string;
  type: 'address' | 'phone' | 'email' | 'hours';
}

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  companyName: string = 'Helixson Global Private Limited';
  tagline: string = 'Transforming Digital Landscapes';
  
  // Social Media Links
  socialLinks: SocialLink[] = [
    { icon: 'fab fa-facebook-f', url: '#', label: 'Facebook' },
    { icon: 'fab fa-twitter', url: '#', label: 'Twitter' },
    { icon: 'fab fa-linkedin-in', url: '#', label: 'LinkedIn' },
    { icon: 'fab fa-instagram', url: '#', label: 'Instagram' },
    { icon: 'fab fa-youtube', url: '#', label: 'YouTube' }
  ];
  
  // Quick Links
  quickLinks: QuickLink[] = [
    { label: 'Home', url: '#' },
    { label: 'Services', url: '#' },
    { label: 'Portfolio', url: '#' },
    { label: 'About Us', url: '#' },
    { label: 'Case Studies', url: '#' },
    { label: 'Careers', url: '#' }
  ];
  
  // Contact Information
  contactInfo: ContactInfo[] = [
    { icon: 'fas fa-map-marker-alt', text: '123 Tech Park, Digital City, DC 10001', type: 'address' },
    { icon: 'fas fa-phone', text: '+1 (555) 123-4567', type: 'phone' },
    { icon: 'fas fa-envelope', text: 'info@helixsonglobal.com', type: 'email' },
    { icon: 'fas fa-clock', text: 'Mon - Fri: 9:00 AM - 6:00 PM', type: 'hours' }
  ];
  
  // Legal Links
  legalLinks: QuickLink[] = [
    { label: 'Privacy Policy', url: '#' },
    { label: 'Terms of Service', url: '#' },
    { label: 'Cookie Policy', url: '#' },
    { label: 'Sitemap', url: '#' }
  ];
  
  newsletterEmail: string = '';
  isSubscribed: boolean = false;
  subscriptionMessage: string = '';
  
  constructor() { }
  
  ngOnInit(): void { }
  
  subscribeNewsletter(): void {
    if (this.newsletterEmail && this.validateEmail(this.newsletterEmail)) {
      this.isSubscribed = true;
      this.subscriptionMessage = 'Thank you for subscribing to our newsletter!';
      
      // Simulate API call
      setTimeout(() => {
        this.newsletterEmail = '';
        // In production, you would call your backend service here
        console.log('Subscribed email:', this.newsletterEmail);
      }, 500);
      
      // Reset message after 3 seconds
      setTimeout(() => {
        this.subscriptionMessage = '';
      }, 3000);
    } else {
      this.subscriptionMessage = 'Please enter a valid email address.';
    }
  }
  
  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  trackBySocialLink(index: number, link: SocialLink): string {
    return link.label;
  }
  
  trackByQuickLink(index: number, link: QuickLink): string {
    return link.label;
  }
  
  trackByContactInfo(index: number, info: ContactInfo): string {
    return info.type;
  }
}
