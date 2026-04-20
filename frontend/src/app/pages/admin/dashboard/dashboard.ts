import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
})
export class AdminDashboard implements OnInit {
  stats: any = null;
  recentOrders: any[] = [];
  topProducts: any[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.adminService.getDashboard().subscribe({
      next: (res) => {
        this.stats = res.stats || res;
        this.recentOrders = res.recentOrders || [];
        this.topProducts = res.topProducts || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load dashboard data');
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-info text-dark',
      processing: 'bg-primary',
      shipped: 'bg-secondary',
      delivered: 'bg-success',
      cancelled: 'bg-danger',
    };
    return map[status?.toLowerCase()] || 'bg-secondary';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: 'bi-clock',
      confirmed: 'bi-check-circle',
      processing: 'bi-gear',
      shipped: 'bi-truck',
      delivered: 'bi-bag-check',
      cancelled: 'bi-x-circle',
    };
    return map[status?.toLowerCase()] || 'bi-circle';
  }
}
