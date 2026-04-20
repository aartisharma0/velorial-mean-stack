import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-reviews', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './reviews.html' })
export class AdminReviews implements OnInit {
  items: any[] = []; loading = true;
  constructor(private svc: ReviewService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.svc.getAll().subscribe({ next: (r: any) => { this.items = r; this.loading = false; }, error: () => this.loading = false }); }
  
}
