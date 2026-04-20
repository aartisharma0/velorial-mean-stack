import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/admin`;
  private couponApi = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  getDashboard() { return this.http.get<any>(`${this.api}/dashboard`); }

  // Customers
  getCustomers(params?: any) { return this.http.get<any>(`${this.api}/customers`, { params }); }
  toggleCustomerStatus(id: string) { return this.http.patch<any>(`${this.api}/customers/${id}/toggle`, {}); }

  // Subscribers
  getSubscribers() { return this.http.get<any[]>(`${this.api}/subscribers`); }
  deleteSubscriber(id: string) { return this.http.delete<any>(`${this.api}/subscribers/${id}`); }

  // Enquiries
  getEnquiries(params?: any) { return this.http.get<any[]>(`${this.api}/enquiries`, { params }); }
  getEnquiry(id: string) { return this.http.get<any>(`${this.api}/enquiries/${id}`); }
  updateEnquiryStatus(id: string, status: string) { return this.http.patch<any>(`${this.api}/enquiries/${id}/status`, { status }); }
  deleteEnquiry(id: string) { return this.http.delete<any>(`${this.api}/enquiries/${id}`); }

  // Coupons
  getCoupons() { return this.http.get<any[]>(this.couponApi); }
  createCoupon(data: any) { return this.http.post<any>(this.couponApi, data); }
  updateCoupon(id: string, data: any) { return this.http.put<any>(`${this.couponApi}/${id}`, data); }
  deleteCoupon(id: string) { return this.http.delete<any>(`${this.couponApi}/${id}`); }

  // Public
  subscribe(email: string) { return this.http.post<any>(`${this.api}/subscribe`, { email }); }
  submitEnquiry(data: any) { return this.http.post<any>(`${this.api}/enquiries`, data); }
}
