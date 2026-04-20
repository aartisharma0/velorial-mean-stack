import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './main-layout.html',
})
export class MainLayout implements OnInit, AfterViewInit {
  searchQuery = '';
  searchResults: any[] = [];
  showSearchResults = false;
  newsletterEmail = '';
  isDarkMode = false;
  showBackToTop = false;

  constructor(
    public auth: AuthService,
    public cart: CartService,
    public wishlist: WishlistService,
    private admin: AdminService,
    private toast: ToastService,
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) this.wishlist.loadIds().subscribe();
    this.isDarkMode = localStorage.getItem('veloria_theme') === 'dark';
    if (this.isDarkMode) document.documentElement.setAttribute('data-theme', 'dark');
  }

  ngAfterViewInit() {
    // Welcome discount popup for first-time visitors
    if (!localStorage.getItem('veloria_visited')) {
      setTimeout(() => this.showWelcomePopup(), 5000);
    }

    // Scroll reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      document.querySelectorAll('.product-card, .category-card, .card').forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
      });
    }, 500);

    // 3D tilt on product cards
    document.addEventListener('mousemove', (e) => {
      const card = (e.target as HTMLElement).closest('.product-card');
      if (!card) return;
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / rect.height) * -6;
      const rotateY = ((x - rect.width / 2) / rect.width) * 6;
      (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    document.addEventListener('mouseleave', (e) => {
      const card = (e.target as HTMLElement).closest('.product-card');
      if (card) (card as HTMLElement).style.transform = '';
    }, true);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.showBackToTop = window.scrollY > 400;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch() {
    if (this.searchQuery.length < 2) { this.searchResults = []; this.showSearchResults = false; return; }
    this.productService.searchAutocomplete(this.searchQuery).subscribe(res => {
      this.searchResults = res;
      this.showSearchResults = true;
    });
  }

  goToSearch() { this.showSearchResults = false; this.router.navigate(['/shop'], { queryParams: { q: this.searchQuery } }); }

  subscribe() {
    if (!this.newsletterEmail) return;
    this.admin.subscribe(this.newsletterEmail).subscribe({
      next: (res: any) => { this.toast.success(res.message); this.newsletterEmail = ''; },
      error: (err: any) => this.toast.error(err.error?.message || 'Failed'),
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('veloria_theme', 'dark'); }
    else { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('veloria_theme', 'light'); }
  }

  logout() { this.auth.logout(); }

  private showWelcomePopup() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9998;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s;';
    overlay.innerHTML = `
      <div style="background:white;border-radius:16px;padding:40px;max-width:400px;width:90%;text-align:center;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <button onclick="this.closest('div').parentElement.remove();localStorage.setItem('veloria_visited','true');" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:1.2rem;cursor:pointer;">&times;</button>
        <div style="width:60px;height:60px;border-radius:50%;background:#fdf2f8;display:flex;align-items:center;justify-content:center;margin:0 auto 15px;">
          <i class="bi bi-gift" style="font-size:1.8rem;color:#d63384;"></i>
        </div>
        <h4 style="font-family:'Playfair Display',serif;font-weight:700;">Welcome to Veloria!</h4>
        <p style="color:#666;">Get <strong style="color:#d63384;font-size:1.5rem;">20% OFF</strong> your first order</p>
        <div style="background:#f8f8f8;border-radius:8px;padding:12px;margin:15px 0;">
          <code style="font-size:1.2rem;font-weight:700;color:#d63384;letter-spacing:3px;">WELCOME20</code>
        </div>
        <a href="/shop" onclick="localStorage.setItem('veloria_visited','true');this.closest('div').parentElement.remove();" style="display:inline-block;padding:10px 30px;background:#d63384;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Shop Now</a>
        <p style="font-size:0.75rem;color:#aaa;margin-top:10px;">Min. order Rs.500</p>
      </div>
    `;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); localStorage.setItem('veloria_visited', 'true'); } });
    document.body.appendChild(overlay);
  }
}
