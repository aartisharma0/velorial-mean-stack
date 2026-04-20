import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.html',
})
export class RegisterPage {
  form = { name: '', email: '', phone: '', password: '', confirmPassword: '' };
  acceptTerms = false;
  loading = false;
  error = '';
  showPassword = false;
  showConfirm = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  submit() {
    this.error = '';
    if (!this.form.name || !this.form.email || !this.form.password || !this.form.confirmPassword) {
      this.error = 'Please fill in all required fields';
      return;
    }
    if (this.form.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    if (!this.acceptTerms) {
      this.error = 'Please accept the terms and conditions';
      return;
    }
    this.loading = true;
    const { confirmPassword, ...payload } = this.form;
    this.auth.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success(`Welcome to Veloria, ${res.user?.name}!`);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Registration failed. Please try again.';
      },
    });
  }

  get passwordStrength(): number {
    const p = this.form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  }

  get strengthLabel(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'Weak';
    if (s <= 3) return 'Fair';
    if (s === 4) return 'Good';
    return 'Strong';
  }

  get strengthColor(): string {
    const s = this.passwordStrength;
    if (s <= 1) return '#dc3545';
    if (s <= 3) return '#ffc107';
    if (s === 4) return '#0dcaf0';
    return '#198754';
  }
}
