import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-products', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './products.html' })
export class AdminProducts implements OnInit {
  items: any[] = []; loading = true;
  constructor(private svc: ProductService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.svc.getProducts({}).subscribe({ next: (r: any) => { this.items = r.products; this.loading = false; }, error: () => this.loading = false }); }
  del(id: string) { if(confirm('Delete?')) this.svc.deleteProduct(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); } }); }
}
