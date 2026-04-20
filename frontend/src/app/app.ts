import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet />
    <!-- Toast Notifications -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index:9999;">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast show border-0 shadow-lg mb-2" style="animation: slideInRight 0.3s ease;">
          <div class="toast-body d-flex align-items-center gap-2 py-3 px-4"
               [style.background]="toast.type === 'success' ? '#d4edda' : toast.type === 'error' ? '#f8d7da' : '#d1ecf1'"
               [style.color]="toast.type === 'success' ? '#155724' : toast.type === 'error' ? '#721c24' : '#0c5460'"
               style="border-radius:10px;">
            <i class="bi" [class.bi-check-circle-fill]="toast.type === 'success'" [class.bi-exclamation-triangle-fill]="toast.type === 'error'" [class.bi-info-circle-fill]="toast.type === 'info'" class="fs-5"></i>
            <span class="fw-semibold">{{ toast.message }}</span>
            <button type="button" class="btn-close ms-auto" style="font-size:0.7rem;" (click)="toastService.remove(toast.id)"></button>
          </div>
        </div>
      }
    </div>
  `,
})
export class App {
  constructor(public toastService: ToastService) {}
}
