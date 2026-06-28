# MobileZone - E-commerce for Mobile Accessories (SaaS)

## Project Info
- **Root**: `D:\e commrece app demo using supabase\mobile-accessories-store`
- **Stack**: Vite + React 19 + TypeScript 6 + Firebase + GitHub Pages
- **Live**: https://jayaswinjay-web.github.io/mobile-accessories-store/
- **Repo**: https://github.com/jayaswinjay-web/mobile-accessories-store

## Architecture
### 4 User Roles (SaaS)
| Role | Dashboard | Permissions |
|------|-----------|-------------|
| `super_admin` | `/admin` | Manage users, roles, sellers, deliveries, platform oversight |
| `user` | `/` (storefront) | Browse products, cart, checkout, view orders |
| `seller` | `/seller` | Add/manage products, view/receive orders, update fulfillment |
| `delivery_person` | `/delivery` | View assigned deliveries, update delivery status (picked_up -> in_transit -> delivered) |

### Data Flow
- **Auth**: Firebase Auth (email/password). Role stored in Firestore `users/{uid}.role`
- **Routing**: React Router v6 with `ProtectedRoute` component enforcing role-based access
- **Cart**: localStorage-based via `CartContext` (no DB writes until checkout)
- **Orders**: Firestore `orders/` collection, linked by `userId`, `sellerId`, `deliveryPersonId`
- **Products**: Firestore `products/` collection, linked by `sellerId`
- **Deliveries**: Firestore `deliveries/` collection, assigned by admin

### Key Files
- `src/lib/firebase.ts` - Firebase initialization (reads `VITE_FIREBASE_*` env vars)
- `src/services/auth.ts` - Register, login, logout, get user data
- `src/services/firestore.ts` - All CRUD operations for users, products, orders, deliveries
- `src/services/storage.ts` - Image upload to Firebase Storage
- `src/contexts/AuthContext.tsx` - Auth state provider
- `src/contexts/CartContext.tsx` - Cart state with localStorage persistence
- `src/components/ProtectedRoute.tsx` - Role-based route guard
- `src/App.tsx` - All route definitions

### Commands
```bash
npm run dev      # Development server
npm run build    # TypeScript check + Vite build
npm run deploy   # Build + publish to GitHub Pages
```

## Firebase Setup Required
To make the app functional, you need to:
1. Go to https://console.firebase.google.com/ and create a new project
2. Enable **Authentication** -> Sign-in method -> Email/Password
3. Create **Firestore Database** (start in test mode, then set up security rules)
4. Create **Storage** bucket (for product images)
5. Copy Firebase config to `.env` file (see `.env.example`)

### Firestore Security Rules (start with test mode):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Security Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Initial Data Seeding
After Firebase setup, use Firestore console to seed:
1. **Categories**: `cases`, `chargers`, `cables`, `headphones`, `screen-protectors`, `power-banks`, `stands-mounts`, `smart-watches`
2. **Products**: Add real products from real brands (Apple, Samsung, OnePlus, Boat, etc.) with real prices and descriptions
3. **Admin user**: Create in Firebase Auth, then manually set `role: "super_admin"` in Firestore `users/{uid}` document

## How to Create First Admin
1. Register via the app (as any role)
2. Go to Firebase Console -> Firestore -> `users` collection
3. Find your user document and change `role` field to `"super_admin"`
4. Log out and log back in - you'll see the Admin dashboard

## Conversation Skill
This project has a saved skill at `.opencode/skills/ecommerce-firebase-saas/skill.jsonc`
When working on this project in future sessions, load the skill with: load the skill "ecommerce-firebase-saas"
