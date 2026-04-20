import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(data: any) { return this.http.post<any>(this.api, data); }
  getMyOrders() { return this.http.get<any[]>(`${this.api}/my`); }
  getOrderById(id: string) { return this.http.get<any>(`${this.api}/${id}`); }

  getInvoice(id: string) { return this.http.get<any>(`${this.api}/${id}/invoice`); }

  // Admin
  getAllOrders(params: any = {}) { return this.http.get<any>(`${this.api}/all`, { params }); }
  updateStatus(id: string, data: any) { return this.http.patch<any>(`${this.api}/${id}/status`, data); }
}
