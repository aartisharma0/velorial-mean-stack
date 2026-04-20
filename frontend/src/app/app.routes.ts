import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomePage) },
      { path: 'shop', loadComponent: () => import('./pages/shop/shop').then(m => m.ShopPage) },
      { path: 'product/:slug', loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailPage) },
      { path: 'cart', loadComponent: () => import('./pages/cart/cart').then(m => m.CartPage) },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.ContactPage) },
      { path: 'wishlist', canActivate: [authGuard], loadComponent: () => import('./pages/wishlist/wishlist').then(m => m.WishlistPage) },
      { path: 'shipping-delivery', loadComponent: () => import('./pages/shipping/shipping').then(m => m.ShippingPage) },
      { path: 'returns-exchanges', loadComponent: () => import('./pages/returns/returns').then(m => m.ReturnsPage) },
      { path: 'size-guide', loadComponent: () => import('./pages/size-guide/size-guide').then(m => m.SizeGuidePage) },
      { path: 'faqs', loadComponent: () => import('./pages/faqs/faqs').then(m => m.FaqsPage) },
      { path: 'terms', loadComponent: () => import('./pages/terms/terms').then(m => m.TermsPage) },
      { path: 'privacy-policy', loadComponent: () => import('./pages/privacy/privacy').then(m => m.PrivacyPage) },
      { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutPage) },
      { path: 'checkout/success/:id', canActivate: [authGuard], loadComponent: () => import('./pages/checkout-success/checkout-success').then(m => m.CheckoutSuccessPage) },
      { path: 'account/profile', canActivate: [authGuard], loadComponent: () => import('./pages/account/profile/profile').then(m => m.ProfilePage) },
      { path: 'account/orders', canActivate: [authGuard], loadComponent: () => import('./pages/account/orders/orders').then(m => m.OrdersPage) },
      { path: 'account/orders/:id', canActivate: [authGuard], loadComponent: () => import('./pages/account/order-detail/order-detail').then(m => m.OrderDetailPage) },
      { path: 'account/addresses', canActivate: [authGuard], loadComponent: () => import('./pages/account/addresses/addresses').then(m => m.AddressesPage) },
    ]
  },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login').then(m => m.LoginPage) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register/register').then(m => m.RegisterPage) },
  { path: 'forgot-password', canActivate: [guestGuard], loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPasswordPage) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.AdminDashboard) },
      { path: 'categories', loadComponent: () => import('./pages/admin/categories/categories').then(m => m.AdminCategories) },
      { path: 'categories/create', loadComponent: () => import('./pages/admin/category-form/category-form').then(m => m.CategoryForm) },
      { path: 'categories/:id/edit', loadComponent: () => import('./pages/admin/category-form/category-form').then(m => m.CategoryForm) },
      { path: 'products', loadComponent: () => import('./pages/admin/products/products').then(m => m.AdminProducts) },
      { path: 'products/create', loadComponent: () => import('./pages/admin/product-form/product-form').then(m => m.ProductForm) },
      { path: 'products/:id/edit', loadComponent: () => import('./pages/admin/product-form/product-form').then(m => m.ProductForm) },
      { path: 'orders', loadComponent: () => import('./pages/admin/orders/orders').then(m => m.AdminOrders) },
      { path: 'orders/:id', loadComponent: () => import('./pages/admin/order-detail/order-detail').then(m => m.AdminOrderDetail) },
      { path: 'customers', loadComponent: () => import('./pages/admin/customers/customers').then(m => m.AdminCustomers) },
      { path: 'coupons', loadComponent: () => import('./pages/admin/coupons/coupons').then(m => m.AdminCoupons) },
      { path: 'coupons/create', loadComponent: () => import('./pages/admin/coupon-form/coupon-form').then(m => m.CouponForm) },
      { path: 'coupons/:id/edit', loadComponent: () => import('./pages/admin/coupon-form/coupon-form').then(m => m.CouponForm) },
      { path: 'reviews', loadComponent: () => import('./pages/admin/reviews/reviews').then(m => m.AdminReviews) },
      { path: 'subscribers', loadComponent: () => import('./pages/admin/subscribers/subscribers').then(m => m.AdminSubscribers) },
      { path: 'enquiries', loadComponent: () => import('./pages/admin/enquiries/enquiries').then(m => m.AdminEnquiries) },
      { path: 'enquiries/:id', loadComponent: () => import('./pages/admin/enquiry-detail/enquiry-detail').then(m => m.EnquiryDetail) },
      { path: 'settings', loadComponent: () => import('./pages/admin/settings/settings').then(m => m.AdminSettings) },
    ]
  },
  { path: '**', redirectTo: '' },
];
