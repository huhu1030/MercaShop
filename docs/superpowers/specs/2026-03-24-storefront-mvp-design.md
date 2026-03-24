# Storefront MVP: Browse, Login, Order, Pay

## Problem

The storefront app currently only displays a branded header and placeholder text. Customers cannot browse products, place orders, or pay. The API has no public (unauthenticated) endpoints — all product and establishment data requires auth, which blocks anonymous browsing. The Mollie payment redirect URL is hardcoded for a mobile app deep link and doesn't work for web.

## Solution

Build a fully functional, responsive customer-facing storefront that lets customers:

1. Browse products without logging in (new public API endpoints)
2. Add items to a cart (client-side, Jotai + localStorage)
3. Log in at checkout via Firebase Identity Platform
4. Place an order and pay via Mollie (card, Bancontact) or cash
5. See real-time order status updates via Socket.io

## Architecture Overview

### Request Flow

```
Customer visits https://lebon.be
  1. Branding loads from /branding/config.json (CDN/static — already implemented)
  2. Public API: GET /api/public/establishments → auto-select single establishment
  3. Public API: GET /api/public/establishments/{id}/products → display catalog
  4. Customer adds items to cart (client-side only)
  5. Customer clicks "Checkout" → auth gate
  6. GET /api/tenants/config?domain=lebon.be → identityPlatformTenantId
  7. Firebase Auth → login/register
  8. POST /api/users (first login only)
  9. POST /api/orders → create order
  10. POST /api/payments → Mollie checkoutUrl (card/Bancontact) or cash confirmation
  11. Mollie redirects to https://lebon.be/order/{orderId}/status
  12. Socket.io → real-time order status updates
```

### Tenant & Establishment Resolution

- **Domain → Tenant:** Existing middleware resolves tenant from `Origin` header via `domains` array on the Tenant model. No changes needed.
- **Establishment:** For MVP, each tenant has one establishment. The storefront fetches the tenant's establishment list and auto-selects the first one. No slug routing needed yet.
- **Future (multi-establishment):** Routes like `lebon.be/est-slug/` will use a `slug` field on the Establishment model. The slug field is added now to prepare for this.

### Auth Strategy — Lazy Authentication

Auth is deferred until the customer needs to interact with protected resources (placing an order). This means:

- Browsing products: no auth
- Cart management: no auth (client-side)
- Checkout, ordering, payment, order status, profile: auth required

On first login, the storefront calls `POST /api/users` to register the customer in the API. Subsequent visits use the existing Firebase session.

## API Changes

### New Public Endpoints

A new `PublicController` with unauthenticated endpoints. These use the existing tenant resolution middleware (Origin header) but skip auth.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/public/establishments` | List establishments for the resolved tenant |
| `GET` | `/api/public/establishments/{id}/products` | List products for one establishment |

Public endpoints return restricted DTOs — no sensitive or admin-only fields.

### New Public DTOs (Shared Package)

```typescript
interface IPublicEstablishment {
  _id: string
  name: string
  slug: string
  logo: string
  banner?: string
  status: string
  openingHours?: string
  address: IAddress
  paymentMethods: PaymentMethod[]
  description?: string
}

interface IPublicProduct {
  _id: string
  name: string
  description?: string
  price: number
  photo?: string
  category: string
}
```

Note: `openingHours` is a plain string in the current Establishment model (not a structured object). `banner`, `description`, and `photo` are optional with empty-string defaults in Mongoose. The DTOs match the current model types.

Fields excluded from public response: `quantity`, `serialNumber`, `location` (lat/lon), `tenantId`, `establishmentId`, `ownerId`, `products` (ID array), `path`, `mode`.

### Model Changes

**Establishment model — add two fields:**

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `slug` | `string` | Required, unique within tenant | URL-friendly identifier for future multi-establishment routing |
| `paymentMethods` | `PaymentMethod[]` | `['CARD', 'CASH']` | Configurable payment methods per establishment |

**Migration note:** Existing establishments in MongoDB have no `slug` or `paymentMethods` fields. A migration script must set a default `slug` (derived from the establishment name, e.g., `slugify(name)`) and default `paymentMethods: ['CARD', 'CASH']` for all existing documents before the schema validation is applied. The seed scripts must also be updated.

### Enum Changes

```typescript
enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANCONTACT = 'BANCONTACT',  // new
}
```

### Mollie Redirect URL — Server-Side Construction

Replace the hardcoded mobile deep link with tenant-aware redirect:

```typescript
// Current (hardcoded mobile deep link in mollieService.ts:42)
redirectUrl: `be.mercashop.app://paymentstatus/${orderId}`

// New (tenant-aware, server-side)
const storefrontDomain = tenant.domains.find(d => !d.startsWith('dashboard.'))
const protocol = storefrontDomain?.startsWith('localhost') ? 'http' : 'https'
const redirectUrl = `${protocol}://${storefrontDomain}/order/${orderId}/status`
```

**Call chain change required:** Currently `mollieService.createPayment()` receives only `CreatePaymentOptions` (amount, description, orderId, currency, methods) — it has no access to the tenant. The `redirectUrl` must be constructed upstream and passed as a new field on `CreatePaymentOptions`. The call chain:

1. `PaymentController.processPayment` → has `req.tenant` (full tenant document)
2. `paymentService.processPayment` → receives `tenantId`, must also receive tenant domains or the constructed redirect URL
3. `paymentService.handleCardPayment` → passes redirect URL to Mollie service
4. `mollieService.createPayment` → add `redirectUrl` to `CreatePaymentOptions`, use it instead of the hardcoded value

Security rationale: redirect URLs must be server-side constructed to prevent open redirect attacks (OWASP CWE-601). This is the industry standard — Stripe, Shopify, and WooCommerce all build redirect URLs server-side. The client never supplies a URL.

### BANCONTACT Payment Routing

The current `paymentService.ts` only checks for `PaymentMethod.CARD` to route to Mollie — `BANCONTACT` would fall through to cash handling. The payment routing logic must be updated:

```typescript
// Current (paymentService.ts)
if (paymentMethod === PaymentMethod.CARD) {
    return handleCardPayment(email, plainOrder);
}

// New — both CARD and BANCONTACT route to Mollie
if (paymentMethod === PaymentMethod.CARD || paymentMethod === PaymentMethod.BANCONTACT) {
    return handleCardPayment(email, plainOrder, redirectUrl);
}
```

### Socket.io — Tenant-Scoped Room Isolation

The current Socket.io server broadcasts `newOrders` events globally to ALL connected clients (`this.io.emit('newOrders', data)`). This is a cross-tenant data leakage risk — every connected storefront would receive every order update.

**Required change:** Add room-based isolation. When a client connects, it joins a room scoped to its order:

```typescript
// Client (storefront) — on OrderStatusPage mount
socket.emit('join-order', orderId)

// Server — on connection
socket.on('join-order', (orderId) => {
  socket.join(`order:${orderId}`)
})

// Server — when order status changes (in orderService)
io.to(`order:${orderId}`).emit('order-updated', orderData)
```

The existing `newOrders` event (used by the dashboard) remains unchanged for backward compatibility. The storefront uses the new `order-updated` event scoped to the specific order room.

### User Registration — Existing Endpoint

The existing `POST /api/users` endpoint (authenticated) accepts `{ firstName, lastName, phone? }` and creates a user record with `role: USER`. This works for customer self-registration from the storefront — no changes needed. The storefront calls this after first Firebase login.

### CORS Configuration

Storefront domains (e.g., `lebon.be`) must be added to the `CORS_ORIGINS` environment variable for the API to accept cross-origin requests. For local dev, `http://localhost:3000` must be included. This is an operational requirement during tenant onboarding.

### Unchanged

- All existing authenticated endpoints — untouched
- Order model / Payment model — no schema changes
- Dashboard API usage — unaffected

## Storefront Architecture

### Tech Stack

Same as the dashboard: React 19, Vite 8, TypeScript 5.9, Chakra UI v3, React Router v7, React Query, Jotai, Vitest.

Additionally: Firebase Auth SDK, Socket.io client.

### State Management

| State | Solution | Persistence |
|-------|----------|-------------|
| Branding | `useBranding` hook (exists) | In-memory (fetched once) |
| Establishment + products | React Query | Cache (refetch on window focus) |
| Cart | Jotai atom | localStorage |
| Auth (Firebase user + token) | React context + `onAuthStateChanged` | Firebase session |
| User profile | React Query | Cache (fetched after auth) |

### Page Structure

```
/                       → Product catalog (public)
/cart                   → Full cart view (mobile)
/checkout               → Checkout form (auth required)
/order/{id}/status      → Order status with Socket.io (auth required)
/login                  → Login / register
/profile                → User profile (auth required)
```

### Component Tree

```
<App>
  <ChakraProvider>
    <AuthProvider>              ← Firebase auth context (lazy init)
      <BrowserRouter>
        <StorefrontShell>       ← Branded header + cart icon
          <AppRoutes />
        </StorefrontShell>
      </BrowserRouter>
    </AuthProvider>
  </ChakraProvider>
</App>
```

### File Structure

```
platform/apps/storefront/src/
├── context/
│   └── AuthContext.tsx              # Firebase auth provider, lazy tenant config fetch
├── hooks/
│   ├── useBranding.ts              # (exists)
│   ├── useAuth.ts                  # Consumes AuthContext
│   ├── useEstablishment.ts         # Fetches single establishment (public)
│   ├── useProducts.ts              # Fetches products for establishment (public)
│   └── useCart.ts                  # Jotai cart atom + helpers (add, remove, clear, total)
├── components/
│   ├── StorefrontShell.tsx         # (exists — add cart icon, responsive nav)
│   ├── LoadingScreen.tsx           # (exists)
│   ├── StoreNotFound.tsx           # (exists)
│   ├── ProductCard.tsx             # Single product display
│   ├── ProductGrid.tsx             # Responsive grid of ProductCards
│   ├── CartDrawer.tsx              # Slide-out cart panel (desktop)
│   ├── CartIcon.tsx                # Header cart icon with badge
│   ├── CheckoutForm.tsx            # Delivery, billing, payment method
│   ├── OrderSummary.tsx            # Line items + total
│   ├── PaymentMethodSelector.tsx   # Filtered by establishment.paymentMethods
│   ├── AuthGate.tsx                # Redirects to /login if not authenticated
│   └── LoginForm.tsx               # Email/password + Google sign-in
├── pages/
│   ├── HomePage.tsx                # (exists — becomes product catalog)
│   ├── CartPage.tsx                # Full cart view (mobile)
│   ├── CheckoutPage.tsx            # Checkout flow
│   ├── OrderStatusPage.tsx         # Real-time status via Socket.io
│   ├── LoginPage.tsx               # Login / register
│   └── ProfilePage.tsx             # User profile
├── lib/
│   ├── firebase.ts                 # Firebase app + auth (lazy init after tenant config)
│   └── cart-store.ts               # Jotai atoms + localStorage persistence
├── AppRoutes.tsx                   # (exists — expand with new routes)
├── App.tsx                         # (exists — add AuthProvider)
└── main.tsx                        # (exists)
```

## Checkout & Payment Flow

### Step-by-Step

1. Customer has items in cart (Jotai atom, persisted to localStorage)
2. Clicks "Checkout"
3. `AuthGate` checks auth state — if not authenticated, redirect to `/login` with return URL
4. `/checkout` page displays:
   - Order summary (items, quantities, prices, total)
   - Delivery method selector (PICKUP / DELIVERY)
   - Delivery address form (if DELIVERY)
   - Billing information form (name, email, phone)
   - Payment method selector (only methods from `establishment.paymentMethods`)
5. Customer submits
6. Storefront calls `POST /api/orders`:
   - `establishmentId`, `orderLines` (from cart), `total`, `paymentMethod`, `deliveryMethod`, `deliveryAddress`, `billingInformation`
7. Then calls `POST /api/payments` with `{ orderId, paymentMethod }`
8. **If CARD or BANCONTACT:**
   - API creates Mollie payment with server-side redirect URL
   - Returns `checkoutUrl` (Mollie hosted payment page)
   - Storefront redirects customer to Mollie
   - Customer pays on Mollie
   - Mollie redirects back to `/order/{orderId}/status`
   - Mollie webhook updates order status server-side
9. **If CASH:**
   - API marks order, decrements stock, sends confirmation email
   - Storefront navigates to `/order/{orderId}/status` directly
10. Cart is cleared after successful order creation

### Order Status Page

- Connects to Socket.io on mount, emits `join-order` with `orderId` to join the scoped room
- Listens for `order-updated` event (scoped to the order room — no cross-tenant leakage)
- Displays: order status, payment status, order details (items, total, delivery info)
- Updates in real-time as the establishment processes the order
- Disconnects on unmount

## Responsive Design

Chakra UI responsive props with standard breakpoints:

| Component | Mobile (<768px) | Desktop (>=768px) |
|-----------|-----------------|---------------------|
| ProductGrid | 1–2 columns | 3–4 columns |
| Cart access | Full page at `/cart` | Slide-out drawer |
| CartIcon | In header, always visible | In header, always visible |
| CheckoutForm | Single column, stacked | Two columns (summary + form) |
| StorefrontShell header | Compact: logo + cart icon | Full: logo + app name + nav + cart |
| LoginForm | Full width | Centered card, max-width 400px |
| ProductCard | Full width or 2-col | Fixed-width cards in grid |

## Security

| Concern | Solution |
|---------|----------|
| Open redirect (payment) | Redirect URL built server-side from tenant domains — client never supplies URL |
| Public data exposure | Public endpoints return restricted DTOs — no sensitive fields |
| Tenant isolation | Existing tenant resolution middleware on all endpoints |
| Socket.io cross-tenant leakage | Room-based isolation — clients join order-specific rooms, events scoped to room |
| Auth bypass | `AuthGate` component + server-side JWT verification on protected endpoints |
| Cart tampering | Cart is convenience only — order total and prices validated server-side against product records |
| CSRF | Bearer token auth (not cookies) — CSRF not applicable |

## What Is NOT In Scope

- Multi-establishment routing (`/slug/`) — future, slug field added now for preparation
- Product search or filtering
- Customer order history page
- Email notifications to customers (already exists server-side, no storefront UI)
- Admin dashboard changes
- Infrastructure (LB, CDN, GCS branding bucket) — deferred per separate decision
- Native mobile app
- SSR / SEO optimization
