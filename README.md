<h1 align="center">VELORIA — MEAN Stack</h1>
<h3 align="center"><em>"Where every piece tells your story"</em></h3>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white">
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/MongoDB-9-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
  <img src="https://img.shields.io/badge/Stripe-Payment-635BFF?style=for-the-badge&logo=stripe&logoColor=white">
</p>

<p align="center">
A full-stack fashion & lifestyle e-commerce platform built with the MEAN stack.<br>
Same features as the Laravel version — Admin Panel, Cart, Wishlist, Stripe Checkout, Order Management, Dark Mode, and more.
</p>

---

## What is Veloria?

Veloria is a complete e-commerce web application built with **Angular + Node.js + Express + MongoDB**. It includes:

- **Admin Panel** — Dashboard, product/category/coupon CRUD, order management, customer management, review moderation, subscriber & enquiry management
- **Customer Side** — Browse products, search, filter, add to cart/wishlist, apply coupons, checkout with Stripe or COD, track orders, write reviews
- **Security** — JWT authentication, bcrypt password hashing, role-based access (admin/user), rate limiting, input validation
- **Responsive** — Works on mobile, tablet, and desktop with Bootstrap 5
- **Dark Mode** — Toggle between light and dark themes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 20 (Standalone Components, Signals) |
| Backend | Node.js 22 + Express 5 |
| Database | MongoDB 9 (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Payment | Stripe + Cash on Delivery |
| Styling | Bootstrap 5 + SCSS + Bootstrap Icons |

---

## How to Run

### Prerequisites

- Node.js 18+ | MongoDB (running locally) | Git

### Step 1: Clone

```bash
git clone https://github.com/aartisharma0/veloria-mean.git
cd veloria-mean
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (or edit the existing one):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/veloria
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_your_key
CLIENT_URL=http://localhost:4200
```

Seed the database:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend runs on **http://localhost:5000**

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
ng serve
```

Frontend runs on **http://localhost:4200**

---

## Quick Start (Copy-Paste)

```bash
git clone https://github.com/aartisharma0/veloria-mean.git
cd veloria-mean

# Backend
cd backend && npm install && npm run seed && npm run dev &

# Frontend (new terminal)
cd frontend && npm install && ng serve
```

Open **http://localhost:4200**

---

## Login Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@veloria.com | Admin@123 |
| User | user@veloria.com | User@123 |

## Test Coupons

| Code | Discount |
|------|----------|
| WELCOME20 | 20% off (min Rs.500) |
| VELORIA10 | 10% off (min Rs.999) |
| FLAT200 | Rs.200 off (min Rs.1499) |

## Stripe Test Card

`4242 4242 4242 4242` | Expiry: any future date | CVC: any 3 digits

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filters, sort, pagination) |
| GET | `/api/products/slug/:slug` | Product by slug |
| GET | `/api/products/search?q=` | Search autocomplete |
| GET | `/api/categories` | All categories |
| GET | `/api/categories/parents` | Parent categories |
| GET | `/api/reviews/product/:id` | Product reviews |
| POST | `/api/coupons/validate` | Validate coupon code |
| POST | `/api/admin/subscribe` | Newsletter subscribe |
| POST | `/api/admin/enquiries` | Submit enquiry |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/profile` | Get profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Protected (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my` | My orders |
| GET | `/api/orders/:id` | Order details |
| GET/POST | `/api/wishlist` | Wishlist |
| POST | `/api/reviews` | Submit review |
| CRUD | `/api/addresses` | Address management |

### Admin (JWT + Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| CRUD | `/api/products` | Product management |
| CRUD | `/api/categories` | Category management |
| CRUD | `/api/coupons` | Coupon management |
| GET/PATCH | `/api/orders/all` | Order management |
| GET/PATCH | `/api/admin/customers` | Customer management |
| GET/PATCH/DELETE | `/api/reviews/all` | Review moderation |
| GET/DELETE | `/api/admin/subscribers` | Subscriber list |
| CRUD | `/api/admin/enquiries` | Enquiry management |

---

## Project Structure

```
veloria-mean/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # 9 controllers (auth, product, category, order,
│   │   │                   #   review, wishlist, coupon, address, admin)
│   │   ├── middleware/      # JWT auth, admin guard, file upload
│   │   ├── models/          # 10 Mongoose models
│   │   ├── routes/          # 9 route files (50+ endpoints)
│   │   ├── seeders/         # Database seeder
│   │   └── server.js        # Express server entry
│   ├── .env                 # Environment config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/       # 10 Angular services
│   │   │   ├── guards/         # Auth, Admin, Guest guards
│   │   │   ├── interceptors/   # JWT interceptor
│   │   │   ├── layouts/        # Main (navbar+footer), Admin (sidebar)
│   │   │   └── pages/          # 36 page components
│   │   │       ├── home/           # Homepage with hero, featured, 3D cube
│   │   │       ├── shop/           # Product listing with filters
│   │   │       ├── product-detail/ # Product page with variants, reviews
│   │   │       ├── cart/           # Shopping cart with +/- qty
│   │   │       ├── checkout/       # Checkout with Stripe/COD
│   │   │       ├── account/        # Profile, orders, addresses
│   │   │       ├── admin/          # Full admin panel (15 pages)
│   │   │       └── ...             # Static pages (contact, faqs, etc.)
│   │   ├── environments/   # API URL config
│   │   └── styles.scss      # Global styles (Bootstrap + Veloria theme)
│   └── package.json
│
└── README.md
```

---

## Database (MongoDB Collections)

| Collection | Description |
|------------|-------------|
| users | Name, email, password (bcrypt), role, isActive |
| categories | Name, slug, parent (self-ref), image, sortOrder |
| products | Name, slug, price, stock, images, variants, featured, status |
| orders | Items, totals, status, payment, shipping address |
| addresses | User addresses (billing/shipping) |
| reviews | Rating (1-5), body, approved flag |
| coupons | Code, type, value, min order, uses left, expiry |
| wishlists | User-product favorites |
| subscribers | Newsletter emails |
| enquiries | Contact form submissions |

---

## Seeded Test Data

| Data | Count |
|------|-------|
| Users | 2 (admin + customer) |
| Parent Categories | 6 (Women, Men, Kids, Footwear, Accessories, Beauty) |
| Sub-categories | 27 |
| Products | 16 (all active, with variants) |
| Coupons | 3 (VELORIA10, FLAT200, WELCOME20) |

---

## Features Matching Laravel Version

| Feature | Status |
|---------|--------|
| Admin Dashboard with stats | Done |
| Categories CRUD | Done |
| Products CRUD with variants | Done |
| Orders management + status update | Done |
| Customers list + block/activate | Done |
| Coupons CRUD + validation | Done |
| Reviews with verified purchase check | Done |
| Subscribers + Enquiries | Done |
| Product listing with filters, sort, search | Done |
| Product detail with variants, reviews | Done |
| Session-based cart (localStorage) | Done |
| Wishlist (heart toggle) | Done |
| Checkout with Stripe + COD | Done |
| User account (profile, orders, addresses) | Done |
| Live search autocomplete | Done |
| Dark mode toggle | Done |
| Responsive design | Done |
| JWT authentication | Done |
| Role-based access control | Done |
| Toast notifications | Done |
| Static pages (shipping, returns, FAQs, terms, privacy) | Done |

---

## Connect With Me

**Built by Aarti Sharma**

| | |
|---|---|
| **Portfolio** | [aartisharma-portfolio.netlify.app](https://aartisharma-portfolio.netlify.app/) |
| **GitHub** | [github.com/aartisharma0](https://github.com/aartisharma0) |

---

## Support

If you found this useful:

- **Star** this repo
- **Fork** it and build on top
- **Share** it with fellow developers

---

<p align="center">
  <strong>VELORIA</strong> — <em>"Where every piece tells your story"</em><br>
  Made with &#10084; by <a href="https://aartisharma-portfolio.netlify.app/">Aarti Sharma</a>
</p>
