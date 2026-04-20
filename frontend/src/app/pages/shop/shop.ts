import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shop.html',
})
export class ShopPage implements OnInit, OnDestroy {
  products: any[] = [];
  categories: any[] = [];
  loading = true;
  totalProducts = 0;
  totalPages = 0;

  // Filters (bound to template)
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'newest';
  currentPage = 1;
  limit = 12;
  searchQuery = '';

  private routeSub!: Subscription;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    public auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.categoryService.getParents().subscribe({
      next: (cats) => { this.categories = cats || []; },
    });
    if (this.auth.isLoggedIn()) {
      this.wishlistService.loadIds().subscribe();
    }
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.selectedCategory = params['category'] || '';
      this.sortBy = params['sort'] || 'newest';
      this.currentPage = +params['page'] || 1;
      this.searchQuery = params['q'] || '';
      if (params['minPrice']) this.minPrice = +params['minPrice'];
      if (params['maxPrice']) this.maxPrice = +params['maxPrice'];
      this.loadProducts();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  loadProducts() {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.limit,
      sort: this.sortBy,
    };
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.minPrice !== null) params.minPrice = this.minPrice;
    if (this.maxPrice !== null) params.maxPrice = this.maxPrice;
    if (this.searchQuery) params.q = this.searchQuery;

    this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products = res.products || res || [];
        this.totalProducts = res.total || this.products.length;
        this.totalPages = res.totalPages || Math.ceil(this.totalProducts / this.limit);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  applyFilters() {
    const queryParams: any = { page: 1 };
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    if (this.sortBy) queryParams.sort = this.sortBy;
    if (this.minPrice !== null) queryParams.minPrice = this.minPrice;
    if (this.maxPrice !== null) queryParams.maxPrice = this.maxPrice;
    if (this.searchQuery) queryParams.q = this.searchQuery;
    this.router.navigate(['/shop'], { queryParams });
  }

  clearFilters() {
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'newest';
    this.searchQuery = '';
    this.router.navigate(['/shop']);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    const queryParams = { ...this.route.snapshot.queryParams, page };
    this.router.navigate(['/shop'], { queryParams });
  }

  get pages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
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

  getDiscount(product: any): number {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  }
}
