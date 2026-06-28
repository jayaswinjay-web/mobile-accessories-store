import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User
import Home from './pages/user/Home';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';

// Seller
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import SellerOrders from './pages/seller/Orders';
import AddProduct from './pages/seller/AddProduct';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSellers from './pages/admin/Sellers';
import AdminDeliveries from './pages/admin/Deliveries';

// Delivery
import DeliveryDashboard from './pages/delivery/Dashboard';
import DeliveryTasks from './pages/delivery/Tasks';

export default function App() {
  return (
    <BrowserRouter basename="/mobile-accessories-store">
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public */}
              <Route index element={<Home />} />
              <Route path="product/:id" element={<ProductDetail />} />

              {/* Auth */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* User */}
              <Route path="cart" element={
                <ProtectedRoute allowedRoles={['user']}><Cart /></ProtectedRoute>
              } />
              <Route path="checkout" element={
                <ProtectedRoute allowedRoles={['user']}><Checkout /></ProtectedRoute>
              } />
              <Route path="orders" element={
                <ProtectedRoute allowedRoles={['user']}><Orders /></ProtectedRoute>
              } />

              {/* Seller */}
              <Route path="seller" element={
                <ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>
              } />
              <Route path="seller/products" element={
                <ProtectedRoute allowedRoles={['seller']}><SellerProducts /></ProtectedRoute>
              } />
              <Route path="seller/manage-orders" element={
                <ProtectedRoute allowedRoles={['seller']}><SellerOrders /></ProtectedRoute>
              } />
              <Route path="seller/add-product" element={
                <ProtectedRoute allowedRoles={['seller']}><AddProduct /></ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute allowedRoles={['super_admin']}><AdminUsers /></ProtectedRoute>
              } />
              <Route path="admin/sellers" element={
                <ProtectedRoute allowedRoles={['super_admin']}><AdminSellers /></ProtectedRoute>
              } />
              <Route path="admin/deliveries" element={
                <ProtectedRoute allowedRoles={['super_admin']}><AdminDeliveries /></ProtectedRoute>
              } />

              {/* Delivery */}
              <Route path="delivery" element={
                <ProtectedRoute allowedRoles={['delivery_person']}><DeliveryDashboard /></ProtectedRoute>
              } />
              <Route path="delivery/tasks" element={
                <ProtectedRoute allowedRoles={['delivery_person']}><DeliveryTasks /></ProtectedRoute>
              } />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
