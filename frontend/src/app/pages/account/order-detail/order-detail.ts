import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../services/order.service';

@Component({ selector: 'app-od', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './order-detail.html' })
export class OrderDetailPage implements OnInit {
  order: any = null;
  constructor(private route: ActivatedRoute, private orderSvc: OrderService) {}
  ngOnInit() { this.orderSvc.getOrderById(this.route.snapshot.params['id']).subscribe(o => this.order = o); }

  statusClass(s: string) {
    return { pending: 'bg-warning', processing: 'bg-info', shipped: 'bg-primary', delivered: 'bg-success', cancelled: 'bg-danger' }[s] || 'bg-secondary';
  }

  openInvoice() {
    this.orderSvc.getInvoice(this.order._id).subscribe(res => {
      const win = window.open('', '_blank');
      if (win) { win.document.write(res.html); win.document.close(); }
    });
  }
}
