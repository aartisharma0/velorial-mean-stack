import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html',
})
export class CartPage {
  couponInput = '';
  couponApplying = false;
  couponError = '';

  constructor(
    public cart: CartService,
    public auth: AuthService,
    private toast: ToastService,
  ) {}

  updateQty(index: number, qty: number) {
    if (qty < 1) { this.removeItem(index); return; }
    if (qty > 10) return;
    this.cart.updateQty(index, qty);
  }

  removeItem(index: number) {
    this.cart.removeItem(index);
    this.toast.info('Item removed from cart');
  }

  applyCoupon() {
    if (!this.couponInput.trim()) return;
    this.couponApplying = true;
    this.couponError = '';
    this.cart.applyCoupon(this.couponInput.trim().toUpperCase(), this.cart.subtotal()).subscribe({
      next: (res) => {
        this.cart.setCoupon(res.code, res.discount);
        this.couponApplying = false;
        this.couponInput = '';
        this.toast.success(`Coupon applied! You saved ₹${res.discount}`);
      },
      error: (err) => {
        this.couponApplying = false;
        this.couponError = err?.error?.message || 'Invalid or expired coupon';
      },
    });
  }

  removeCoupon() {
    this.cart.removeCoupon();
    this.couponError = '';
    this.couponInput = '';
    this.toast.info('Coupon removed');
  }
}
