import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-subscribers', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './subscribers.html' })
export class AdminSubscribers implements OnInit {
  items: any[] = []; loading = true;
  constructor(private svc: AdminService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.svc.getSubscribers().subscribe({ next: (r: any) => { this.items = r; this.loading = false; }, error: () => this.loading = false }); }
  
}
