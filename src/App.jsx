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

// Admin Imports
import MasterDashboard from './master-admin/pages/dashboard/Dashboard';
import MerchantList from './master-admin/pages/merchants/MerchantList';
import MerchantCreate from './master-admin/pages/merchants/MerchantCreate';
import MerchantDetail from './master-admin/pages/merchants/MerchantDetail';
import MasterProductDetail from './master-admin/pages/products/ProductDetail';
import MasterGiftCardDetail from './master-admin/pages/giftcards/GiftCardDetail';
import MerchantProducts from './master-admin/pages/merchants/MerchantProducts';
import UserList from './master-admin/pages/users/UserList';
import OrderList from './master-admin/pages/orders/OrderList';
import OrderDetail from './master-admin/pages/orders/OrderDetail';
import MasterCategoryList from './master-admin/pages/categories/CategoryList';
import MasterSubcategoryList from './master-admin/pages/categories/SubcategoryList';
import ReportList from './master-admin/pages/reports/ReportList';
import ReviewList from './master-admin/pages/reviews/ReviewList';
import Settings from './master-admin/pages/settings/Settings';
import ProductReviewsList from './master-admin/pages/merchants/ProductReviewsList';
import ContactsList from './master-admin/pages/contacts/ContactsList';
import MasterKuralList from './master-admin/pages/kural/KuralList';
import HealthGoalList from './master-admin/pages/goals/HealthGoalList';
import SeasonalBanners from './master-admin/pages/banners/SeasonalBanners';

import MenuList from './master-admin/pages/menus/MenuList';
import MenuCreate from './master-admin/pages/menus/MenuCreate';
import SupplierList from './pages/suppliers/SupplierList';
import SupplierProducts from './pages/suppliers/SupplierProducts';
import SalesList from './pages/sales/SalesList';
import AddSale from './pages/sales/AddSale';
import SaleDetails from './pages/sales/SaleDetails';
import ProductIssues from './pages/Reports';

function App() {
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  return (
    <BusinessProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Wrapped in Layout) */}
          <Route path="/" element={<Layout />}>
            {isAdmin ? (
              <>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<MasterDashboard />} />
                <Route path="merchants" element={<MerchantList />} />
                <Route path="merchants/master" element={<MerchantList type="master" />} />
                <Route path="merchants/reviews" element={<ProductReviewsList />} />
                <Route path="merchants/create" element={<MerchantCreate />} />
                <Route path="merchants/edit/:id" element={<MerchantCreate />} />
                <Route path="merchants/:id" element={<MerchantDetail />} />
                <Route path="merchant-stocks/:id" element={<MerchantProducts />} />
                <Route path="products/:id" element={<MasterProductDetail />} />
                <Route path="giftcards/:id" element={<MasterGiftCardDetail />} />
                <Route path="menus" element={<MenuList />} />
                <Route path="menus/create" element={<MenuCreate />} />
                <Route path="users" element={<UserList />} />
                <Route path="categories" element={<MasterCategoryList />} />
                <Route path="categories/subcategories" element={<MasterSubcategoryList />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="reports" element={<ReportList />} />
                <Route path="product-issues" element={<ProductIssues />} />
                <Route path="reviews" element={<ReviewList />} />
                <Route path="kural" element={<MasterKuralList />} />
                <Route path="health-goals" element={<HealthGoalList />} />
                <Route path="banners/seasonal" element={<SeasonalBanners />} />
                <Route path="contacts" element={<ContactsList />} />
                <Route path="settings" element={<Settings />} />
                <Route path="suppliers" element={<SupplierList />} />
                <Route path="suppliers/products/:id" element={<SupplierProducts />} />
                <Route path="sales" element={<SalesList />} />
                <Route path="sales/add" element={<AddSale />} />
                <Route path="sales/detail/:id" element={<SaleDetails />} />
              </>
            ) : (
              <>
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
                <Route path="suppliers" element={<SupplierList />} />
                <Route path="suppliers/products/:id" element={<SupplierProducts />} />
                <Route path="sales" element={<SalesList />} />
                <Route path="sales/add" element={<AddSale />} />
                <Route path="sales/detail/:id" element={<SaleDetails />} />
              </>
            )}
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
