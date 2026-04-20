import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';

export interface User {
  _id: string; name: string; email: string; phone?: string;
  role: 'user' | 'admin'; isActive: boolean; createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('veloria_token');
    const user = localStorage.getItem('veloria_user');
    if (saved && user) {
      this.token.set(saved);
      this.currentUser.set(JSON.parse(user));
    }
  }

  getToken() { return this.token(); }

  register(data: any) {
    return this.http.post<any>(`${this.api}/register`, data).pipe(tap(res => this.setAuth(res)));
  }

  login(data: any) {
    return this.http.post<any>(`${this.api}/login`, data).pipe(tap(res => this.setAuth(res)));
  }

  logout() {
    localStorage.removeItem('veloria_token');
    localStorage.removeItem('veloria_user');
    this.currentUser.set(null);
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.api}/profile`, data).pipe(tap(res => {
      this.currentUser.set(res.user);
      localStorage.setItem('veloria_user', JSON.stringify(res.user));
    }));
  }

  changePassword(data: any) {
    return this.http.put<any>(`${this.api}/change-password`, data);
  }

  private setAuth(res: any) {
    this.token.set(res.token);
    this.currentUser.set(res.user);
    localStorage.setItem('veloria_token', res.token);
    localStorage.setItem('veloria_user', JSON.stringify(res.user));
  }
}
