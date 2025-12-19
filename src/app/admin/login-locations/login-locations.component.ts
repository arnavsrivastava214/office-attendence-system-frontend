import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-login-locations',
  imports: [NgFor, CommonModule, RouterModule],
  templateUrl: './login-locations.component.html',
  styleUrl: './login-locations.component.scss'
})
export class LoginLocationsComponent {
  employeeId = '';
  locations: any[] = [];
  filteredLocations: any[] = [];
  viewMode: 'list' | 'grid' = 'list';
  searchTerm = '';
  currentPage = 0;
  itemsPerPage = 10;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id')!;
    this.loadLoginLocations();
  }

  loadLoginLocations() {
    this.errorMessage = '';
    this.authService.getLoginLocations(this.employeeId)
      .subscribe({
        next: (res) => {
          const rawData = JSON.parse(res.login_locations) || [];
          // Sort by time descending (most recent first)
          this.locations = rawData.sort((a: any, b: any) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
          );
          this.filteredLocations = [...this.locations];
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load login locations. Please try again.';
        }
      });
  }

  filterLocations(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filteredLocations = this.locations.filter(loc => 
      loc.location.toLowerCase().includes(this.searchTerm) ||
      loc.time.toLowerCase().includes(this.searchTerm)
    );
    this.currentPage = 0;
  }

  getRecentLoginTime(): string {
    if (this.locations.length === 0) return 'N/A';
    const recent = this.locations[0];
    return this.formatTime(recent.time);
  }

  getMostCommonArea(): string {
    if (this.locations.length === 0) return 'N/A';
    
    const areaCounts: { [key: string]: number } = {};
    this.locations.forEach(loc => {
      const area = this.extractArea(loc.location);
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });
    
    let mostCommon = '';
    let maxCount = 0;
    for (const [area, count] of Object.entries(areaCounts)) {
      if (count > maxCount) {
        mostCommon = area;
        maxCount = count;
      }
    }
    
    return mostCommon || 'N/A';
  }

  getAverageAccuracy(): string {
    if (this.locations.length === 0) return 'N/A';
    
    const sum = this.locations.reduce((acc, loc) => 
      acc + parseFloat(loc.accuracy || 0), 0
    );
    return (sum / this.locations.length).toFixed(1);
  }

  extractArea(location: string): string {
    const parts = location.split(',');
    return parts.length > 0 ? parts[0].trim() : location;
  }

  getAccuracyPercentage(accuracy: string): number {
    const acc = parseFloat(accuracy);
    return Math.max(0, Math.min(100, 100 - (acc / 50) * 100));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  copyCoordinates(location: any) {
    const text = `${location.latitude}, ${location.longitude}`;
    navigator.clipboard.writeText(text).then(() => {
      console.log('Coordinates copied to clipboard:', text);
    });
  }

  viewLocationOnMap(location: any) {
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  }

  viewOnGoogleMaps() {
    if (this.locations.length > 0) {
      const firstLocation = this.locations[0];
      this.viewLocationOnMap(firstLocation);
    }
  }

  shareLocation(location: any) {
    if (navigator.share) {
      navigator.share({
        title: 'Login Location',
        text: `Location: ${location.location}\nCoordinates: ${location.latitude}, ${location.longitude}`,
        url: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      });
    } else {
      this.copyCoordinates(location);
    }
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredLocations.length / this.itemsPerPage);
    const pages = [];
    const maxPages = 5;
    
    let start = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(totalPages, start + maxPages);
    
    if (end - start < maxPages) {
      start = Math.max(0, end - maxPages);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i + 1);
    }
    
    return pages;
  }

  nextPage() {
    if ((this.currentPage + 1) * this.itemsPerPage < this.filteredLocations.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  get paginatedLocations() {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredLocations.slice(start, end);
  }

  get startEntry(): number {
    return this.currentPage * this.itemsPerPage + 1;
  }
  
  get endEntry(): number {
    return Math.min(
      (this.currentPage + 1) * this.itemsPerPage,
      this.filteredLocations.length
    );
  }
  getDayWiseLocations() {
    const map: {
      [date: string]: {
        date: string;
        logins: any[];
      };
    } = {};
  
    for (const loc of this.filteredLocations) {
      const date = new Date(loc.time).toLocaleDateString();
  
      if (!map[date]) {
        map[date] = {
          date,
          logins: []
        };
      }
  
      map[date].logins.push(loc);
    }
  
    return Object.values(map);
  }
  
  getFirstLogin(logins: any[]): string {
    const sorted = [...logins].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    return this.formatTime(sorted[0].time);
  }
  
  getLastLogin(logins: any[]): string {
    const sorted = [...logins].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    return this.formatTime(sorted[0].time);
  }
  
  
}
