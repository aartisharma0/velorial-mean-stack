import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-coupons', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './coupons.html' })
export class AdminCoupons implements OnInit {
  items: any[] = []; loading = true;
  constructor(private svc: AdminService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.svc.getCoupons().subscribe({ next: (r: any) => { this.items = r; this.loading = false; }, error: () => this.loading = false }); }
  del(id: string) { if(confirm('Delete?')) this.svc.deleteCoupon(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); } }); }
}
