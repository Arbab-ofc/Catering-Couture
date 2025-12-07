# Catering Couture · React + Vite + Tailwind + Firebase

[![Live](https://img.shields.io/badge/Live-catering--8f8d6.web.app-34D399?logo=firebase&logoColor=white)](https://catering-8f8d6.web.app)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-3448C5?logo=cloudinary&logoColor=white)
![License](https://img.shields.io/badge/License-Private-blue)

Luxury catering marketplace connecting rural Indian chefs to global buyers. Supports buyers (admins), sellers, and guests with rich UI, theming, and robust logging—combining heirloom recipes, concierge-grade digital flows, real-time cart and order tracking, and Cloudinary-optimized visuals to deliver a premium hospitality experience online.

---

## ✨ Experience
- Hero landing with Signature Experiences carousel, responsive breakpoints, dark/light theme toggle.
- Products grid with filters, sorting, search, lazy-loaded images, and quick add-to-cart.
- Product detail with seller info and Firestore-backed ratings.
- Guest cart (local storage) + user cart (Firestore) with badge highlights.
- Checkout, orders with rating submission, seller incoming orders, and seller hub for product management.
- Auth flows: email/password, Google, email verification, forgot password, role-based routes.
- Admin portal: approve sellers, manage users, set roles, admin-only dashboard.
- Logging everywhere (info/error) for auth, cart, products, orders.
- Designed for luxury UX: warm palettes, glassmorphism accents, elevated cards/buttons, smooth micro-interactions, and accessibility-first defaults.
- Performance-conscious: lazy images, route-based code splitting, Cloudinary optimizations, and guarded Firestore writes.

## 🧭 Navigation
- Header: theme toggle, role-aware links (Dashboard for admin, Seller Hub for seller), cart badge.
- Footer: Quick links (Home, Products, About, Cart; Orders/Profile only when logged in) + social (LinkedIn, GitHub, email).
- About page: brand story and pillars.

## 🛠️ Stack
- 🧩 Frontend: React 18, Vite, Tailwind CSS
- 🧭 Routing: React Router DOM
- 🖼️ Icons: React Icons (Lucide)
- 🧠 State: Custom Auth Context
- 🔥 Backend: Firebase (Auth, Firestore, Hosting)
- ☁️ Media: Cloudinary unsigned uploads
- 🪵 Logging: Central JS logger (info/debug/error)
- 🚦 Build tooling: ESLint + Vite

## 🧩 Roles & Access
- Default role: `user`.
- Seller: approved by admin; seller hub for products & orders.
- Admin: can approve/demote/promote roles; dashboard access.
- Rating: signed-in buyers can rate purchased items; rating fields are guarded in rules.

## 🔐 Admin Secret
- Admin signup requires secret stored in Firestore `settings/admin.adminSecret` (default: `Arbab@321`).
- Admin can update the secret (via Firestore helper).

## 🛒 Cart Behavior
- Guests: local storage cart with badge; merges into Firestore on login (then guest cart is cleared).
- Logged-in: Firestore cart; badge updates on add/remove.
- Checkout requires login.

## 🌙 Theming & Responsiveness
- Dark/Light with smooth transitions.
- Breakpoints: small mobile → mobile → tablet → large desktop layouts.

## 📦 Setup
1) Install
```
npm install
```
2) Env (`.env` in project root)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_CLOUDINARY_CLOUD_NAME=dknu6pc0s
VITE_CLOUDINARY_UPLOAD_PRESET=catering
```
3) Dev
```
npm run dev
```
4) Build
```
npm run build
```
5) Preview
```
npm run preview
```

## ☁️ Firebase
- CLI: `npm install -g firebase-tools` then `firebase login`.
- Init hosting (if not yet): `firebase init hosting` (public dir: `dist`, SPA rewrite: yes).
- Deploy hosting: `npm run build && firebase deploy --only hosting`.
- Deploy Firestore rules: `firebase deploy --only firestore:rules`.

## 🔒 Firestore Rules (reference)
Deploy these in `firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function getRole(uid) {
      return get(/databases/$(database)/documents/users/$(uid)).data.role;
    }
    function hasRole(uid, allowed) {
      return allowed.hasAny([getRole(uid)]);
    }

    match /users/{userId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null &&
        (request.auth.uid == userId || getRole(request.auth.uid) == 'admin');
      allow delete: if request.auth != null && (
        (request.auth.uid == userId && getRole(request.auth.uid) != 'admin') ||
        (getRole(request.auth.uid) == 'admin' && request.auth.uid != userId)
      );
    }

    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null && hasRole(request.auth.uid, ['seller','admin']);
      allow update, delete: if request.auth != null && (
        getRole(request.auth.uid) == 'admin' ||
        (getRole(request.auth.uid) == 'seller' && request.auth.uid == resource.data.sellerId)
      );
      allow update: if request.auth != null &&
        request.resource.data.diff(resource.data).changedKeys().hasOnly(
          ['rating','ratingTotal','ratingCount','updatedAt']
        ) &&
        request.resource.data.rating is number &&
        request.resource.data.ratingTotal is number &&
        request.resource.data.ratingCount is number;
    }

    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && (
        request.auth.uid == resource.data.buyerId ||
        request.auth.uid == resource.data.sellerId ||
        getRole(request.auth.uid) == 'admin'
      );
      allow delete: if request.auth != null && getRole(request.auth.uid) == 'admin';
    }

    match /settings/{docId} {
      allow create, read: if request.auth != null;
      allow update, delete: if request.auth != null && getRole(request.auth.uid) == 'admin';
    }
  }
}
```

## 🗂️ Structure
```
src/
  components/ (common/layout/forms/products)
  pages/ (admin, user, auth, About)
  services/ (firebase, cloudinary, logger, localCart)
  context/ (AuthContext)
  router.jsx
```

## 🔑 Admin Secret Management
- Default stored at `settings/admin.adminSecret`: `Arbab@321` (created if missing).
- Only admins can update `settings/*` per rules.
- Admin registration form requires the secret when role=admin.

## 🧪 Testing (manual)
- Auth: register/login (email & Google), verify email, forgot password, logout.
- Roles: admin login sees Dashboard; seller login sees Seller Hub; user sees Products/Cart.
- Cart: guest add/remove, badge updates, login merges guest cart, checkout requires login.
- Products: filters/sort/search, add-to-cart, ratings.
- Upload: seller uploads with Cloudinary.
- Orders: buyer orders, seller incoming orders, rating submission.
- Admin: approve seller, change roles, delete user.
- About: About page links, footer quick links visibility.
- Theme: dark/light toggle across pages; responsive breakpoints.

## 🔗 Social
- LinkedIn: https://www.linkedin.com/in/arbab-ofc/
- GitHub: https://github.com/Arbab-ofc
- Email: arbabprvt@gmail.com

## ⚙️ Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview built app
