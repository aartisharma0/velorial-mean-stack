import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.html',
})
export class ProductDetailPage implements OnInit {
  product: any = null;
  relatedProducts: any[] = [];
  reviews: any[] = [];
  loading = true;
  relatedLoading = false;

  selectedImage = '';
  selectedVariantId = '';
  selectedVariantLabel = '';
  quantity = 1;

  // Review form
  showReviewForm = false;
  reviewForm = { rating: 5, title: '', comment: '' };
  reviewSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    public auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) this.loadProduct(slug);
    });
    if (this.auth.isLoggedIn()) {
      this.wishlistService.loadIds().subscribe();
    }
  }

  loadProduct(slug: string) {
    this.loading = true;
    this.product = null;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.product = res.product || res;
        this.selectedImage = this.product.primaryImage || (this.product.images && this.product.images[0]) || '';
        this.loading = false;
        this.loadReviews();
        this.loadRelated();
      },
      error: () => { this.loading = false; },
    });
  }

  loadReviews() {
    if (!this.product?._id) return;
    this.reviewService.getProductReviews(this.product._id).subscribe({
      next: (res) => { this.reviews = res || []; },
      error: () => {},
    });
  }

  loadRelated() {
    if (!this.product?._id) return;
    this.relatedLoading = true;
    this.productService.getRelatedProducts(this.product._id).subscribe({
      next: (res) => {
        this.relatedProducts = res || [];
        this.relatedLoading = false;
      },
      error: () => { this.relatedLoading = false; },
    });
  }

  selectImage(img: string) {
    this.selectedImage = img;
  }

  selectVariant(variant: any) {
    this.selectedVariantId = variant._id;
    this.selectedVariantLabel = variant.label || variant.name || '';
  }

  incrementQty() {
    if (this.quantity < (this.product?.stock || 10)) this.quantity++;
  }

  decrementQty() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    if (!this.product) return;
    if (this.product.variants?.length > 0 && !this.selectedVariantId) {
      this.toast.error('Please select a variant');
      return;
    }
    this.cartService.addItem({
      productId: this.product._id,
      variantId: this.selectedVariantId || undefined,
      variantLabel: this.selectedVariantLabel || undefined,
      name: this.product.name,
      price: this.product.price,
      image: this.selectedImage,
      qty: this.quantity,
    });
    this.toast.success(`${this.product.name} added to cart!`);
  }

  toggleWishlist() {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please login to save to wishlist');
      return;
    }
    this.wishlistService.toggle(this.product._id).subscribe({
      next: (res) => {
        this.toast.success(res.added ? 'Added to wishlist' : 'Removed from wishlist');
      },
      error: () => this.toast.error('Could not update wishlist'),
    });
  }

  get isWishlisted(): boolean {
    return this.product ? this.wishlistService.isWishlisted(this.product._id) : false;
  }

  submitReview() {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please login to write a review');
      return;
    }
    this.reviewSubmitting = true;
    this.reviewService.createReview({
      productId: this.product._id,
      ...this.reviewForm,
    }).subscribe({
      next: () => {
        this.toast.success('Review submitted successfully!');
        this.reviewForm = { rating: 5, title: '', comment: '' };
        this.showReviewForm = false;
        this.reviewSubmitting = false;
        this.loadReviews();
      },
      error: (err) => {
        this.reviewSubmitting = false;
        this.toast.error(err?.error?.message || 'Could not submit review');
      },
    });
  }

  getDiscount(): number {
    if (this.product?.comparePrice && this.product.comparePrice > this.product.price) {
      return Math.round(((this.product.comparePrice - this.product.price) / this.product.comparePrice) * 100);
    }
    return 0;
  }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    return Math.round((this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length) * 10) / 10;
  }

  get ratingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
