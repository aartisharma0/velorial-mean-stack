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
