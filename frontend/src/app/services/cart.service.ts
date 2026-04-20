import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CartItem {
  productId: string; variantId?: string; variantLabel?: string;
  name: string; price: number; image: string; qty: number;
  size?: string; color?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  private discount = signal(0);
  private couponCode = signal<string | null>(null);

  items = this.cartItems.asReadonly();
  coupon = this.couponCode.asReadonly();
  discountAmount = this.discount.asReadonly();

  cartCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.qty, 0));
  subtotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.price * item.qty, 0));
  tax = computed(() => Math.round((this.subtotal() - this.discount()) * 0.18 * 100) / 100);
  shipping = computed(() => this.subtotal() >= 999 ? 0 : 99);
  total = computed(() => this.subtotal() - this.discount() + this.tax() + this.shipping());

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('veloria_cart');
    if (saved) this.cartItems.set(JSON.parse(saved));
    const coup = localStorage.getItem('veloria_coupon');
    if (coup) {
      const c = JSON.parse(coup);
      this.couponCode.set(c.code);
      this.discount.set(c.discount);
    }
  }

  addItem(item: CartItem) {
    const cart = [...this.cartItems()];
    const key = `${item.productId}-${item.variantId || '0'}`;
    const existing = cart.findIndex(i => `${i.productId}-${i.variantId || '0'}` === key);

    if (existing >= 0) {
      cart[existing].qty = Math.min(cart[existing].qty + item.qty, 10);
    } else {
      cart.push(item);
    }

    this.cartItems.set(cart);
    this.save();
    this.revalidateCoupon();
  }

  updateQty(index: number, qty: number) {
    const cart = [...this.cartItems()];
    if (cart[index]) {
      cart[index].qty = qty;
      this.cartItems.set(cart);
      this.save();
      this.revalidateCoupon();
    }
  }

  removeItem(index: number) {
    const cart = this.cartItems().filter((_, i) => i !== index);
    this.cartItems.set(cart);
    this.save();
    if (cart.length === 0) this.removeCoupon();
    else this.revalidateCoupon();
  }

  applyCoupon(code: string, subtotal: number) {
    return this.http.post<any>(`${environment.apiUrl}/coupons/validate`, { code, subtotal });
  }

  setCoupon(code: string, discount: number) {
    this.couponCode.set(code);
    this.discount.set(discount);
    localStorage.setItem('veloria_coupon', JSON.stringify({ code, discount }));
  }

  removeCoupon() {
    this.couponCode.set(null);
    this.discount.set(0);
    localStorage.removeItem('veloria_coupon');
  }

  clearCart() {
    this.cartItems.set([]);
    this.removeCoupon();
    localStorage.removeItem('veloria_cart');
  }

  private save() {
    localStorage.setItem('veloria_cart', JSON.stringify(this.cartItems()));
  }

  private revalidateCoupon() {
    const code = this.couponCode();
    if (!code) return;
    const sub = this.subtotal();
    this.applyCoupon(code, sub).subscribe({
      next: (res) => this.setCoupon(res.code, res.discount),
      error: () => this.removeCoupon(),
    });
  }
}
