import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingButtons } from './components/FloatingButtons';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { CategoryList } from './pages/CategoryList';
import { CategoryDetail } from './pages/CategoryDetail';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { MyOrders } from './pages/MyOrders';
import { ContactUs } from './pages/ContactUs';
import { Collection } from './pages/Collection';
import { DiscoverPage } from './pages/DiscoverPage';
import { OffersPage } from './pages/OffersPage';
import { PolicyPage } from './pages/PolicyPage';

// Account Pages
import { AccountLayout } from './components/AccountLayout';
import { ProfileDashboard } from './pages/account/ProfileDashboard';
import { AccountMyOrders } from './pages/account/AccountMyOrders';
import { OrderDetails } from './pages/account/OrderDetails';
import { OrderHistory } from './pages/account/OrderHistory';
import { TrackOrder } from './pages/account/TrackOrder';
import { AccountWishlist } from './pages/account/AccountWishlist';
import { SavedAddresses } from './pages/account/SavedAddresses';
import { PaymentMethods } from './pages/account/PaymentMethods';
import { ProfileSettings } from './pages/account/ProfileSettings';

import { ShopProvider } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  return (
    <AuthProvider>
    <ShopProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category" element={<CategoryList />} />
            <Route path="/category/:categoryName" element={<CategoryDetail />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/collection/:slug" element={<Collection />} />
            <Route path="/discover/:slug" element={<DiscoverPage />} />
            <Route path="/offers/:slug" element={<OffersPage />} />
            <Route path="/policy/:slug" element={<PolicyPage />} />

            {/* Account Dashboard with Sidebar */}
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<ProfileDashboard />} />
              <Route path="orders" element={<AccountMyOrders />} />
              <Route path="orders/:orderId" element={<OrderDetails />} />
              <Route path="order-history" element={<OrderHistory />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="track-order/:orderId" element={<TrackOrder />} />
              <Route path="wishlist" element={<AccountWishlist />} />
              <Route path="addresses" element={<SavedAddresses />} />
              <Route path="payment-methods" element={<PaymentMethods />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>
          </Routes>
        </div>
        <Footer />
        <FloatingButtons />
        <Toaster position="top-right" duration={3000} closeButton />
      </div>
    </BrowserRouter>
    </ShopProvider>
    </AuthProvider>
  );
}
