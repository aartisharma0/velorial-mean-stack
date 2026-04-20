import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
@Component({ selector: 'app-admin-orders', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './orders.html' })
export class AdminOrders implements OnInit {
  orders: any[] = []; status = '';
  constructor(private svc: OrderService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getAllOrders({status:this.status}).subscribe((r:any) => this.orders = r.orders); }
  sc(s:string) { return {pending:'bg-warning',processing:'bg-info',shipped:'bg-primary',delivered:'bg-success',cancelled:'bg-danger'}[s]||'bg-secondary'; }
}
