import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
})
export class HomePage implements OnInit {
  featuredProducts: any[] = [];
  categories: any[] = [];
  loading = true;
  categoriesLoading = true;
  newsletterEmail = '';
  newsletterSubmitting = false;
  newsletterDone = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    public auth: AuthService,
    private adminService: AdminService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadCategories();
    if (this.auth.isLoggedIn()) {
      this.wishlistService.loadIds().subscribe();
    }
  }

  loadFeaturedProducts() {
    this.loading = true;
    this.productService.getProducts({ featured: 'true', limit: 8 }).subscribe({
      next: (res) => {
        this.featuredProducts = res.products || res || [];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  loadCategories() {
    this.categoriesLoading = true;
    this.categoryService.getParents().subscribe({
      next: (cats) => {
        this.categories = cats || [];
        this.categoriesLoading = false;
      },
      error: () => { this.categoriesLoading = false; },
    });
  }

  addToCart(product: any) {
    this.cartService.addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.primaryImage || (product.images && product.images[0]) || '',
      qty: 1,
    });
    this.toast.success(`${product.name} added to cart!`);
  }

  toggleWishlist(product: any) {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please login to save to wishlist');
      return;
    }
    this.wishlistService.toggle(product._id).subscribe({
      next: (res) => {
        this.toast.success(res.added ? 'Added to wishlist' : 'Removed from wishlist');
      },
      error: () => this.toast.error('Could not update wishlist'),
    });
  }

  isWishlisted(productId: string) {
    return this.wishlistService.isWishlisted(productId);
  }

  subscribeNewsletter() {
    if (!this.newsletterEmail.trim()) return;
    this.newsletterSubmitting = true;
    this.adminService.subscribe(this.newsletterEmail.trim()).subscribe({
      next: () => {
        this.newsletterDone = true;
        this.newsletterSubmitting = false;
        this.newsletterEmail = '';
        this.toast.success('Subscribed successfully!');
      },
      error: (err) => {
        this.newsletterSubmitting = false;
        this.toast.error(err?.error?.message || 'Subscription failed');
      },
    });
  }

  getDiscount(product: any): number {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  }
}
