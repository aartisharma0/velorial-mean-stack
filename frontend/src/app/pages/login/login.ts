import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
})
export class LoginPage {
  form = { email: '', password: '' };
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  submit() {
    this.error = '';
    if (!this.form.email || !this.form.password) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    this.auth.login(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success(`Welcome back, ${res.user?.name}!`);
        const redirect = this.route.snapshot.queryParams['redirect'] || (res.user?.role === 'admin' ? '/admin' : '/');
        this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid email or password';
      },
    });
  }
}
