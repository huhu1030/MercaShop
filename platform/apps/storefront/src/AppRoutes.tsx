import { Route, Routes } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { HomePage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderStatusPage } from './pages/OrderStatusPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route
        path="/orders"
        element={
          <AuthGate>
            <OrdersPage />
          </AuthGate>
        }
      />
      <Route
        path="/checkout"
        element={
          <AuthGate>
            <CheckoutPage />
          </AuthGate>
        }
      />
      <Route
        path="/order/:orderId/status"
        element={
          <AuthGate>
            <OrderStatusPage />
          </AuthGate>
        }
      />
      <Route
        path="/order/:orderId/confirmation"
        element={
          <AuthGate>
            <OrderConfirmationPage />
          </AuthGate>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthGate>
            <ProfilePage />
          </AuthGate>
        }
      />
    </Routes>
  );
}
