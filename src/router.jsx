import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoadingScreen from './components/common/LoadingScreen'
import ProtectedRoute from './components/common/ProtectedRoute'
import GuestRoute from './components/common/GuestRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/admin/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/admin/CartPage'))
const CheckoutPage = lazy(() => import('./pages/admin/CheckoutPage'))
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'))
const AdminProfilePage = lazy(() => import('./pages/admin/ProfilePage'))
const SellerApprovalsPage = lazy(() => import('./pages/admin/SellerApprovalsPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ManageProductsPage = lazy(() => import('./pages/user/ManageProductsPage'))
const SellerOrdersPage = lazy(() => import('./pages/user/SellerOrdersPage'))
const SellerProfilePage = lazy(() => import('./pages/user/SellerProfilePage'))
const ErrorPage = lazy(() => import('./pages/ErrorPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: 'forgot',
        element: (
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        ),
      },
      { path: 'products', element: <AdminProductsPage /> },
      {
        path: 'products/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <ProductDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'user', 'seller']}>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'user', 'seller']}>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'user', 'seller']}>
            <AdminProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/approvals',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <SellerApprovalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'seller/upload',
        element: (
          <ProtectedRoute allowedRoles={['seller']}>
            <ManageProductsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'seller/products',
        element: (
          <ProtectedRoute allowedRoles={['seller']}>
            <ManageProductsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'seller/orders',
        element: (
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'seller/profile',
        element: (
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
])

const AppRouter = () => (
  <Suspense fallback={<LoadingScreen />}>
    <RouterProvider router={router} />
  </Suspense>
)

export default AppRouter
