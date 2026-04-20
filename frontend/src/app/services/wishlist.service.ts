import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private api = `${environment.apiUrl}/wishlist`;
  wishlistIds = signal<string[]>([]);

  constructor(private http: HttpClient) {}

  loadIds() {
    return this.http.get<string[]>(`${this.api}/ids`).pipe(
      tap(ids => this.wishlistIds.set(ids))
    );
  }

  getAll() { return this.http.get<any[]>(this.api); }

  toggle(productId: string) {
    return this.http.post<any>(`${this.api}/toggle`, { productId }).pipe(
      tap(res => {
        const ids = [...this.wishlistIds()];
        if (res.added) ids.push(productId);
        else this.wishlistIds.set(ids.filter(id => id !== productId));
        if (res.added) this.wishlistIds.set([...ids]);
      })
    );
  }

  isWishlisted(productId: string) {
    return this.wishlistIds().includes(productId);
  }
}
