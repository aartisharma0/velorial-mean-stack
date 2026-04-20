// Script to generate all remaining Angular component pages
import fs from 'fs';
import path from 'path';

const BASE = 'src/app';

function write(filePath, content) {
  const full = path.join(BASE, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n');
  console.log(`  Created: ${filePath}`);
}

function comp(dir, name, cls, template, extra = '') {
  const svcPath = dir.split('/').length > 3 ? '../../../services' : '../../services';
  write(`${dir}/${name}.ts`, `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
${extra}

@Component({ selector: 'app-${name}', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './${name}.html' })
export class ${cls} implements OnInit {
  data: any = null; items: any[] = []; loading = false; error = '';
  constructor(public route: ActivatedRoute, public router: Router) {}
  ngOnInit() {}
}
  `);
  write(`${dir}/${name}.html`, template);
}

console.log('Generating Angular pages...\n');

// === CHECKOUT ===
write('pages/checkout/checkout.ts', `
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
`);

write('pages/checkout/checkout.html', `
<div class="container py-4">
  <h3 class="fw-bold mb-4" style="font-family:'Playfair Display',serif;">Checkout</h3>
  <div class="row g-4">
    <div class="col-lg-7">
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Shipping Address</h6></div>
        <div class="card-body">
          @for (addr of addresses; track addr._id) {
            <div class="form-check border rounded p-3 mb-2">
              <input class="form-check-input" type="radio" name="addr" [value]="addr._id" [(ngModel)]="selectedAddressId">
              <label class="form-check-label"><strong>{{addr.fullName}}</strong> - {{addr.street}}, {{addr.city}} {{addr.zip}}</label>
            </div>
          }
          @if (addresses.length===0) { <p class="text-muted">Add an address below.</p> }
          <hr>
          <form (ngSubmit)="saveAddr()" class="row g-2">
            <div class="col-6"><input class="form-control form-control-sm" [(ngModel)]="newAddr.fullName" name="fn" placeholder="Full Name" required></div>
            <div class="col-6"><input class="form-control form-control-sm" [(ngModel)]="newAddr.phone" name="ph" placeholder="Phone"></div>
            <div class="col-12"><input class="form-control form-control-sm" [(ngModel)]="newAddr.street" name="st" placeholder="Street" required></div>
            <div class="col-4"><input class="form-control form-control-sm" [(ngModel)]="newAddr.city" name="ci" placeholder="City" required></div>
            <div class="col-4"><input class="form-control form-control-sm" [(ngModel)]="newAddr.state" name="sa" placeholder="State" required></div>
            <div class="col-4"><input class="form-control form-control-sm" [(ngModel)]="newAddr.zip" name="zi" placeholder="PIN" required></div>
            <div class="col-12"><button class="btn btn-sm btn-outline-dark" type="submit">Save Address</button></div>
          </form>
        </div>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Payment</h6></div>
        <div class="card-body">
          <div class="form-check mb-2"><input class="form-check-input" type="radio" name="pm" value="cod" [(ngModel)]="paymentMethod" id="cod"><label class="form-check-label" for="cod">Cash on Delivery</label></div>
          <div class="form-check"><input class="form-check-input" type="radio" name="pm" value="stripe" [(ngModel)]="paymentMethod" id="stripe"><label class="form-check-label" for="stripe">Card (Stripe)</label></div>
        </div>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Summary</h6></div>
        <div class="card-body">
          @for (item of cart.items(); track $index) { <div class="d-flex justify-content-between small mb-1"><span>{{item.name}} x{{item.qty}}</span><span>&#8377;{{item.price*item.qty}}</span></div> }
          <hr>
          <div class="d-flex justify-content-between small"><span>Subtotal</span><span>&#8377;{{cart.subtotal()}}</span></div>
          <div class="d-flex justify-content-between small"><span>Tax</span><span>&#8377;{{cart.tax()}}</span></div>
          <div class="d-flex justify-content-between small"><span>Shipping</span><span>{{cart.shipping()===0?'FREE':'&#8377;'+cart.shipping()}}</span></div>
          <hr>
          <div class="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span style="color:var(--veloria-primary)">&#8377;{{cart.total()}}</span></div>
          <button class="btn btn-veloria w-100 mt-3" (click)="placeOrder()" [disabled]="loading||!selectedAddressId">
            @if(loading){<span class="spinner-border spinner-border-sm me-2"></span>}Place Order
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`);

// === CHECKOUT SUCCESS ===
write('pages/checkout-success/checkout-success.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
@Component({ selector: 'app-cs', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './checkout-success.html' })
export class CheckoutSuccessPage implements OnInit {
  order: any = null;
  constructor(private route: ActivatedRoute, private svc: OrderService) {}
  ngOnInit() { this.svc.getOrderById(this.route.snapshot.params['id']).subscribe(o => this.order = o); }
}
`);

write('pages/checkout-success/checkout-success.html', `
<div class="container py-5 text-center">
  <div class="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style="width:80px;height:80px;background:rgba(40,167,69,0.1);"><i class="bi bi-check-lg fs-1 text-success"></i></div>
  <h3 class="fw-bold" style="font-family:'Playfair Display',serif;">Order Confirmed!</h3>
  @if(order) { <p class="text-muted">Order <strong>{{order.orderNumber}}</strong> | Total: <strong style="color:var(--veloria-primary)">&#8377;{{order.total}}</strong></p> }
  <div class="d-flex gap-2 justify-content-center mt-4"><a routerLink="/account/orders" class="btn btn-veloria">My Orders</a><a routerLink="/shop" class="btn btn-outline-secondary">Continue Shopping</a></div>
</div>
`);

// === WISHLIST ===
write('pages/wishlist/wishlist.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
@Component({ selector: 'app-wishlist', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './wishlist.html' })
export class WishlistPage implements OnInit {
  items: any[] = [];
  constructor(private wSvc: WishlistService, private cart: CartService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.wSvc.getAll().subscribe(r => this.items = r); }
  remove(pid: string) { this.wSvc.toggle(pid).subscribe(() => { this.toast.success('Removed'); this.load(); }); }
  addToCart(p: any) { this.cart.addItem({productId:p._id,name:p.name,price:p.price,image:p.primaryImage,qty:1}); this.toast.success('Added to bag'); }
}
`);

write('pages/wishlist/wishlist.html', `
<div class="container py-4">
  <h3 class="fw-bold mb-4" style="font-family:'Playfair Display',serif;">My Wishlist</h3>
  @if(items.length>0) {
    <div class="row g-3">@for(w of items;track w._id){
      <div class="col-6 col-md-3"><div class="card product-card h-100">
        <button class="wishlist-btn active" (click)="remove(w.product._id)"><i class="bi bi-heart-fill"></i></button>
        <a [routerLink]="['/product',w.product.slug]"><img [src]="w.product.primaryImage" class="card-img-top product-image"></a>
        <div class="card-body p-2"><h6 class="small fw-semibold">{{w.product.name}}</h6><span class="product-price">&#8377;{{w.product.price}}</span>
        <button class="btn btn-veloria btn-sm w-100 mt-2" (click)="addToCart(w.product)">Add to Bag</button></div>
      </div></div>
    }</div>
  } @else { <div class="text-center py-5"><i class="bi bi-heart fs-1" style="color:var(--veloria-primary-light)"></i><h5 class="mt-3">Wishlist empty</h5><a routerLink="/shop" class="btn btn-veloria mt-2">Shop Now</a></div> }
</div>
`);

// === CONTACT ===
write('pages/contact/contact.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
@Component({ selector: 'app-contact', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './contact.html' })
export class ContactPage {
  form: any = { name:'', email:'', phone:'', subject:'', message:'' };
  constructor(private svc: AdminService, private toast: ToastService) {}
  submit() { this.svc.submitEnquiry(this.form).subscribe({ next:(r:any)=>{this.toast.success(r.message);this.form={name:'',email:'',phone:'',subject:'',message:''};}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
}
`);

write('pages/contact/contact.html', `
<div class="container py-5" style="max-width:800px;">
  <h2 class="fw-bold text-center mb-4" style="font-family:'Playfair Display',serif;">Get in Touch</h2>
  <div class="card border-0 shadow-sm"><div class="card-body p-4">
    <form (ngSubmit)="submit()">
      <div class="row g-3">
        <div class="col-md-6"><input class="form-control" [(ngModel)]="form.name" name="name" placeholder="Your Name" required></div>
        <div class="col-md-6"><input class="form-control" [(ngModel)]="form.email" name="email" placeholder="Email" required></div>
        <div class="col-md-6"><input class="form-control" [(ngModel)]="form.phone" name="phone" placeholder="Phone"></div>
        <div class="col-md-6"><select class="form-select" [(ngModel)]="form.subject" name="subject" required><option value="">Select Subject</option><option>Order Issue</option><option>Product Query</option><option>Return/Exchange</option><option>Feedback</option><option>Other</option></select></div>
        <div class="col-12"><textarea class="form-control" [(ngModel)]="form.message" name="msg" rows="5" placeholder="Your message..." required></textarea></div>
        <div class="col-12"><button class="btn btn-veloria" type="submit"><i class="bi bi-send me-2"></i>Send Message</button></div>
      </div>
    </form>
  </div></div>
</div>
`);

// === FORGOT PASSWORD ===
write('pages/forgot-password/forgot-password.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({ selector: 'app-fp', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './forgot-password.html' })
export class ForgotPasswordPage { email=''; sent=false; submit() { this.sent=true; } }
`);

write('pages/forgot-password/forgot-password.html', `
<div class="auth-wrapper d-flex align-items-center justify-content-center" style="min-height:100vh;">
  <div class="col-11 col-sm-8 col-md-6 col-lg-4">
    <div class="text-center mb-4"><h2 class="text-white fw-bold" style="font-family:'Playfair Display',serif;letter-spacing:4px;">VELORIA</h2></div>
    <div class="card auth-card"><div class="card-body p-4">
      <h5 class="fw-bold text-center mb-3">Forgot Password?</h5>
      @if(!sent) {
        <form (ngSubmit)="submit()"><input class="form-control mb-3" [(ngModel)]="email" name="email" type="email" placeholder="Email" required>
        <button class="btn btn-veloria w-100" type="submit">Send Reset Link</button></form>
      } @else { <div class="alert alert-success">If an account exists, a reset link has been sent.</div> }
      <p class="text-center small mt-3"><a routerLink="/login" style="color:var(--veloria-primary)">Back to Login</a></p>
    </div></div>
  </div>
</div>
`);

// === ACCOUNT PROFILE ===
write('pages/account/profile/profile.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-profile', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './profile.html' })
export class ProfilePage {
  name = ''; phone = ''; currentPassword = ''; newPassword = ''; confirmPassword = '';
  constructor(public auth: AuthService, private toast: ToastService) { this.name = auth.user()?.name || ''; this.phone = auth.user()?.phone || ''; }
  updateProfile() { this.auth.updateProfile({name:this.name,phone:this.phone}).subscribe({ next:(r:any)=>this.toast.success('Updated'), error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
  changePassword() {
    if (this.newPassword!==this.confirmPassword) { this.toast.error('Passwords do not match'); return; }
    this.auth.changePassword({currentPassword:this.currentPassword,password:this.newPassword}).subscribe({ next:(r:any)=>{this.toast.success('Password changed');this.currentPassword='';this.newPassword='';this.confirmPassword='';}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') });
  }
}
`);

write('pages/account/profile/profile.html', `
<div class="container py-4">
  <h4 class="fw-bold mb-4">My Profile</h4>
  <div class="row g-4">
    <div class="col-md-6"><div class="card border-0 shadow-sm"><div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Profile</h6></div><div class="card-body">
      <form (ngSubmit)="updateProfile()">
        <div class="mb-3"><label class="form-label small fw-semibold">Name</label><input class="form-control" [(ngModel)]="name" name="name" required></div>
        <div class="mb-3"><label class="form-label small fw-semibold">Email</label><input class="form-control" [value]="auth.user()?.email" disabled></div>
        <div class="mb-3"><label class="form-label small fw-semibold">Phone</label><input class="form-control" [(ngModel)]="phone" name="phone"></div>
        <button class="btn btn-veloria btn-sm" type="submit">Save</button>
      </form>
    </div></div></div>
    <div class="col-md-6"><div class="card border-0 shadow-sm"><div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Change Password</h6></div><div class="card-body">
      <form (ngSubmit)="changePassword()">
        <div class="mb-3"><input class="form-control" [(ngModel)]="currentPassword" name="cp" type="password" placeholder="Current Password" required></div>
        <div class="mb-3"><input class="form-control" [(ngModel)]="newPassword" name="np" type="password" placeholder="New Password" required></div>
        <div class="mb-3"><input class="form-control" [(ngModel)]="confirmPassword" name="cnp" type="password" placeholder="Confirm Password" required></div>
        <button class="btn btn-veloria btn-sm" type="submit">Update Password</button>
      </form>
    </div></div></div>
  </div>
</div>
`);

// === ACCOUNT ORDERS ===
write('pages/account/orders/orders.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../services/order.service';
@Component({ selector: 'app-orders', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './orders.html' })
export class OrdersPage implements OnInit {
  orders: any[] = [];
  constructor(private svc: OrderService) {}
  ngOnInit() { this.svc.getMyOrders().subscribe(r => this.orders = r); }
  statusClass(s: string) { return {pending:'bg-warning',processing:'bg-info',shipped:'bg-primary',delivered:'bg-success',cancelled:'bg-danger'}[s]||'bg-secondary'; }
}
`);

write('pages/account/orders/orders.html', `
<div class="container py-4">
  <h4 class="fw-bold mb-4">My Orders</h4>
  @for(order of orders; track order._id) {
    <div class="card border-0 shadow-sm mb-3"><div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="fw-semibold">{{order.orderNumber}} <span class="badge" [class]="statusClass(order.status)">{{order.status}}</span></span>
        <small class="text-muted">{{order.createdAt | date}}</small>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <span style="color:var(--veloria-primary)" class="fw-bold">&#8377;{{order.total}}</span>
        <a [routerLink]="['/account/orders',order._id]" class="btn btn-sm btn-outline-dark">View Details</a>
      </div>
    </div></div>
  }
  @if(orders.length===0) { <div class="text-center py-5"><i class="bi bi-bag fs-1" style="color:var(--veloria-primary-light)"></i><h5 class="mt-3">No orders yet</h5><a routerLink="/shop" class="btn btn-veloria mt-2">Start Shopping</a></div> }
</div>
`);

// === ACCOUNT ORDER DETAIL ===
write('pages/account/order-detail/order-detail.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../services/order.service';
@Component({ selector: 'app-od', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './order-detail.html' })
export class OrderDetailPage implements OnInit {
  order: any = null;
  constructor(private route: ActivatedRoute, private svc: OrderService) {}
  ngOnInit() { this.svc.getOrderById(this.route.snapshot.params['id']).subscribe(o => this.order = o); }
}
`);

write('pages/account/order-detail/order-detail.html', `
<div class="container py-4">
  @if(order) {
    <div class="d-flex justify-content-between align-items-center mb-4"><h4 class="fw-bold mb-0">Order {{order.orderNumber}}</h4><span class="badge bg-info px-3 py-2">{{order.status}}</span></div>
    <div class="card border-0 shadow-sm mb-4"><div class="table-responsive"><table class="table mb-0">
      <thead class="table-light"><tr><th>Product</th><th>Price</th><th>Qty</th><th class="text-end">Total</th></tr></thead>
      <tbody>@for(item of order.items;track $index){<tr><td>{{item.product?.name}}</td><td>&#8377;{{item.unitPrice}}</td><td>{{item.qty}}</td><td class="text-end fw-semibold">&#8377;{{item.total}}</td></tr>}</tbody>
    </table></div>
    <div class="card-footer bg-white text-end"><strong style="color:var(--veloria-primary)">Total: &#8377;{{order.total}}</strong></div></div>
    @if(order.shippingAddress) { <div class="card border-0 shadow-sm"><div class="card-body small"><h6 class="fw-semibold">Ship To</h6>{{order.shippingAddress.fullName}}, {{order.shippingAddress.street}}, {{order.shippingAddress.city}} {{order.shippingAddress.zip}}</div></div> }
  }
</div>
`);

// === ACCOUNT ADDRESSES ===
write('pages/account/addresses/addresses.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../services/address.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-addr', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './addresses.html' })
export class AddressesPage implements OnInit {
  addresses: any[] = [];
  newAddr: any = {type:'shipping',fullName:'',phone:'',street:'',city:'',state:'',zip:'',country:'India'};
  constructor(private svc: AddressService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getAll().subscribe(r => this.addresses = r); }
  add() { this.svc.create(this.newAddr).subscribe({ next:()=>{this.toast.success('Added');this.load();}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
  del(id:string) { if(confirm('Delete?')) this.svc.delete(id).subscribe(()=>{this.toast.success('Deleted');this.load();}); }
}
`);

write('pages/account/addresses/addresses.html', `
<div class="container py-4">
  <h4 class="fw-bold mb-4">My Addresses</h4>
  <div class="row g-3">
    @for(a of addresses;track a._id) {
      <div class="col-md-6"><div class="card border-0 shadow-sm"><div class="card-body small">
        <strong>{{a.fullName}}</strong> @if(a.isDefault){<span class="badge" style="background:var(--veloria-primary)">Default</span>}<br>
        {{a.street}}<br>{{a.city}}, {{a.state}} {{a.zip}}<br>{{a.country}}
        <div class="mt-2"><button class="btn btn-sm btn-outline-danger" (click)="del(a._id)"><i class="bi bi-trash"></i> Delete</button></div>
      </div></div></div>
    }
  </div>
  <div class="card border-0 shadow-sm mt-4"><div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Add Address</h6></div><div class="card-body">
    <form (ngSubmit)="add()" class="row g-2">
      <div class="col-md-6"><input class="form-control" [(ngModel)]="newAddr.fullName" name="fn" placeholder="Full Name" required></div>
      <div class="col-md-6"><input class="form-control" [(ngModel)]="newAddr.phone" name="ph" placeholder="Phone"></div>
      <div class="col-12"><input class="form-control" [(ngModel)]="newAddr.street" name="st" placeholder="Street" required></div>
      <div class="col-md-4"><input class="form-control" [(ngModel)]="newAddr.city" name="ci" placeholder="City" required></div>
      <div class="col-md-4"><input class="form-control" [(ngModel)]="newAddr.state" name="sa" placeholder="State" required></div>
      <div class="col-md-4"><input class="form-control" [(ngModel)]="newAddr.zip" name="zi" placeholder="PIN" required></div>
      <div class="col-12"><button class="btn btn-veloria btn-sm" type="submit">Save Address</button></div>
    </form>
  </div></div>
</div>
`);

// === STATIC PAGES ===
const staticPages = {
  'pages/shipping/shipping.html': '<div class="container py-5" style="max-width:850px;"><h2 class="fw-bold mb-4" style="font-family:\'Playfair Display\',serif;">Shipping & Delivery</h2><div class="card border-0 shadow-sm"><div class="card-body"><p>Free shipping on orders above Rs.999. Standard delivery 5-7 days. Express 2-3 days.</p><table class="table"><thead><tr><th>Method</th><th>Time</th><th>Cost</th></tr></thead><tbody><tr><td>Standard</td><td>5-7 days</td><td>Rs.99</td></tr><tr><td>Express</td><td>2-3 days</td><td>Rs.199</td></tr><tr><td>Free</td><td>5-7 days</td><td>FREE (Rs.999+)</td></tr></tbody></table></div></div></div>',
  'pages/returns/returns.html': '<div class="container py-5" style="max-width:850px;"><h2 class="fw-bold mb-4" style="font-family:\'Playfair Display\',serif;">Returns & Exchanges</h2><div class="card border-0 shadow-sm"><div class="card-body"><h5>30-Day Return Policy</h5><p>Items must be unused with original tags. Refund processed within 5-7 business days.</p><h6 class="text-success">Eligible</h6><ul><li>Unused items with tags</li><li>Wrong size/color</li><li>Defective products</li></ul><h6 class="text-danger">Not Eligible</h6><ul><li>Used/washed items</li><li>Innerwear</li><li>Opened beauty products</li></ul></div></div></div>',
  'pages/size-guide/size-guide.html': '<div class="container py-5" style="max-width:850px;"><h2 class="fw-bold mb-4" style="font-family:\'Playfair Display\',serif;">Size Guide</h2><div class="card border-0 shadow-sm"><div class="card-body"><table class="table table-bordered text-center"><thead><tr><th>Size</th><th>Bust</th><th>Waist</th><th>Hips</th></tr></thead><tbody><tr><td>S</td><td>33-34</td><td>26-27</td><td>36-37</td></tr><tr><td>M</td><td>35-36</td><td>28-29</td><td>38-39</td></tr><tr><td>L</td><td>37-39</td><td>30-32</td><td>40-42</td></tr><tr><td>XL</td><td>40-42</td><td>33-35</td><td>43-45</td></tr></tbody></table></div></div></div>',
  'pages/faqs/faqs.html': '<div class="container py-5" style="max-width:850px;"><h2 class="fw-bold mb-4" style="font-family:\'Playfair Display\',serif;">FAQs</h2><div class="accordion" id="faq"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" data-bs-toggle="collapse" data-bs-target="#f1">How long does delivery take?</button></h2><div id="f1" class="accordion-collapse collapse show" data-bs-parent="#faq"><div class="accordion-body">5-7 business days for standard, 2-3 days for express.</div></div></div><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#f2">What is the return policy?</button></h2><div id="f2" class="accordion-collapse collapse" data-bs-parent="#faq"><div class="accordion-body">30-day returns on unused items with original tags.</div></div></div><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#f3">Is COD available?</button></h2><div id="f3" class="accordion-collapse collapse" data-bs-parent="#faq"><div class="accordion-body">Yes, for orders up to Rs.10,000.</div></div></div></div></div>',
  'pages/terms/terms.html': '<div class="container py-5" style="max-width:850px;"><h2 class="fw-bold mb-4" style="font-family:\'Playfair Display\',serif;">Terms & Conditions</h2><div class="card border-0 shadow-sm mb-3"><div class="card-body"><h5>1. General</h5><p>By using Veloria, you agree to these terms.</p></div></div><div class="card border-0 shadow-sm mb-3"><div class="card-body"><h5>2. Orders</h5><p>Prices are in INR. Once payment is confirmed, the price is honored.</p></div></div><div class="card border-0 shadow-sm"><div class="card-body"><h5>3. Privacy</h5><p>See our <a routerLink="/privacy-policy">Privacy Policy</a>.</p></div></div></div>',
  'pages/privacy/privacy.html': '<div class="container py-5" style="max-width:850px;"><h2 class="fw-bold mb-4" style="font-family:\'Playfair Display\',serif;">Privacy Policy</h2><div class="card border-0 shadow-sm mb-3"><div class="card-body"><h5>Data We Collect</h5><p>Name, email, phone, address for orders. Card details are processed by Stripe and never stored.</p></div></div><div class="card border-0 shadow-sm"><div class="card-body"><h5>Your Rights</h5><p>Access, update, or delete your data anytime via your account. Contact us for questions.</p></div></div></div>',
};

for (const [file, content] of Object.entries(staticPages)) {
  write(file, content);
}

// === ADMIN PAGES (simplified but functional) ===
const adminPages = [
  { dir: 'pages/admin/categories', name: 'categories', cls: 'AdminCategories', svc: 'CategoryService', svcPath: '../../../services/category.service', method: 'getAll', delMethod: 'delete', fields: ['name','slug','isActive'], label: 'Categories', createLink: '/admin/categories/create', editLink: '/admin/categories' },
  { dir: 'pages/admin/products', name: 'products', cls: 'AdminProducts', svc: 'ProductService', svcPath: '../../../services/product.service', method: 'getProducts', delMethod: 'deleteProduct', label: 'Products', createLink: '/admin/products/create', editLink: '/admin/products' },
  { dir: 'pages/admin/customers', name: 'customers', cls: 'AdminCustomers', svc: 'AdminService', svcPath: '../../../services/admin.service', method: 'getCustomers', label: 'Customers' },
  { dir: 'pages/admin/coupons', name: 'coupons', cls: 'AdminCoupons', svc: 'AdminService', svcPath: '../../../services/admin.service', method: 'getCoupons', delMethod: 'deleteCoupon', label: 'Coupons', createLink: '/admin/coupons/create', editLink: '/admin/coupons' },
  { dir: 'pages/admin/reviews', name: 'reviews', cls: 'AdminReviews', svc: 'ReviewService', svcPath: '../../../services/review.service', method: 'getAll', label: 'Reviews' },
  { dir: 'pages/admin/subscribers', name: 'subscribers', cls: 'AdminSubscribers', svc: 'AdminService', svcPath: '../../../services/admin.service', method: 'getSubscribers', label: 'Subscribers' },
  { dir: 'pages/admin/enquiries', name: 'enquiries', cls: 'AdminEnquiries', svc: 'AdminService', svcPath: '../../../services/admin.service', method: 'getEnquiries', label: 'Enquiries' },
];

for (const pg of adminPages) {
  write(`${pg.dir}/${pg.name}.ts`, `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ${pg.svc} } from '${pg.svcPath}';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-admin-${pg.name}', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './${pg.name}.html' })
export class ${pg.cls} implements OnInit {
  items: any[] = []; loading = true;
  constructor(private svc: ${pg.svc}, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.svc.${pg.method}(${pg.method === 'getProducts' ? '{}' : ''}).subscribe({ next: (r: any) => { this.items = r${pg.method === 'getProducts' || pg.method === 'getCustomers' ? (pg.method === 'getProducts' ? '.products' : '.customers') : ''}; this.loading = false; }, error: () => this.loading = false }); }
  ${pg.delMethod ? `del(id: string) { if(confirm('Delete?')) this.svc.${pg.delMethod}(id).subscribe({ next: () => { this.toast.success('Deleted'); this.load(); } }); }` : ''}
}
  `);

  const hasCreate = pg.createLink ? `<a routerLink="${pg.createLink}" class="btn btn-veloria btn-sm"><i class="bi bi-plus-lg me-1"></i>Add</a>` : '';

  write(`${pg.dir}/${pg.name}.html`, `
<div class="d-flex justify-content-between align-items-center mb-4">
  <h5 class="fw-bold mb-0">${pg.label}</h5>
  ${hasCreate}
</div>
<div class="card border-0 shadow-sm">
  <div class="table-responsive">
    <table class="table table-hover mb-0 align-middle">
      <thead class="table-light"><tr><th>Name</th><th>Details</th><th class="text-end">Actions</th></tr></thead>
      <tbody>
        @if(loading) { <tr><td colspan="3" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading...</td></tr> }
        @for(item of items; track item._id) {
          <tr>
            <td class="fw-semibold">{{item.name || item.code || item.email || item.orderNumber || 'N/A'}}</td>
            <td class="small text-muted">{{item.slug || item.type || item.rating || item.status || item.subject || ''}}</td>
            <td class="text-end">
              ${pg.editLink ? `<a [routerLink]="['${pg.editLink}',item._id,'edit']" class="btn btn-sm btn-outline-dark me-1"><i class="bi bi-pencil"></i></a>` : ''}
              ${pg.delMethod ? `<button class="btn btn-sm btn-outline-danger" (click)="del(item._id)"><i class="bi bi-trash"></i></button>` : ''}
            </td>
          </tr>
        }
        @if(!loading && items.length===0) { <tr><td colspan="3" class="text-center py-4 text-muted">No ${pg.label.toLowerCase()} yet.</td></tr> }
      </tbody>
    </table>
  </div>
</div>
  `);
}

// === ADMIN ORDERS ===
write('pages/admin/orders/orders.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
@Component({ selector: 'app-admin-orders', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './orders.html' })
export class AdminOrders implements OnInit {
  orders: any[] = []; status = '';
  constructor(private svc: OrderService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getAllOrders({status:this.status}).subscribe((r:any) => this.orders = r.orders); }
  sc(s:string) { return {pending:'bg-warning',processing:'bg-info',shipped:'bg-primary',delivered:'bg-success',cancelled:'bg-danger'}[s]||'bg-secondary'; }
}
`);

write('pages/admin/orders/orders.html', `
<div class="d-flex justify-content-between align-items-center mb-4">
  <h5 class="fw-bold mb-0">Orders</h5>
  <select class="form-select form-select-sm" style="width:150px;" [(ngModel)]="status" (change)="load()"><option value="">All</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option></select>
</div>
<div class="card border-0 shadow-sm"><div class="table-responsive"><table class="table table-hover mb-0">
  <thead class="table-light"><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
  <tbody>@for(o of orders;track o._id){<tr>
    <td class="fw-semibold small">{{o.orderNumber}}</td>
    <td class="small">{{o.user?.name}}</td>
    <td class="fw-semibold">&#8377;{{o.total}}</td>
    <td><span class="badge" [class]="sc(o.status)">{{o.status}}</span></td>
    <td class="small text-muted">{{o.createdAt|date}}</td>
    <td><a [routerLink]="['/admin/orders',o._id]" class="btn btn-sm btn-outline-dark"><i class="bi bi-eye"></i></a></td>
  </tr>}
  @if(orders.length===0){<tr><td colspan="6" class="text-center py-4 text-muted">No orders</td></tr>}
  </tbody>
</table></div></div>
`);

// === ADMIN ORDER DETAIL ===
write('pages/admin/order-detail/order-detail.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-aod', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './order-detail.html' })
export class AdminOrderDetail implements OnInit {
  order: any = null; newStatus = ''; tracking = '';
  constructor(private route: ActivatedRoute, private svc: OrderService, private toast: ToastService) {}
  ngOnInit() { this.svc.getOrderById(this.route.snapshot.params['id']).subscribe(o => { this.order = o; this.newStatus = o.status; this.tracking = o.trackingNumber || ''; }); }
  updateStatus() { this.svc.updateStatus(this.order._id, {status:this.newStatus,trackingNumber:this.tracking}).subscribe({ next:(r:any)=>{this.toast.success('Updated');this.order.status=this.newStatus;}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
}
`);

write('pages/admin/order-detail/order-detail.html', `
@if(order) {
<div class="d-flex justify-content-between align-items-center mb-4"><h5 class="fw-bold mb-0">Order {{order.orderNumber}}</h5><span class="badge bg-info px-3 py-2">{{order.status}}</span></div>
<div class="row g-4">
  <div class="col-lg-8">
    <div class="card border-0 shadow-sm"><div class="table-responsive"><table class="table mb-0">
      <thead class="table-light"><tr><th>Product</th><th>Price</th><th>Qty</th><th class="text-end">Total</th></tr></thead>
      <tbody>@for(i of order.items;track $index){<tr><td>{{i.product?.name}}</td><td>&#8377;{{i.unitPrice}}</td><td>{{i.qty}}</td><td class="text-end">&#8377;{{i.total}}</td></tr>}</tbody>
    </table></div>
    <div class="card-footer bg-white text-end"><strong style="color:var(--veloria-primary)">Total: &#8377;{{order.total}}</strong></div></div>
  </div>
  <div class="col-lg-4">
    <div class="card border-0 shadow-sm mb-4"><div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Update Status</h6></div><div class="card-body">
      <select class="form-select mb-2" [(ngModel)]="newStatus"><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select>
      <input class="form-control mb-2" [(ngModel)]="tracking" placeholder="Tracking Number">
      <button class="btn btn-veloria btn-sm w-100" (click)="updateStatus()">Update</button>
    </div></div>
    <div class="card border-0 shadow-sm"><div class="card-body small"><h6 class="fw-semibold">Customer</h6>{{order.user?.name}}<br>{{order.user?.email}}</div></div>
  </div>
</div>
}
`);

// === FORM PAGES (Category, Product, Coupon) ===
write('pages/admin/category-form/category-form.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-cf', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './category-form.html' })
export class CategoryForm implements OnInit {
  isEdit = false; id = ''; parents: any[] = [];
  form: any = { name:'',slug:'',description:'',parent:null,isActive:true,sortOrder:0,image:'' };
  constructor(private route: ActivatedRoute, private router: Router, private svc: CategoryService, private toast: ToastService) {}
  ngOnInit() {
    this.svc.getParents().subscribe(r => this.parents = r);
    this.id = this.route.snapshot.params['id'];
    if (this.id) { this.isEdit = true; this.svc.getAll().subscribe(cats => { const c = cats.find((x:any)=>x._id===this.id); if(c) this.form = {...c, parent: c.parent?._id||null}; }); }
  }
  slugify() { this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); }
  save() {
    const obs = this.isEdit ? this.svc.update(this.id, this.form) : this.svc.create(this.form);
    obs.subscribe({ next:()=>{this.toast.success(this.isEdit?'Updated':'Created');this.router.navigate(['/admin/categories']);}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') });
  }
}
`);

write('pages/admin/category-form/category-form.html', `
<h5 class="fw-bold mb-4">{{isEdit?'Edit':'Add'}} Category</h5>
<div class="card border-0 shadow-sm" style="max-width:700px;"><div class="card-body p-4">
  <form (ngSubmit)="save()">
    <div class="mb-3"><label class="form-label fw-semibold small">Name</label><input class="form-control" [(ngModel)]="form.name" name="name" (input)="slugify()" required></div>
    <div class="mb-3"><label class="form-label fw-semibold small">Slug</label><input class="form-control" [(ngModel)]="form.slug" name="slug" required></div>
    <div class="mb-3"><label class="form-label fw-semibold small">Parent</label><select class="form-select" [(ngModel)]="form.parent" name="parent"><option [ngValue]="null">None</option>@for(p of parents;track p._id){<option [ngValue]="p._id">{{p.name}}</option>}</select></div>
    <div class="mb-3"><label class="form-label fw-semibold small">Image URL</label><input class="form-control" [(ngModel)]="form.image" name="img"></div>
    <div class="row"><div class="col-6 mb-3"><label class="form-label fw-semibold small">Sort Order</label><input type="number" class="form-control" [(ngModel)]="form.sortOrder" name="so"></div>
    <div class="col-6 mb-3 d-flex align-items-end"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" [(ngModel)]="form.isActive" name="active"><label class="form-check-label">Active</label></div></div></div>
    <div class="d-flex gap-2"><button class="btn btn-veloria" type="submit">{{isEdit?'Update':'Create'}}</button><a routerLink="/admin/categories" class="btn btn-outline-secondary">Cancel</a></div>
  </form>
</div></div>
`);

write('pages/admin/product-form/product-form.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-pf', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './product-form.html' })
export class ProductForm implements OnInit {
  isEdit = false; id = ''; categories: any[] = []; newImage = '';
  form: any = { name:'',slug:'',description:'',category:'',price:0,comparePrice:null,stock:0,sku:'',status:'draft',featured:false,images:[],variants:[] };
  constructor(private route: ActivatedRoute, private router: Router, private svc: ProductService, private catSvc: CategoryService, private toast: ToastService) {}
  ngOnInit() {
    this.catSvc.getAll().subscribe(r => this.categories = r);
    this.id = this.route.snapshot.params['id'];
    if (this.id) { this.isEdit = true; this.svc.getProductById(this.id).subscribe(p => { this.form = {...p, category: p.category?._id || p.category}; }); }
  }
  slugify() { this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Math.random().toString(36).substring(2,6); }
  addImage() { if(this.newImage) { this.form.images.push(this.newImage); this.newImage=''; } }
  removeImage(i:number) { this.form.images.splice(i,1); }
  addVariant() { this.form.variants.push({sku:'',size:'',color:'',priceModifier:0,stock:0}); }
  removeVariant(i:number) { this.form.variants.splice(i,1); }
  save() {
    const obs = this.isEdit ? this.svc.updateProduct(this.id, this.form) : this.svc.createProduct(this.form);
    obs.subscribe({ next:()=>{this.toast.success(this.isEdit?'Updated':'Created');this.router.navigate(['/admin/products']);}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') });
  }
}
`);

write('pages/admin/product-form/product-form.html', `
<h5 class="fw-bold mb-4">{{isEdit?'Edit':'Add'}} Product</h5>
<form (ngSubmit)="save()"><div class="row">
  <div class="col-lg-8">
    <div class="card border-0 shadow-sm mb-4"><div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Basic Info</h6></div><div class="card-body">
      <div class="mb-3"><label class="form-label small fw-semibold">Name</label><input class="form-control" [(ngModel)]="form.name" name="name" (input)="slugify()" required></div>
      <div class="mb-3"><label class="form-label small fw-semibold">Description</label><textarea class="form-control" [(ngModel)]="form.description" name="desc" rows="4"></textarea></div>
      <div class="row"><div class="col-6"><label class="form-label small fw-semibold">Category</label><select class="form-select" [(ngModel)]="form.category" name="cat" required>@for(c of categories;track c._id){<option [ngValue]="c._id">{{c.name}}</option>}</select></div>
      <div class="col-6"><label class="form-label small fw-semibold">SKU</label><input class="form-control" [(ngModel)]="form.sku" name="sku"></div></div>
    </div></div>
    <div class="card border-0 shadow-sm mb-4"><div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Images</h6></div><div class="card-body">
      <div class="d-flex gap-2 flex-wrap mb-2">@for(img of form.images;track $index){<div class="position-relative"><img [src]="img" style="width:60px;height:60px;object-fit:cover;" class="rounded"><button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" style="padding:0 4px;font-size:0.6rem;" (click)="removeImage($index)">x</button></div>}</div>
      <div class="input-group"><input class="form-control" [(ngModel)]="newImage" name="ni" placeholder="Image URL"><button class="btn btn-outline-dark" type="button" (click)="addImage()">Add</button></div>
    </div></div>
    <div class="card border-0 shadow-sm mb-4"><div class="card-header bg-white d-flex justify-content-between"><h6 class="mb-0 fw-semibold">Variants</h6><button type="button" class="btn btn-sm btn-outline-dark" (click)="addVariant()"><i class="bi bi-plus"></i></button></div><div class="card-body">
      @for(v of form.variants;track $index){<div class="row g-2 mb-2 align-items-end">
        <div class="col"><input class="form-control form-control-sm" [(ngModel)]="v.sku" [name]="'vs'+$index" placeholder="SKU"></div>
        <div class="col"><input class="form-control form-control-sm" [(ngModel)]="v.size" [name]="'vsi'+$index" placeholder="Size"></div>
        <div class="col"><input class="form-control form-control-sm" [(ngModel)]="v.color" [name]="'vc'+$index" placeholder="Color"></div>
        <div class="col"><input type="number" class="form-control form-control-sm" [(ngModel)]="v.stock" [name]="'vst'+$index" placeholder="Stock"></div>
        <div class="col-auto"><button type="button" class="btn btn-sm btn-outline-danger" (click)="removeVariant($index)"><i class="bi bi-trash"></i></button></div>
      </div>}
    </div></div>
  </div>
  <div class="col-lg-4">
    <div class="card border-0 shadow-sm mb-4"><div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Pricing</h6></div><div class="card-body">
      <div class="mb-3"><label class="form-label small">Price</label><input type="number" class="form-control" [(ngModel)]="form.price" name="price" required></div>
      <div class="mb-3"><label class="form-label small">Compare Price</label><input type="number" class="form-control" [(ngModel)]="form.comparePrice" name="cp"></div>
      <div class="mb-3"><label class="form-label small">Stock</label><input type="number" class="form-control" [(ngModel)]="form.stock" name="stock" required></div>
    </div></div>
    <div class="card border-0 shadow-sm mb-4"><div class="card-header bg-white"><h6 class="mb-0 fw-semibold">Status</h6></div><div class="card-body">
      <select class="form-select mb-3" [(ngModel)]="form.status" name="status"><option value="draft">Draft</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      <div class="form-check form-switch"><input class="form-check-input" type="checkbox" [(ngModel)]="form.featured" name="feat"><label class="form-check-label">Featured</label></div>
    </div></div>
    <div class="d-grid gap-2"><button class="btn btn-veloria" type="submit">{{isEdit?'Update':'Create'}} Product</button><a routerLink="/admin/products" class="btn btn-outline-secondary">Cancel</a></div>
  </div>
</div></form>
`);

write('pages/admin/coupon-form/coupon-form.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-cpf', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './coupon-form.html' })
export class CouponForm implements OnInit {
  isEdit = false; id = '';
  form: any = { code:'',type:'percent',value:0,minOrder:null,usesLeft:null,expiresAt:'',isActive:true };
  constructor(private route: ActivatedRoute, private router: Router, private svc: AdminService, private toast: ToastService) {}
  ngOnInit() { this.id = this.route.snapshot.params['id']; if(this.id) { this.isEdit = true; this.svc.getCoupons().subscribe(r => { const c = r.find((x:any)=>x._id===this.id); if(c) this.form = {...c}; }); } }
  save() {
    const obs = this.isEdit ? this.svc.updateCoupon(this.id, this.form) : this.svc.createCoupon(this.form);
    obs.subscribe({ next:()=>{this.toast.success(this.isEdit?'Updated':'Created');this.router.navigate(['/admin/coupons']);}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') });
  }
}
`);

write('pages/admin/coupon-form/coupon-form.html', `
<h5 class="fw-bold mb-4">{{isEdit?'Edit':'Add'}} Coupon</h5>
<div class="card border-0 shadow-sm" style="max-width:600px;"><div class="card-body p-4">
  <form (ngSubmit)="save()">
    <div class="row"><div class="col-6 mb-3"><label class="form-label small fw-semibold">Code</label><input class="form-control" [(ngModel)]="form.code" name="code" style="text-transform:uppercase" required></div>
    <div class="col-6 mb-3"><label class="form-label small fw-semibold">Type</label><select class="form-select" [(ngModel)]="form.type" name="type"><option value="percent">Percentage</option><option value="flat">Flat</option></select></div></div>
    <div class="row"><div class="col-6 mb-3"><label class="form-label small fw-semibold">Value</label><input type="number" class="form-control" [(ngModel)]="form.value" name="val" required></div>
    <div class="col-6 mb-3"><label class="form-label small fw-semibold">Min Order</label><input type="number" class="form-control" [(ngModel)]="form.minOrder" name="mo"></div></div>
    <div class="row"><div class="col-6 mb-3"><label class="form-label small fw-semibold">Uses Left</label><input type="number" class="form-control" [(ngModel)]="form.usesLeft" name="ul"></div>
    <div class="col-6 mb-3"><label class="form-label small fw-semibold">Expires</label><input type="datetime-local" class="form-control" [(ngModel)]="form.expiresAt" name="exp"></div></div>
    <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" [(ngModel)]="form.isActive" name="active"><label class="form-check-label">Active</label></div>
    <div class="d-flex gap-2"><button class="btn btn-veloria" type="submit">{{isEdit?'Update':'Create'}}</button><a routerLink="/admin/coupons" class="btn btn-outline-secondary">Cancel</a></div>
  </form>
</div></div>
`);

// === ADMIN ENQUIRY DETAIL ===
write('pages/admin/enquiry-detail/enquiry-detail.ts', `
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-ed', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './enquiry-detail.html' })
export class EnquiryDetail implements OnInit {
  enquiry: any = null; newStatus = '';
  constructor(private route: ActivatedRoute, private svc: AdminService, private toast: ToastService) {}
  ngOnInit() { this.svc.getEnquiry(this.route.snapshot.params['id']).subscribe(e => { this.enquiry = e; this.newStatus = e.status; }); }
  update() { this.svc.updateEnquiryStatus(this.enquiry._id, this.newStatus).subscribe({ next:()=>{this.toast.success('Updated');this.enquiry.status=this.newStatus;} }); }
}
`);

write('pages/admin/enquiry-detail/enquiry-detail.html', `
@if(enquiry) {
<h5 class="fw-bold mb-4">Enquiry: {{enquiry.subject}}</h5>
<div class="row g-4">
  <div class="col-lg-8"><div class="card border-0 shadow-sm"><div class="card-body">
    <div class="p-3 rounded mb-3" style="background:var(--veloria-pink-soft);white-space:pre-wrap;">{{enquiry.message}}</div>
    <small class="text-muted">From: {{enquiry.name}} ({{enquiry.email}}) | {{enquiry.createdAt | date}}</small>
  </div></div></div>
  <div class="col-lg-4"><div class="card border-0 shadow-sm"><div class="card-body">
    <h6 class="fw-semibold mb-3">Update Status</h6>
    <select class="form-select mb-2" [(ngModel)]="newStatus"><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option></select>
    <button class="btn btn-veloria btn-sm w-100" (click)="update()">Update</button>
  </div></div></div>
</div>
}
`);

// === ADMIN SETTINGS ===
write('pages/admin/settings/settings.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({ selector: 'app-settings', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './settings.html' })
export class AdminSettings {}
`);

write('pages/admin/settings/settings.html', `
<h5 class="fw-bold mb-4">Settings</h5>
<div class="card border-0 shadow-sm"><div class="card-body">
  <h6 class="fw-semibold mb-3">System Info</h6>
  <div class="d-flex justify-content-between small mb-2"><span class="text-muted">Platform</span><span class="fw-semibold">MEAN Stack (Angular + Node.js + MongoDB)</span></div>
  <div class="d-flex justify-content-between small mb-2"><span class="text-muted">Frontend</span><span class="fw-semibold">Angular 20</span></div>
  <div class="d-flex justify-content-between small mb-2"><span class="text-muted">Backend</span><span class="fw-semibold">Node.js + Express</span></div>
  <div class="d-flex justify-content-between small mb-2"><span class="text-muted">Database</span><span class="fw-semibold">MongoDB</span></div>
  <div class="d-flex justify-content-between small"><span class="text-muted">Payment</span><span class="fw-semibold">Stripe + COD</span></div>
</div></div>
`);

console.log('\nAll pages generated successfully!');
