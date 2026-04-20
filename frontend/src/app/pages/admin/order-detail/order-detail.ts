import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-aod', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './order-detail.html' })
export class AdminOrderDetail implements OnInit {
  order: any = null; newStatus = ''; tracking = '';
  constructor(private route: ActivatedRoute, private svc: OrderService, private toast: ToastService) {}
  ngOnInit() { this.svc.getOrderById(this.route.snapshot.params['id']).subscribe(o => { this.order = o; this.newStatus = o.status; this.tracking = o.trackingNumber || ''; }); }
  updateStatus() { this.svc.updateStatus(this.order._id, {status:this.newStatus,trackingNumber:this.tracking}).subscribe({ next:(r:any)=>{this.toast.success('Updated');this.order.status=this.newStatus;}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
}
