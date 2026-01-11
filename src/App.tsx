import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SETTINGS } from './config/settings';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import CategoryList from './pages/Categories/CategoryList';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import CustomerList from './pages/Customers/CustomerList';
import BannerList from './pages/Banners/BannerList';
import ReviewList from './pages/Reviews/ReviewList';
import LegalTextList from './pages/LegalTexts/LegalTextList';
import AdminUserList from './pages/AdminUsers/AdminUsers';
import './index.css';

function App() {
  useEffect(() => {
    document.title = SETTINGS.SITE_NAME;
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />

            {/* Products */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductForm />} />

            {/* Categories */}
            <Route path="/categories" element={<CategoryList />} />

            {/* Orders */}
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />

            {/* Customers */}
            <Route path="/customers" element={<CustomerList />} />

            {/* Banners */}
            <Route path="/banners" element={<BannerList />} />

            {/* Reviews */}
            <Route path="/reviews" element={<ReviewList />} />

            {/* Legal Texts */}
            <Route path="/legal-texts" element={<LegalTextList />} />

            {/* Admin Users */}
            <Route path="/admin-users" element={<AdminUserList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
