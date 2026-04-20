import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: string) { return this.http.get<any[]>(`${this.api}/product/${productId}`); }
  createReview(data: any) { return this.http.post<any>(this.api, data); }

  // Admin
  getAll(params?: any) { return this.http.get<any[]>(`${this.api}/all`, { params }); }
  toggleApproval(id: string) { return this.http.patch<any>(`${this.api}/${id}/toggle`, {}); }
  delete(id: string) { return this.http.delete<any>(`${this.api}/${id}`); }
}
