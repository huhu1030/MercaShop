import { Routes, Route } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { HomePage } from './pages/HomePage'
import { CheckoutPage } from './pages/CheckoutPage'
import { CartPage } from './pages/CartPage'
import { OrderStatusPage } from './pages/OrderStatusPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProfilePage } from './pages/ProfilePage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<AuthGate><OrdersPage /></AuthGate>} />
      <Route path="/checkout" element={<AuthGate><CheckoutPage /></AuthGate>} />
      <Route path="/order/:orderId/status" element={<AuthGate><OrderStatusPage /></AuthGate>} />
      <Route path="/profile" element={<AuthGate><ProfilePage /></AuthGate>} />
    </Routes>
  )
}
