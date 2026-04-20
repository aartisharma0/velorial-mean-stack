import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AddressService } from '../../services/address.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-checkout', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './checkout.html' })
export class CheckoutPage implements OnInit {
  addresses: any[] = []; selectedAddressId = ''; paymentMethod = 'cod'; loading = false;
  newAddr: any = { type:'shipping',fullName:'',phone:'',street:'',city:'',state:'',zip:'',country:'India' };

  constructor(public cart: CartService, private addrSvc: AddressService, private orderSvc: OrderService, private toast: ToastService, private router: Router) {}

  ngOnInit() { this.loadAddrs(); }
  loadAddrs() { this.addrSvc.getAll().subscribe(r => { this.addresses = r; this.selectedAddressId = r.find((a:any)=>a.isDefault)?._id || r[0]?._id || ''; }); }
  saveAddr() { this.addrSvc.create(this.newAddr).subscribe({ next:()=>{this.toast.success('Added');this.loadAddrs();}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
  placeOrder() {
    if (!this.selectedAddressId) { this.toast.error('Select address'); return; }
    this.loading = true;
    const addr = this.addresses.find(a=>a._id===this.selectedAddressId);
    this.orderSvc.createOrder({
      items: this.cart.items().map(i=>({productId:i.productId,variantId:i.variantId,name:i.name,qty:i.qty})),
      shippingAddress: addr, paymentMethod: this.paymentMethod, couponCode: this.cart.coupon()
    }).subscribe({
      next:(r:any)=>{this.cart.clearCart();this.router.navigate(['/checkout/success',r.order._id]);},
      error:(e:any)=>{this.loading=false;this.toast.error(e.error?.message||'Failed');}
    });
  }
}
