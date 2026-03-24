import { Routes, Route } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { CartPage } from './pages/CartPage'
import { OrderStatusPage } from './pages/OrderStatusPage'
import { ProfilePage } from './pages/ProfilePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<AuthGate><CheckoutPage /></AuthGate>} />
      <Route path="/order/:orderId/status" element={<AuthGate><OrderStatusPage /></AuthGate>} />
      <Route path="/profile" element={<AuthGate><ProfilePage /></AuthGate>} />
    </Routes>
  )
}
