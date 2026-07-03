import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';
import useAuthStore from './store/authStore';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminPayments from './pages/admin/AdminPayments';

import { FiGrid, FiPackage, FiShoppingCart, FiTruck, FiDollarSign, FiArrowLeft } from 'react-icons/fi';

function ProtectedRoute() {
  const { token } = useAuthStore();
  return token ? <Outlet /> : <Navigate to="/login" />;
}

function AdminRoute() {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin' && user?.role !== 'superadmin') return <Navigate to="/" />;
  return <Outlet />;
}

function AdminLayout() {
  const location = useLocation();
  const links = [
    { to: '/admin', icon: FiGrid, label: 'Dashboard', exact: true },
    { to: '/admin/products', icon: FiPackage, label: 'Produits' },
    { to: '/admin/orders', icon: FiShoppingCart, label: 'Commandes' },
    { to: '/admin/drivers', icon: FiTruck, label: 'Livreurs' },
    { to: '/admin/payments', icon: FiDollarSign, label: 'Paiements' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 pt-20">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/" className="text-gray-400 hover:text-gray-600"><FiArrowLeft size={18} /></Link>
        <h1 className="font-heading text-xl md:text-2xl font-bold">Administration</h1>
      </div>

      {/* Mobile: horizontal scrollable tabs */}
      <div className="md:hidden mb-4 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {links.map(({ to, icon: Icon, label, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${active ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Icon size={14} /> {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop: vertical sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="bg-gray-900 rounded-xl p-3 space-y-1 sticky top-20">
            {links.map(({ to, icon: Icon, label, exact }) => {
              const active = exact ? location.pathname === to : location.pathname.startsWith(to);
              return (
                <Link key={to} to={to} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition ${active ? 'bg-emerald-500 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  <Icon size={16} /> {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}

function MainLayout() {
  return (
    <>
      <Header />
      <main className="pt-16 pb-16 md:pb-0 min-h-screen"><Outlet /></main>
      <Footer />
      <MobileNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="tracking/:id" element={<Tracking />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<><Header /><AdminLayout /></>}>
            <Route path="admin" element={<Dashboard />} />
            <Route path="admin/products" element={<AdminProducts />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route path="admin/drivers" element={<AdminDrivers />} />
            <Route path="admin/payments" element={<AdminPayments />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
