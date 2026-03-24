# Storefront MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully functional customer-facing storefront: browse products (public), login, order, pay via Mollie, real-time order status.

**Architecture:** New public API endpoints (Tsoa controller, no auth) for product/establishment browsing. Storefront SPA with lazy Firebase auth, Jotai cart, React Query data fetching, Socket.io order tracking. Mollie redirect URL built server-side from tenant domains.

**Tech Stack:** Express + Tsoa (API), React 19 + Vite + Chakra UI v3 + React Router v7 + React Query + Jotai (storefront), Firebase Identity Platform (auth), Mollie (payments), Socket.io (real-time), Vitest + Jest (testing)

**Spec:** `docs/superpowers/specs/2026-03-24-storefront-mvp-design.md`

---

## File Map

### API — New Files
| File | Responsibility |
|------|---------------|
| `platform/apps/api/src/controllers/PublicController.ts` | Tsoa controller for unauthenticated public endpoints |
| `platform/apps/api/src/services/publicService.ts` | Business logic for public data access (restricted DTOs) |
| `platform/apps/api/tests/services/publicService.test.ts` | Tests for public service |
| `platform/apps/api/tests/services/socketServer.test.ts` | Tests for Socket.io room isolation |

### API — Modified Files
| File | Change |
|------|--------|
| `platform/packages/shared/src/enums.ts` | Add `BANCONTACT` to `PaymentMethod` |
| `platform/packages/shared/src/types.ts` | Add `IPublicEstablishment`, `IPublicProduct` DTOs |
| `platform/apps/api/src/types/order.ts` | Add `BANCONTACT` to API-side `PaymentMethod` |
| `platform/apps/api/src/models/Establishment.ts` | Add `slug`, `paymentMethods` fields |
| `platform/apps/api/src/services/paymentService.ts` | BANCONTACT routing + pass redirect URL |
| `platform/apps/api/src/services/mollieService.ts` | Accept `redirectUrl` in options |
| `platform/apps/api/src/controllers/PaymentController.ts` | Pass tenant domains to payment service |
| `platform/apps/api/src/services/socketServer.ts` | Room-based isolation (`join-order`, `order-updated`) |
| `platform/apps/api/src/scripts/seed-establishment.ts` | Add slug + paymentMethods to seed data |
| `platform/apps/api/tests/services/paymentService.test.ts` | Update for BANCONTACT + redirect URL (existing tests need 3rd arg for handleCardPayment) |
| `platform/packages/shared/src/api/clients.ts` | Add `getPublicApi()` lazy-loaded singleton |

### Storefront — New Files
| File | Responsibility |
|------|---------------|
| `platform/apps/storefront/src/lib/firebase.ts` | Firebase app + auth lazy init |
| `platform/apps/storefront/src/lib/cart-store.ts` | Jotai atoms + localStorage persistence |
| `platform/apps/storefront/src/context/AuthContext.tsx` | Firebase auth provider, tenant config fetch |
| `platform/apps/storefront/src/hooks/useAuth.ts` | Consumes AuthContext |
| `platform/apps/storefront/src/hooks/useEstablishment.ts` | Fetch single establishment (public) |
| `platform/apps/storefront/src/hooks/useProducts.ts` | Fetch products for establishment (public) |
| `platform/apps/storefront/src/hooks/useCart.ts` | Cart operations (add, remove, clear, total) |
| `platform/apps/storefront/src/components/ProductCard.tsx` | Single product display |
| `platform/apps/storefront/src/components/ProductGrid.tsx` | Responsive grid |
| `platform/apps/storefront/src/components/CartIcon.tsx` | Header icon with badge |
| `platform/apps/storefront/src/components/CartDrawer.tsx` | Slide-out cart (desktop) |
| `platform/apps/storefront/src/components/OrderSummary.tsx` | Line items + total |
| `platform/apps/storefront/src/components/CheckoutForm.tsx` | Delivery, billing, payment method |
| `platform/apps/storefront/src/components/PaymentMethodSelector.tsx` | Filtered radio group |
| `platform/apps/storefront/src/components/AuthGate.tsx` | Redirect to login if unauthenticated |
| `platform/apps/storefront/src/components/LoginForm.tsx` | Email/password + Google sign-in |
| `platform/apps/storefront/src/pages/CartPage.tsx` | Full cart view (mobile) |
| `platform/apps/storefront/src/pages/CheckoutPage.tsx` | Checkout flow |
| `platform/apps/storefront/src/pages/OrderStatusPage.tsx` | Real-time status via Socket.io |
| `platform/apps/storefront/src/pages/LoginPage.tsx` | Login / register |
| `platform/apps/storefront/src/pages/ProfilePage.tsx` | User profile |

### Storefront — Modified Files
| File | Change |
|------|--------|
| `platform/apps/storefront/src/main.tsx` | Add QueryClientProvider, initApiClient |
| `platform/apps/storefront/src/App.tsx` | Wrap with AuthProvider |
| `platform/apps/storefront/src/AppRoutes.tsx` | Add all routes |
| `platform/apps/storefront/src/components/StorefrontShell.tsx` | Responsive header, CartIcon |
| `platform/apps/storefront/src/pages/HomePage.tsx` | Replace placeholder with product catalog |

---

## Task 1: Add BANCONTACT Enum + Public DTOs to Shared Package

**Files:**
- Modify: `platform/packages/shared/src/enums.ts`
- Modify: `platform/packages/shared/src/types.ts`
- Modify: `platform/apps/api/src/types/order.ts`

- [x] **Step 1: Add BANCONTACT to shared PaymentMethod enum**

In `platform/packages/shared/src/enums.ts`, add `BANCONTACT` to the `PaymentMethod` enum:

```typescript
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANCONTACT = 'BANCONTACT',
}
```

- [x] **Step 2: Add BANCONTACT to API-side PaymentMethod enum**

In `platform/apps/api/src/types/order.ts`, add `BANCONTACT`:

```typescript
export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  BANCONTACT = 'BANCONTACT',
}
```

- [x] **Step 3: Add public DTOs to shared types**

In `platform/packages/shared/src/types.ts`, add after the existing interfaces:

```typescript
export interface IPublicEstablishment {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  banner?: string;
  status: string;
  openingHours?: string;
  address: IAddress;
  paymentMethods: PaymentMethod[];
  description?: string;
}

export interface IPublicProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  photo?: string;
  category: string;
}
```

Import `PaymentMethod` at the top of the file if not already imported from enums.

- [x] **Step 4: Verify shared package builds**

Run: `cd platform && pnpm --filter @mercashop/shared build`
Expected: Build succeeds with no errors.

- [x] **Step 5: Run typecheck across monorepo**

Run: `cd platform && pnpm typecheck`
Expected: No type errors related to PaymentMethod or new interfaces. There may be existing unrelated errors — note them but do not fix.

- [x] **Step 6: Commit**

```bash
git add platform/packages/shared/src/enums.ts platform/packages/shared/src/types.ts platform/apps/api/src/types/order.ts
git commit -m "feat: add BANCONTACT payment method and public DTOs to shared types"
```

---

## Task 2: Add slug + paymentMethods to Establishment Model

**Files:**
- Modify: `platform/apps/api/src/models/Establishment.ts`
- Modify: `platform/apps/api/src/scripts/seed-establishment.ts`

- [x] **Step 1: Add slug and paymentMethods to EstablishmentDocument interface**

In `platform/apps/api/src/models/Establishment.ts`, add to the `EstablishmentDocument` interface:

```typescript
slug: string;
paymentMethods: string[];
```

- [x] **Step 2: Add slug and paymentMethods to Mongoose schema**

Add these fields to the `EstablishmentSchema` definition:

```typescript
slug: { type: String, required: true },
paymentMethods: { type: [String], default: ['CARD', 'CASH'] },
```

Add a compound unique index for slug within a tenant:

```typescript
EstablishmentSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
```

- [x] **Step 3: Update seed script**

In `platform/apps/api/src/scripts/seed-establishment.ts`, add `slug` and `paymentMethods` to the seed data. Use a URL-friendly slug derived from the establishment name (e.g., `"main-store"`). Include all three payment methods:

```typescript
slug: 'main-store',
paymentMethods: ['CARD', 'CASH', 'BANCONTACT'],
```

- [x] **Step 4: Verify API builds**

Run: `cd platform && pnpm --filter @mercashop/api build`
Expected: Build succeeds.

- [x] **Step 5: Commit**

```bash
git add platform/apps/api/src/models/Establishment.ts platform/apps/api/src/scripts/seed-establishment.ts
git commit -m "feat: add slug and paymentMethods fields to Establishment model"
```

---

## Task 3: Public API Endpoints (TDD)

**Files:**
- Create: `platform/apps/api/src/services/publicService.ts`
- Create: `platform/apps/api/src/controllers/PublicController.ts`
- Create: `platform/apps/api/tests/services/publicService.test.ts`

- [x] **Step 1: Write failing tests for publicService**

Create `platform/apps/api/tests/services/publicService.test.ts`:

```typescript
import { publicService } from '../../src/services/publicService';
import Establishment from '../../src/models/Establishment';
import Product from '../../src/models/Product';

jest.mock('../../src/models/Establishment');
jest.mock('../../src/models/Product');

describe('publicService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getEstablishments', () => {
    it('returns public fields only', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        tenantId: 'tenant-1',
        name: 'Main Store',
        slug: 'main-store',
        logo: 'logo.png',
        banner: 'banner.png',
        status: 'OPEN',
        openingHours: '9-17',
        address: { street: 'Main St', number: '1', zipCode: '1000', municipality: 'Brussels', city: 'Brussels', country: 'BE' },
        paymentMethods: ['CARD', 'CASH'],
        description: 'A store',
        ownerId: 'owner-1',
        products: ['prod-1'],
        phone: '+32123456',
        category: 'food',
      };

      (Establishment.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockDoc]),
        }),
      });

      const result = await publicService.getEstablishments('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'Main Store');
      expect(result[0]).toHaveProperty('slug', 'main-store');
      expect(result[0]).toHaveProperty('paymentMethods');
      expect(result[0]).not.toHaveProperty('ownerId');
      expect(result[0]).not.toHaveProperty('products');
      expect(result[0]).not.toHaveProperty('phone');
      expect(result[0]).not.toHaveProperty('tenantId');
    });
  });

  describe('getProductsByEstablishment', () => {
    it('returns public product fields only', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439012',
        tenantId: 'tenant-1',
        establishmentId: 'est-1',
        name: 'Widget',
        description: 'A widget',
        price: 9.99,
        photo: 'widget.png',
        category: 'electronics',
        quantity: 50,
        serialNumber: 'SN123',
        location: { latitude: 50, longitude: 4 },
      };

      (Product.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockDoc]),
        }),
      });

      const result = await publicService.getProductsByEstablishment('tenant-1', 'est-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'Widget');
      expect(result[0]).toHaveProperty('price', 9.99);
      expect(result[0]).not.toHaveProperty('quantity');
      expect(result[0]).not.toHaveProperty('serialNumber');
      expect(result[0]).not.toHaveProperty('location');
      expect(result[0]).not.toHaveProperty('tenantId');
      expect(result[0]).not.toHaveProperty('establishmentId');
    });
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `cd platform && pnpm --filter @mercashop/api test -- --testPathPattern=publicService`
Expected: FAIL — Cannot find module `../../src/services/publicService`

- [x] **Step 3: Implement publicService**

Create `platform/apps/api/src/services/publicService.ts`:

```typescript
import Establishment from '../models/Establishment';
import Product from '../models/Product';
import { IPublicEstablishment, IPublicProduct } from '@mercashop/shared';

const PUBLIC_ESTABLISHMENT_FIELDS = '_id name slug logo banner status openingHours address paymentMethods description';
const PUBLIC_PRODUCT_FIELDS = '_id name description price photo category';

async function getEstablishments(tenantId: string): Promise<IPublicEstablishment[]> {
  return Establishment.find({ tenantId })
    .select(PUBLIC_ESTABLISHMENT_FIELDS)
    .lean<IPublicEstablishment[]>();
}

async function getProductsByEstablishment(tenantId: string, establishmentId: string): Promise<IPublicProduct[]> {
  return Product.find({ tenantId, establishmentId })
    .select(PUBLIC_PRODUCT_FIELDS)
    .lean<IPublicProduct[]>();
}

export const publicService = {
  getEstablishments,
  getProductsByEstablishment,
};
```

- [x] **Step 4: Run tests to verify they pass**

Run: `cd platform && pnpm --filter @mercashop/api test -- --testPathPattern=publicService`
Expected: PASS — all tests green.

- [x] **Step 5: Create PublicController**

Create `platform/apps/api/src/controllers/PublicController.ts`. This is a Tsoa controller **without** `@Security('BearerAuth')`:

```typescript
import { Controller, Get, Path, Request, Route, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { publicService } from '../services/publicService';
import { IPublicEstablishment, IPublicProduct } from '@mercashop/shared';

@Route('api/public')
@Tags('Public')
export class PublicController extends Controller {
  @Get('establishments')
  public async getEstablishments(
    @Request() request: ExpressRequest,
  ): Promise<IPublicEstablishment[]> {
    const tenantId = request.tenantId;
    return publicService.getEstablishments(tenantId);
  }

  @Get('establishments/{establishmentId}/products')
  public async getProductsByEstablishment(
    @Path() establishmentId: string,
    @Request() request: ExpressRequest,
  ): Promise<IPublicProduct[]> {
    const tenantId = request.tenantId;
    return publicService.getProductsByEstablishment(tenantId, establishmentId);
  }
}
```

Note: `request.tenantId` is set by the existing tenant resolution middleware which runs on all `/api/*` routes. The public controller does NOT use `@Security('BearerAuth')`, so no JWT is required.

- [x] **Step 6: Regenerate Tsoa routes**

Run: `cd platform && pnpm generate:api-spec`
Expected: Routes regenerated. New routes for `/api/public/*` appear in generated output.

Verify the public routes do NOT have auth middleware by inspecting the generated routes file.

- [x] **Step 7: Verify API builds**

Run: `cd platform && pnpm --filter @mercashop/api build`
Expected: Build succeeds.

- [x] **Step 8: Regenerate API client (so storefront tasks can use generated PublicApi)**

Run: `cd platform && pnpm generate:api-client`
Expected: New `PublicApi` class generated in `platform/packages/shared/src/apis/api/`.

- [x] **Step 9: Add `getPublicApi()` to shared clients**

In `platform/packages/shared/src/api/clients.ts`, add a lazy-loaded `getPublicApi()` singleton following the existing pattern (e.g., `getProductApi()`). Import the generated `PublicApi` class.

- [x] **Step 10: Rebuild shared package**

Run: `cd platform && pnpm --filter @mercashop/shared build`
Expected: Build succeeds.

- [x] **Step 11: Commit**

```bash
git add platform/apps/api/src/services/publicService.ts platform/apps/api/src/controllers/PublicController.ts platform/apps/api/tests/services/publicService.test.ts platform/apps/api/src/generated/ platform/packages/shared/src/
git commit -m "feat: add public API endpoints for establishment and product browsing"
```

---

## Task 4: Mollie Redirect URL + BANCONTACT Payment Routing (TDD)

**Files:**
- Modify: `platform/apps/api/src/services/mollieService.ts`
- Modify: `platform/apps/api/src/services/paymentService.ts`
- Modify: `platform/apps/api/src/controllers/PaymentController.ts`
- Modify: `platform/apps/api/tests/services/paymentService.test.ts`

- [x] **Step 1: Update existing handleCardPayment tests to accept 3rd arg**

The existing tests in `platform/apps/api/tests/services/paymentService.test.ts` call `handleCardPayment(email, mockOrder)` with only 2 arguments. After adding the `redirectUrl` parameter, these will break. Update ALL existing `handleCardPayment` test calls to pass a third argument:

```typescript
// Before:
handleCardPayment('user@test.com', mockOrder)
// After:
handleCardPayment('user@test.com', mockOrder, 'https://test.example.com/order/order-1/status')
```

Note: The existing test file imports individual named functions (`{ handleCardPayment, handleCashPayment, handleWebhook }`) — NOT `processPayment`. The new tests below add `processPayment` to the imports.

- [x] **Step 2: Write failing test for BANCONTACT routing**

Add to `platform/apps/api/tests/services/paymentService.test.ts`. Import `processPayment` alongside the existing imports. The test needs to mock `orderService.findOrderById` and `userService.findUserByFirebaseUid` since `processPayment` calls these before routing to card/cash:

```typescript
it('routes BANCONTACT payments through Mollie (same as CARD)', async () => {
  // Mock orderService.findOrderById to return a mock order
  // Mock userService.findUserByFirebaseUid to return { email: 'user@test.com' }
  // Call processPayment({ orderId: 'order-1', paymentMethod: PaymentMethod.BANCONTACT, tenantDomains: ['lebon.be'] }, firebaseUser)
  // Assert mollieService.createPayment was called (not the cash flow)
});
```

- [x] **Step 3: Write failing test for redirect URL construction**

```typescript
it('constructs redirect URL from tenant storefront domain', async () => {
  // Mock order and user as above
  // Call processPayment with tenantDomains: ['dashboard.lebon.be', 'lebon.be']
  // Assert mollieService.createPayment was called with { redirectUrl: 'https://lebon.be/order/order-1/status' }
});

it('uses http protocol for localhost domains', async () => {
  // Call processPayment with tenantDomains: ['localhost:3000']
  // Assert redirectUrl starts with 'http://localhost:3000/'
});
```

- [x] **Step 4: Run tests to verify they fail**

Run: `cd platform && pnpm --filter @mercashop/api test -- --testPathPattern=paymentService`
Expected: FAIL — BANCONTACT falls through to cash, no redirectUrl parameter exists.

- [x] **Step 4: Update mollieService to accept redirectUrl**

In `platform/apps/api/src/services/mollieService.ts`, add `redirectUrl` to the `CreatePaymentOptions` interface and use it instead of the hardcoded value:

```typescript
interface CreatePaymentOptions {
  amount: string;
  description: string;
  orderId: string;
  currency?: string;
  methods?: string[];
  redirectUrl: string;  // new — REQUIRED, not optional. Remove the old hardcoded fallback entirely.
}
```

Replace the hardcoded `redirectUrl: \`be.mercashop.app://paymentstatus/${orderId}\`` with `redirectUrl` from options. The `currency` and `methods` fields remain optional with their existing defaults inside the function — `redirectUrl` must be required to prevent accidentally falling back to the old hardcoded URL.

- [x] **Step 5: Update paymentService for BANCONTACT routing + redirect URL**

In `platform/apps/api/src/services/paymentService.ts`:

1. Update `processPayment` signature to accept `tenantDomains: string[]`
2. Build the redirect URL from tenant domains:

```typescript
function buildRedirectUrl(tenantDomains: string[], orderId: string): string {
  const storefrontDomain = tenantDomains.find(d => !d.startsWith('dashboard.'));
  if (!storefrontDomain) throw new Error('No storefront domain configured for tenant');
  const protocol = storefrontDomain.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${storefrontDomain}/order/${orderId}/status`;
}
```

3. Update the payment method routing to include BANCONTACT:

```typescript
if (paymentMethod === PaymentMethod.CARD || paymentMethod === PaymentMethod.BANCONTACT) {
  return handleCardPayment(email, plainOrder, redirectUrl);
}
```

4. Pass `redirectUrl` through `handleCardPayment` to `mollieService.createPayment`.

- [x] **Step 6: Update PaymentController to pass tenant domains**

In `platform/apps/api/src/controllers/PaymentController.ts`, pass `request.tenant.domains` to `paymentService.processPayment`. Note: `request.tenant` can be `undefined` (typed as `TenantDocument | undefined`). Add a guard before accessing it:

```typescript
if (!request.tenant) {
  this.setStatus(500);
  throw new Error('Tenant not resolved');
}
const tenantDomains = request.tenant.domains;
```

- [x] **Step 7: Run tests to verify they pass**

Run: `cd platform && pnpm --filter @mercashop/api test -- --testPathPattern=paymentService`
Expected: PASS — all tests green.

- [x] **Step 8: Regenerate Tsoa routes (if controller signature changed)**

Run: `cd platform && pnpm generate:api-spec`

- [x] **Step 9: Verify API builds**

Run: `cd platform && pnpm --filter @mercashop/api build`
Expected: Build succeeds.

- [x] **Step 10: Commit**

```bash
git add platform/apps/api/src/services/mollieService.ts platform/apps/api/src/services/paymentService.ts platform/apps/api/src/controllers/PaymentController.ts platform/apps/api/tests/services/paymentService.test.ts platform/apps/api/src/generated/
git commit -m "feat: add BANCONTACT routing and server-side Mollie redirect URL"
```

---

## Task 5: Socket.io Room-Based Isolation (TDD)

**Files:**
- Modify: `platform/apps/api/src/services/socketServer.ts`
- Create: `platform/apps/api/tests/services/socketServer.test.ts`

- [x] **Step 1: Write failing tests for room-based isolation**

Create `platform/apps/api/tests/services/socketServer.test.ts`:

```typescript
import { Server } from 'socket.io';
import SocketServer from '../../src/services/socketServer';

jest.mock('socket.io');

describe('SocketServer', () => {
  let socketServer: SocketServer;
  let mockIo: jest.Mocked<Server>;
  let mockSocket: { on: jest.Mock; join: jest.Mock };

  beforeEach(() => {
    mockSocket = { on: jest.fn(), join: jest.fn() };
    mockIo = {
      on: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Server>;

    // Trigger the 'connection' callback with mockSocket
    mockIo.on.mockImplementation((event, cb) => {
      if (event === 'connection') cb(mockSocket);
      return mockIo;
    });
  });

  it('joins order room when client emits join-order', () => {
    // Trigger the join-order handler
    mockSocket.on.mockImplementation((event, cb) => {
      if (event === 'join-order') cb('order-123');
    });

    // Initialize socket server with mock
    // Verify: mockSocket.join('order:order-123') was called
  });

  it('emits order-updated to specific order room', () => {
    // Call sendOrderUpdate(orderId, orderData)
    // Verify: mockIo.to('order:order-123').emit('order-updated', orderData)
  });

  it('still emits newOrders globally for dashboard backward compat', () => {
    // Call sendOrders(data)
    // Verify: mockIo.emit('newOrders', data) still works
  });
});
```

Adapt the test structure to match the actual `SocketServer` class in `socketServer.ts`.

- [x] **Step 2: Run tests to verify they fail**

Run: `cd platform && pnpm --filter @mercashop/api test -- --testPathPattern=socketServer`
Expected: FAIL — `sendOrderUpdate` method does not exist, no `join-order` handler.

- [x] **Step 3: Implement room-based isolation**

In `platform/apps/api/src/services/socketServer.ts`:

1. In the `connection` handler, add a `join-order` listener:

```typescript
socket.on('join-order', (orderId: string) => {
  socket.join(`order:${orderId}`);
});
```

2. Add a new `sendOrderUpdate` method:

```typescript
public sendOrderUpdate(orderId: string, data: Record<string, unknown>): void {
  this.io.to(`order:${orderId}`).emit('order-updated', data);
}
```

3. Keep the existing `sendOrders` method unchanged (dashboard backward compat).

- [x] **Step 4: Run tests to verify they pass**

Run: `cd platform && pnpm --filter @mercashop/api test -- --testPathPattern=socketServer`
Expected: PASS.

- [x] **Step 5: Wire sendOrderUpdate into order status changes**

Call `socketServer.sendOrderUpdate(orderId, orderData)` IN ADDITION TO the existing `sendOrders` call at these specific locations:

1. `platform/apps/api/src/services/orderService.ts` — in `notifyRealtime()` (called when order status changes)
2. `platform/apps/api/src/services/orderService.ts` — in `notifyEstablishment()` (called for new cash orders)
3. `platform/apps/api/src/services/paymentService.ts` — in `handleWebhook()` (called when Mollie payment succeeds)

Do NOT replace the existing `sendOrders` calls — the dashboard still uses the global `newOrders` event. Add `sendOrderUpdate` alongside each existing call.

- [x] **Step 6: Verify API builds**

Run: `cd platform && pnpm --filter @mercashop/api build`
Expected: Build succeeds.

- [x] **Step 7: Commit**

```bash
git add platform/apps/api/src/services/socketServer.ts platform/apps/api/tests/services/socketServer.test.ts
git commit -m "feat: add room-based Socket.io isolation for order status updates"
```

---

## Task 6: Storefront API Client + Firebase Lazy Init

**Prerequisites:**
- Ensure `CORS_ORIGINS` env var for the API includes `http://localhost:3000` (storefront dev server port). Check `platform/apps/api/.env` or `.env.local`.
- Ensure the local dev tenant's `domains` array in the seed script includes `localhost` (without port) for the storefront to resolve the tenant via `window.location.hostname`. Check `platform/apps/api/src/scripts/seed-tenant.ts`.
- Verify that `TenantController.getTenantConfig` does NOT have a `@Security('BearerAuth')` decorator — it must be a public endpoint for the lazy auth strategy to work. (Confirmed: it has no `@Security` decorator.)

**Files:**
- Create: `platform/apps/storefront/src/lib/firebase.ts`
- Modify: `platform/apps/storefront/src/main.tsx`

- [x] **Step 1: Create Firebase lazy init module**

Create `platform/apps/storefront/src/lib/firebase.ts`:

```typescript
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

export function getFirebaseAuth(): Auth {
  if (!auth) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function initFirebaseWithTenant(tenantId: string): Auth {
  const authInstance = getFirebaseAuth();
  authInstance.tenantId = tenantId;
  return authInstance;
}
```

- [x] **Step 2: Update main.tsx with API client + QueryClient**

Update `platform/apps/storefront/src/main.tsx` to initialize the API client and wrap with QueryClientProvider. Follow the dashboard pattern from `platform/apps/dashboard/src/main.tsx`:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { initApiClient } from '@mercashop/shared/api-client';
import { getFirebaseAuth } from './lib/firebase';
import App from './App';

const auth = getFirebaseAuth();

initApiClient({
  getAccessToken: () => auth.currentUser?.getIdToken() ?? Promise.resolve(null),
  forceRefreshToken: () => auth.currentUser?.getIdToken(true) ?? Promise.resolve(null),
  signOut: () => auth.signOut(),
  basePath: import.meta.env.VITE_API_URL,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    </QueryClientProvider>
  </StrictMode>,
);
```

- [x] **Step 3: Verify storefront builds**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds. (May need VITE_API_URL and VITE_FIREBASE_* env vars set — check if `.env` or `.env.local` exists in the storefront app.)

- [x] **Step 4: Commit**

```bash
git add platform/apps/storefront/src/lib/firebase.ts platform/apps/storefront/src/main.tsx
git commit -m "feat: add Firebase lazy init and API client setup for storefront"
```

---

## Task 7: Auth Context + useAuth Hook

**Files:**
- Create: `platform/apps/storefront/src/context/AuthContext.tsx`
- Create: `platform/apps/storefront/src/hooks/useAuth.ts`
- Modify: `platform/apps/storefront/src/App.tsx`

- [x] **Step 1: Create AuthContext**

Create `platform/apps/storefront/src/context/AuthContext.tsx`. Follow the dashboard's pattern from `platform/apps/dashboard/src/hooks/useAuth.tsx` but adapted for the storefront's lazy auth strategy:

```typescript
import { createContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initFirebaseWithTenant } from '../lib/firebase';
import { getTenantApi, getUserApi } from '@mercashop/shared/api-client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  tenantId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Lazy init: fetch tenant config and set Firebase tenant ID
  const initAuth = async () => {
    if (authInitialized) return;
    try {
      const hostname = window.location.hostname;
      const response = await getTenantApi().getTenantConfig(hostname);
      const config = response.data;
      const ipTenantId = config.identityPlatformTenantId;
      setTenantId(ipTenantId);

      const auth = initFirebaseWithTenant(ipTenantId);
      onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      setAuthInitialized(true);
    } catch {
      setLoading(false);
    }
  };

  // Check for existing Firebase session on mount
  useEffect(() => {
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    await initAuth();
    const auth = initFirebaseWithTenant(tenantId!);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    await initAuth();
    const auth = initFirebaseWithTenant(tenantId!);
    await createUserWithEmailAndPassword(auth, email, password);
    // Register user in API
    await getUserApi().createUser({ firstName, lastName });
  };

  const signInWithGoogle = async () => {
    await initAuth();
    const auth = initFirebaseWithTenant(tenantId!);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Check if user exists in API, if not register
    try {
      await getUserApi().getMe();
    } catch {
      const displayName = result.user.displayName ?? '';
      const [firstName, ...lastParts] = displayName.split(' ');
      await getUserApi().createUser({ firstName, lastName: lastParts.join(' ') });
    }
  };

  const logout = async () => {
    const { getFirebaseAuth } = await import('../lib/firebase');
    await signOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      tenantId,
      signIn,
      signUp,
      signInWithGoogle,
      logout,
      initAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Adapt this to match the exact API client method signatures from the generated API client in `platform/packages/shared/src/apis/api/`. Check the actual method names (e.g., `getTenantConfig` may take different parameters).

- [x] **Step 2: Create useAuth hook**

Create `platform/apps/storefront/src/hooks/useAuth.ts`:

```typescript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [x] **Step 3: Wrap App with AuthProvider**

In `platform/apps/storefront/src/App.tsx`, wrap the content with `<AuthProvider>`:

```typescript
import { AuthProvider } from './context/AuthContext';

// Inside the component, wrap BrowserRouter content:
<AuthProvider>
  <BrowserRouter>
    <StorefrontShell branding={branding}>
      <AppRoutes />
    </StorefrontShell>
  </BrowserRouter>
</AuthProvider>
```

- [x] **Step 4: Verify storefront builds**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds.

- [x] **Step 5: Commit**

```bash
git add platform/apps/storefront/src/context/AuthContext.tsx platform/apps/storefront/src/hooks/useAuth.ts platform/apps/storefront/src/App.tsx
git commit -m "feat: add AuthContext with lazy Firebase init for storefront"
```

---

## Task 8: Public Data Hooks (useEstablishment + useProducts)

**Files:**
- Create: `platform/apps/storefront/src/hooks/useEstablishment.ts`
- Create: `platform/apps/storefront/src/hooks/useProducts.ts`
- Create: `platform/apps/storefront/src/__tests__/useEstablishment.test.ts`
- Create: `platform/apps/storefront/src/__tests__/useProducts.test.ts`

- [ ] **Step 1: Write failing test for useEstablishment**

Create `platform/apps/storefront/src/__tests__/useEstablishment.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEstablishment } from '../hooks/useEstablishment';
import { ReactNode } from 'react';

// Mock the API client (note: api-client subpath export)
vi.mock('@mercashop/shared/api-client', () => ({
  getPublicApi: () => ({
    getEstablishments: vi.fn().mockResolvedValue([{
        _id: 'est-1',
        name: 'Main Store',
        slug: 'main-store',
        paymentMethods: ['CARD', 'CASH'],
      }],
    }),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useEstablishment', () => {
  it('fetches and returns the first establishment', async () => {
    const { result } = renderHook(() => useEstablishment(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.establishment).toBeDefined();
    expect(result.current.establishment?.name).toBe('Main Store');
  });
});
```

Note: The API client with `PublicApi` was regenerated in Task 3 (Steps 8-10). Use `getPublicApi()` from `@mercashop/shared/api-client`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd platform && pnpm --filter @mercashop/storefront test -- --run useEstablishment`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement useEstablishment**

Create `platform/apps/storefront/src/hooks/useEstablishment.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { IPublicEstablishment } from '@mercashop/shared';
import { getPublicApi } from '@mercashop/shared/api-client';

async function fetchEstablishments(): Promise<IPublicEstablishment[]> {
  return getPublicApi().getEstablishments();
}

export function useEstablishment() {
  const query = useQuery({
    queryKey: ['establishment'],
    queryFn: fetchEstablishments,
    select: (data) => data[0], // Auto-select first (only) establishment
  });

  return {
    establishment: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
```

Determine the correct API client approach by checking if `pnpm generate:api-client` generates a `PublicApi` class. If it does, use it. If not, use the shared axios instance directly.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd platform && pnpm --filter @mercashop/storefront test -- --run useEstablishment`
Expected: PASS.

- [ ] **Step 5: Write failing test for useProducts**

Create `platform/apps/storefront/src/__tests__/useProducts.test.ts` following the same pattern. The hook takes an `establishmentId` parameter and returns `{ products, isLoading, error }`.

- [ ] **Step 6: Implement useProducts**

Create `platform/apps/storefront/src/hooks/useProducts.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { IPublicProduct } from '@mercashop/shared';
import { getPublicApi } from '@mercashop/shared/api-client';

export function useProducts(establishmentId: string | undefined) {
  const query = useQuery({
    queryKey: ['products', establishmentId],
    queryFn: (): Promise<IPublicProduct[]> =>
      getPublicApi().getProductsByEstablishment(establishmentId!),
    enabled: !!establishmentId,
  });

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
```

- [ ] **Step 7: Run all storefront tests**

Run: `cd platform && pnpm --filter @mercashop/storefront test -- --run`
Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add platform/apps/storefront/src/hooks/useEstablishment.ts platform/apps/storefront/src/hooks/useProducts.ts platform/apps/storefront/src/__tests__/
git commit -m "feat: add useEstablishment and useProducts hooks for public data"
```

---

## Task 9: Cart Store (Jotai + localStorage)

**Files:**
- Create: `platform/apps/storefront/src/lib/cart-store.ts`
- Create: `platform/apps/storefront/src/hooks/useCart.ts`
- Create: `platform/apps/storefront/src/__tests__/useCart.test.ts`

- [ ] **Step 1: Write failing test for cart operations**

Create `platform/apps/storefront/src/__tests__/useCart.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'jotai';
import { useCart } from '../hooks/useCart';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider>{children}</Provider>
);

describe('useCart', () => {
  beforeEach(() => localStorage.clear());

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.total).toBe(9.99);
  });

  it('increments quantity for existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 });
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBeCloseTo(19.98);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 });
      result.current.removeItem('p1');
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('decrements quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 });
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 });
      result.current.decrementItem('p1');
    });
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('clears entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ _id: 'p1', name: 'Widget', price: 9.99 });
      result.current.addItem({ _id: 'p2', name: 'Gadget', price: 19.99 });
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd platform && pnpm --filter @mercashop/storefront test -- --run useCart`
Expected: FAIL.

- [ ] **Step 3: Implement cart store**

Create `platform/apps/storefront/src/lib/cart-store.ts`:

```typescript
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  photo?: string;
}

export const cartAtom = atomWithStorage<CartItem[]>('mercashop-cart', []);

export const cartTotalAtom = atom((get) => {
  const items = get(cartAtom);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export const cartItemCountAtom = atom((get) => {
  const items = get(cartAtom);
  return items.reduce((sum, item) => sum + item.quantity, 0);
});
```

- [ ] **Step 4: Implement useCart hook**

Create `platform/apps/storefront/src/hooks/useCart.ts`:

```typescript
import { useAtom, useAtomValue } from 'jotai';
import { cartAtom, cartTotalAtom, cartItemCountAtom } from '../lib/cart-store';

interface AddItemInput {
  _id: string;
  name: string;
  price: number;
  photo?: string;
}

export function useCart() {
  const [items, setItems] = useAtom(cartAtom);
  const total = useAtomValue(cartTotalAtom);
  const itemCount = useAtomValue(cartItemCountAtom);

  const addItem = (product: AddItemInput) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i._id !== productId));
  };

  const decrementItem = (productId: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i._id === productId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const clearCart = () => setItems([]);

  return { items, total, itemCount, addItem, removeItem, decrementItem, clearCart };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd platform && pnpm --filter @mercashop/storefront test -- --run useCart`
Expected: PASS — all cart tests green.

- [ ] **Step 6: Commit**

```bash
git add platform/apps/storefront/src/lib/cart-store.ts platform/apps/storefront/src/hooks/useCart.ts platform/apps/storefront/src/__tests__/useCart.test.ts
git commit -m "feat: add Jotai cart store with localStorage persistence"
```

---

## Task 10: Product Catalog UI (ProductCard + ProductGrid + HomePage)

**Files:**
- Create: `platform/apps/storefront/src/components/ProductCard.tsx`
- Create: `platform/apps/storefront/src/components/ProductGrid.tsx`
- Modify: `platform/apps/storefront/src/pages/HomePage.tsx`

- [ ] **Step 1: Create ProductCard component**

Create `platform/apps/storefront/src/components/ProductCard.tsx`:

A card displaying a single product: photo, name, description (truncated), price, and an "Add to cart" button. Uses Chakra UI `Card`, `Image`, `Text`, `Button`. Calls `useCart().addItem` on button click.

The card should be responsive — full-width on mobile, fixed-width in grid on desktop.

Reference the Chakra UI v3 Card component API. Use the `photo` field from `IPublicProduct` — construct the full image URL from the API base URL if needed, or use a placeholder if no photo.

- [ ] **Step 2: Create ProductGrid component**

Create `platform/apps/storefront/src/components/ProductGrid.tsx`:

A responsive grid using Chakra UI `SimpleGrid` with `columns={{ base: 1, sm: 2, md: 3, lg: 4 }}`. Takes a `products: IPublicProduct[]` prop and renders a `ProductCard` for each.

Show an empty state message if no products.

- [ ] **Step 3: Update HomePage to show product catalog**

Replace the placeholder in `platform/apps/storefront/src/pages/HomePage.tsx`:

```typescript
import { VStack, Heading, Spinner, Text } from '@chakra-ui/react';
import { useEstablishment } from '../hooks/useEstablishment';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/ProductGrid';

export function HomePage() {
  const { establishment, isLoading: estLoading } = useEstablishment();
  const { products, isLoading: prodLoading } = useProducts(establishment?._id);

  if (estLoading || prodLoading) {
    return <VStack py={20}><Spinner size="xl" /></VStack>;
  }

  return (
    <VStack align="stretch" gap={6} p={{ base: 4, md: 8 }}>
      <Heading size={{ base: 'lg', md: 'xl' }}>
        {establishment?.name ?? 'Our Products'}
      </Heading>
      <ProductGrid products={products} />
    </VStack>
  );
}
```

- [ ] **Step 4: Verify storefront builds and renders**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add platform/apps/storefront/src/components/ProductCard.tsx platform/apps/storefront/src/components/ProductGrid.tsx platform/apps/storefront/src/pages/HomePage.tsx
git commit -m "feat: add product catalog with responsive ProductCard grid"
```

---

## Task 11: Cart UI (CartIcon + CartDrawer + CartPage + OrderSummary)

**Files:**
- Create: `platform/apps/storefront/src/components/CartIcon.tsx`
- Create: `platform/apps/storefront/src/components/CartDrawer.tsx`
- Create: `platform/apps/storefront/src/components/OrderSummary.tsx`
- Create: `platform/apps/storefront/src/pages/CartPage.tsx`
- Modify: `platform/apps/storefront/src/components/StorefrontShell.tsx`

- [ ] **Step 1: Create OrderSummary component**

Create `platform/apps/storefront/src/components/OrderSummary.tsx`:

Renders a list of cart items (name, quantity, price, line total) and the cart total. Takes `items` and `total` as props. Each item has +/- buttons for quantity and a remove button. Uses Chakra UI `Table` or `VStack` with `HStack` rows.

This component is reused in CartDrawer, CartPage, and CheckoutPage.

- [ ] **Step 2: Create CartIcon component**

Create `platform/apps/storefront/src/components/CartIcon.tsx`:

A shopping cart icon button with a badge showing `itemCount`. Uses Chakra UI `IconButton` and a badge overlay. Clicking navigates to `/cart` on mobile or opens the CartDrawer on desktop.

```typescript
import { useCart } from '../hooks/useCart';
// Use Chakra UI Box, IconButton, Badge/Circle for the count overlay
```

- [ ] **Step 3: Create CartDrawer component**

Create `platform/apps/storefront/src/components/CartDrawer.tsx`:

A Chakra UI `Drawer` that slides in from the right on desktop. Shows `OrderSummary`, a "Clear cart" button, and a "Checkout" button that navigates to `/checkout`. Takes `isOpen` and `onClose` props.

- [ ] **Step 4: Create CartPage**

Create `platform/apps/storefront/src/pages/CartPage.tsx`:

Full-page cart view for mobile. Shows `OrderSummary` and "Checkout" button. Navigates to `/checkout` on submit. If cart is empty, show empty state with link back to catalog.

- [ ] **Step 5: Add CartIcon to StorefrontShell header**

Modify `platform/apps/storefront/src/components/StorefrontShell.tsx`:

Add `CartIcon` to the header, positioned to the right. On desktop, clicking opens the `CartDrawer`. On mobile, clicking navigates to `/cart`.

Use Chakra UI's `useDisclosure` for drawer state. Use a responsive approach: `useBreakpointValue` or media query to determine mobile vs desktop behavior.

- [ ] **Step 6: Verify storefront builds**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add platform/apps/storefront/src/components/CartIcon.tsx platform/apps/storefront/src/components/CartDrawer.tsx platform/apps/storefront/src/components/OrderSummary.tsx platform/apps/storefront/src/pages/CartPage.tsx platform/apps/storefront/src/components/StorefrontShell.tsx
git commit -m "feat: add cart UI with drawer, mobile cart page, and order summary"
```

---

## Task 12: Login Page + AuthGate

**Files:**
- Create: `platform/apps/storefront/src/components/LoginForm.tsx`
- Create: `platform/apps/storefront/src/pages/LoginPage.tsx`
- Create: `platform/apps/storefront/src/components/AuthGate.tsx`

- [ ] **Step 1: Create LoginForm component**

Create `platform/apps/storefront/src/components/LoginForm.tsx`:

Two tabs: "Sign In" and "Sign Up".

**Sign In tab:** Email + password fields, "Sign In" button, "Sign in with Google" button.

**Sign Up tab:** Email, password, first name, last name fields, "Create Account" button.

Uses `useAuth()` for `signIn`, `signUp`, `signInWithGoogle`. Shows error messages from Firebase auth errors. Responsive: centered card on desktop, full-width on mobile.

- [ ] **Step 2: Create LoginPage**

Create `platform/apps/storefront/src/pages/LoginPage.tsx`:

Renders `LoginForm`. After successful login, navigates to the `returnUrl` search param (default: `/`). If already authenticated, redirect immediately.

```typescript
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';

  useEffect(() => {
    if (isAuthenticated) navigate(returnUrl, { replace: true });
  }, [isAuthenticated, navigate, returnUrl]);

  return (/* LoginForm centered on page */);
}
```

- [ ] **Step 3: Create AuthGate component**

Create `platform/apps/storefront/src/components/AuthGate.tsx`:

Wrapper that checks `isAuthenticated`. If not authenticated, redirects to `/login?returnUrl={currentPath}`. Shows loading spinner while auth is initializing.

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}
```

- [ ] **Step 4: Verify storefront builds**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add platform/apps/storefront/src/components/LoginForm.tsx platform/apps/storefront/src/pages/LoginPage.tsx platform/apps/storefront/src/components/AuthGate.tsx
git commit -m "feat: add login/register page with AuthGate for protected routes"
```

---

## Task 13: Checkout Page

**Files:**
- Create: `platform/apps/storefront/src/components/PaymentMethodSelector.tsx`
- Create: `platform/apps/storefront/src/components/CheckoutForm.tsx`
- Create: `platform/apps/storefront/src/pages/CheckoutPage.tsx`

- [ ] **Step 1: Create PaymentMethodSelector**

Create `platform/apps/storefront/src/components/PaymentMethodSelector.tsx`:

A radio group showing only the payment methods available for the establishment (from `establishment.paymentMethods`). Uses Chakra UI radio components.

Props: `methods: PaymentMethod[]`, `value: string`, `onChange: (method: string) => void`.

Display labels: CARD → "Credit Card", BANCONTACT → "Bancontact", CASH → "Cash".

- [ ] **Step 2: Create CheckoutForm**

Create `platform/apps/storefront/src/components/CheckoutForm.tsx`:

Uses React Hook Form. Sections:

1. **Delivery method:** Radio group (PICKUP / DELIVERY)
2. **Delivery address** (shown only if DELIVERY): street, number, zipCode, city, municipality, comment (optional)
3. **Billing information:** name, email (pre-filled from auth), phone
4. **Payment method:** PaymentMethodSelector

Submit button: "Place Order".

Props: `establishment` (for paymentMethods), `onSubmit: (data: CheckoutFormData) => void`, `isSubmitting: boolean`.

Responsive: single column on mobile, two columns on desktop (OrderSummary on left, form on right).

- [ ] **Step 3: Create CheckoutPage**

Create `platform/apps/storefront/src/pages/CheckoutPage.tsx`:

Wrapped with `AuthGate`. Orchestrates the checkout flow:

1. Renders `OrderSummary` (read-only) + `CheckoutForm`
2. On submit:
   a. Build `CreateOrderBody` from cart items + form data
   b. Call `POST /api/orders` via generated API client
   c. Call `POST /api/payments` with `{ orderId, paymentMethod }`
   d. If CARD/BANCONTACT: redirect to `checkoutUrl` (Mollie) via `window.location.href`
   e. If CASH: navigate to `/order/{orderId}/status`
   f. Clear cart on success

```typescript
import { useCart } from '../hooks/useCart';
import { useEstablishment } from '../hooks/useEstablishment';
import { getOrderApi, getPaymentApi } from '@mercashop/shared/api-client';

// ... in submit handler:
const orderResponse = await getOrderApi().createOrder({
  establishmentId: establishment._id,
  orderLines: items.map((item) => ({
    item: { _id: item._id, name: item.name, quantity: item.quantity, price: item.price },
  })),
  total,
  paymentMethod: formData.paymentMethod,
  deliveryMethod: formData.deliveryMethod,
  deliveryAddress: formData.deliveryAddress,
  billingInformation: formData.billingInformation,
});

const orderId = orderResponse.data._id;

const paymentResponse = await getPaymentApi().processPayment({
  orderId,
  paymentMethod: formData.paymentMethod,
});

if (formData.paymentMethod === 'CARD' || formData.paymentMethod === 'BANCONTACT') {
  clearCart();
  window.location.href = paymentResponse.data.checkoutUrl;
} else {
  clearCart();
  navigate(`/order/${orderId}/status`);
}
```

Adapt to the actual generated API client method signatures.

- [ ] **Step 4: Verify storefront builds**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add platform/apps/storefront/src/components/PaymentMethodSelector.tsx platform/apps/storefront/src/components/CheckoutForm.tsx platform/apps/storefront/src/pages/CheckoutPage.tsx
git commit -m "feat: add checkout page with delivery, billing, and payment method selection"
```

---

## Task 14: Order Status Page (Socket.io)

**Files:**
- Create: `platform/apps/storefront/src/pages/OrderStatusPage.tsx`

- [ ] **Step 1: Create OrderStatusPage**

Create `platform/apps/storefront/src/pages/OrderStatusPage.tsx`:

Wrapped with `AuthGate`. Uses `useParams()` to get `orderId`.

1. Fetches initial order status via `GET /api/payments/{orderId}` (using generated API client)
2. Connects to Socket.io, emits `join-order` with orderId
3. Listens for `order-updated` event, updates local state
4. Displays: order status badge, payment status, order details (items, total, delivery info)
5. Disconnects Socket.io on unmount

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { getPaymentApi } from '@mercashop/shared/api-client';

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  // Initial fetch
  const { data: order } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: () => getPaymentApi().getPaymentStatus(orderId!),
    enabled: !!orderId,
  });

  // Socket.io for real-time updates
  useEffect(() => {
    if (!orderId) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
    });

    socket.emit('join-order', orderId);
    socket.on('order-updated', (data) => {
      setLiveStatus(data.status);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  // Render order status, payment status, details
  // Use liveStatus if available, fall back to order.data
}
```

Adapt API method names to match the actual generated client. The order status should show a visual progress indicator (e.g., steps: Pending → Accepted → Preparing → Ready → Delivered).

- [ ] **Step 2: Verify storefront builds**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add platform/apps/storefront/src/pages/OrderStatusPage.tsx
git commit -m "feat: add order status page with real-time Socket.io updates"
```

---

## Task 15: Profile Page

**Files:**
- Create: `platform/apps/storefront/src/pages/ProfilePage.tsx`

- [ ] **Step 1: Create ProfilePage**

Create `platform/apps/storefront/src/pages/ProfilePage.tsx`:

Wrapped with `AuthGate`. Fetches user profile via `GET /api/users/me`. Displays: name, email, phone. Edit form for name and phone. Logout button.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserApi } from '@mercashop/shared/api-client';
import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getUserApi().getMe(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; phone?: string }) =>
      getUserApi().updateMe(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
  });

  // Render profile card with edit form
  // Responsive: centered card, max-width 500px
}
```

Adapt to actual API client method signatures.

- [ ] **Step 2: Verify storefront builds**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add platform/apps/storefront/src/pages/ProfilePage.tsx
git commit -m "feat: add user profile page with edit and logout"
```

---

## Task 16: Route Wiring + Final Integration

**Files:**
- Modify: `platform/apps/storefront/src/AppRoutes.tsx`

- [ ] **Step 1: Wire all routes**

Update `platform/apps/storefront/src/AppRoutes.tsx`:

```typescript
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderStatusPage } from './pages/OrderStatusPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthGate } from './components/AuthGate';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/checkout" element={<AuthGate><CheckoutPage /></AuthGate>} />
      <Route path="/order/:orderId/status" element={<AuthGate><OrderStatusPage /></AuthGate>} />
      <Route path="/profile" element={<AuthGate><ProfilePage /></AuthGate>} />
    </Routes>
  );
}
```

- [ ] **Step 2: Verify full storefront builds**

Run: `cd platform && pnpm --filter @mercashop/storefront build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Run all storefront tests**

Run: `cd platform && pnpm --filter @mercashop/storefront test -- --run`
Expected: All tests pass.

- [ ] **Step 4: Run full monorepo checks**

Run: `cd platform && pnpm build && pnpm typecheck && pnpm lint && pnpm test`
Expected: All pass. Note any pre-existing failures vs new failures.

- [ ] **Step 5: Commit**

```bash
git add platform/apps/storefront/src/AppRoutes.tsx
git commit -m "feat: wire all storefront routes with auth gates"
```

---

## Task 17: Final Verification

The API client was already regenerated in Task 3 (Steps 8-10) and `getPublicApi()` was added to `clients.ts`. This task is a final end-to-end verification pass.

- [ ] **Step 1: Regenerate API client one final time (catch any controller changes from Tasks 4-5)**

Run: `cd platform && pnpm generate:api-client`
Expected: No significant changes (PublicApi was already generated in Task 3). If payment controller signatures changed in Task 4, the generated PaymentApi will be updated.

- [ ] **Step 2: Rebuild shared package**

Run: `cd platform && pnpm --filter @mercashop/shared build`
Expected: Build succeeds.

- [ ] **Step 3: Run full monorepo verification**

Run: `cd platform && pnpm build && pnpm typecheck && pnpm lint && pnpm test`
Expected: All pass. Note any pre-existing failures vs new failures.

- [ ] **Step 4: Commit (if there are changes)**

```bash
git add platform/packages/shared/src/apis/ platform/apps/api/src/generated/
git commit -m "chore: regenerate API client after all controller changes"
```
