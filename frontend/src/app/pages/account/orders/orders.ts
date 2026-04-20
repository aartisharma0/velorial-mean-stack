import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../services/order.service';
@Component({ selector: 'app-orders', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './orders.html' })
export class OrdersPage implements OnInit {
  orders: any[] = [];
  constructor(private svc: OrderService) {}
  ngOnInit() { this.svc.getMyOrders().subscribe(r => this.orders = r); }
  statusClass(s: string) { return {pending:'bg-warning',processing:'bg-info',shipped:'bg-primary',delivered:'bg-success',cancelled:'bg-danger'}[s]||'bg-secondary'; }
}
