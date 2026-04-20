import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-categories', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './categories.html' })
export class AdminCategories implements OnInit {
  items: any[] = []; loading = true;
  constructor(private svc: CategoryService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.svc.getAll().subscribe({ next: (r: any) => { this.items = r; this.loading = false; }, error: () => this.loading = false }); }
  del(id: string) { if(confirm('Delete?')) this.svc.delete(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); } }); }
}
