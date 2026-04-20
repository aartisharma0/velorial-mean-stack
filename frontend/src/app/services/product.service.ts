import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(params: any = {}) {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<any>(this.api, { params: httpParams });
  }

  getProductBySlug(slug: string) {
    return this.http.get<any>(`${this.api}/slug/${slug}`);
  }

  getProductById(id: string) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  searchAutocomplete(q: string) {
    return this.http.get<any[]>(`${this.api}/search`, { params: { q } });
  }

  getRelatedProducts(id: string) {
    return this.http.get<any[]>(`${this.api}/${id}/related`);
  }

  // Admin
  createProduct(data: any) {
    return this.http.post<any>(this.api, data);
  }

  updateProduct(id: string, data: any) {
    return this.http.put<any>(`${this.api}/${id}`, data);
  }

  deleteProduct(id: string) {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
