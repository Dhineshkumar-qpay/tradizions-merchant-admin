import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import ListProducts from './pages/ListProducts';
import ListCategories from './pages/ListCategories';
import AddCategory from './pages/AddCategory';
import ListGiftCards from './pages/ListGiftCards';
import AddGiftCard from './pages/AddGiftCard';
import EditGiftCard from './pages/EditGiftCard';
import GiftCardDetail from './pages/GiftCardDetail';
import ManageGiftCards from './pages/ManageGiftCards';
import BusinessList from './pages/business/BusinessList';
import BusinessDetails from './pages/business/BusinessDetails';
import BusinessForm from './pages/business/BusinessForm';
import Orders from './pages/Orders';
import MonthlyOrders from './pages/MonthlyOrders';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import WebsiteReviews from './pages/WebsiteReviews';
import Subcategories from './pages/Subcategories';
import { BusinessProvider } from './store/business/BusinessContext';
import TradizionsUsers from './pages/TradizionsUsers';
import TradizionsContacts from './pages/TradizionsContacts';
import TradizionsGoals from './pages/TradizionsGoals';
import TradizionsBanners from './pages/TradizionsBanners';
import TradizionsKural from './pages/TradizionsKural';
import Coupons from './pages/Coupons';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BusinessProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Wrapped in Layout) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="monthly-orders" element={<MonthlyOrders />} />
            <Route path="business" element={<BusinessList />} />
            <Route path="business/:id" element={<BusinessDetails />} />
            <Route path="business/add" element={<BusinessForm />} />
            <Route path="business/edit/:id" element={<BusinessForm />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="transactions/:id" element={<TransactionDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="website-reviews" element={<WebsiteReviews />} />
            <Route path="categories/list" element={<ListCategories />} />
            <Route path="categories/add" element={<AddCategory />} />
            <Route path="subcategories" element={<Subcategories />} />
            <Route path="gift-products/list" element={<ListGiftCards />} />
            <Route path="gift-products/add" element={<AddGiftCard />} />
            <Route path="giftcard/add" element={<ManageGiftCards />} />
            <Route path="gift-products/detail/:id" element={<GiftCardDetail />} />
            <Route path="gift-products/edit/:id" element={<EditGiftCard />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="products/detail/:id" element={<ProductDetail />} />
            <Route path="products/list" element={<ListProducts />} />
            <Route path="products/reviews" element={<Reviews />} />
            <Route path="users" element={<TradizionsUsers />} />
            <Route path="contacts" element={<TradizionsContacts />} />
            <Route path="goals" element={<TradizionsGoals />} />
            <Route path="banners" element={<TradizionsBanners />} />
            <Route path="kural" element={<TradizionsKural />} />
            <Route path="coupons" element={<Coupons />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
        bodyStyle={{
          padding: "4px 0",
        }}
      />
    </BusinessProvider>
  );
}

export default App;
