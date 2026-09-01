import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Dashboard from '../pages/dashboard/Dashboard';
import MerchantList from '../pages/merchants/MerchantList';
import MerchantCreate from '../pages/merchants/MerchantCreate';
import MerchantDetail from '../pages/merchants/MerchantDetail';
import ProductDetail from '../pages/products/ProductDetail';
import GiftCardDetail from '../pages/giftcards/GiftCardDetail';
import MerchantProducts from '../pages/merchants/MerchantProducts';

import UserList from '../pages/users/UserList';
import OrderList from '../pages/orders/OrderList';
import OrderDetail from '../pages/orders/OrderDetail';
import CategoryList from '../pages/categories/CategoryList';
import SubcategoryList from '../pages/categories/SubcategoryList';
import ReportList from '../pages/reports/ReportList';
import ReviewList from '../pages/reviews/ReviewList';
import Settings from '../pages/settings/Settings';
import ProductReviewsList from '../pages/merchants/ProductReviewsList';
import ContactsList from '../pages/contacts/ContactsList';
import KuralList from '../pages/kural/KuralList';
import HealthGoalList from '../pages/goals/HealthGoalList';
import SeasonalBanners from '../pages/banners/SeasonalBanners';
import Login from '../../pages/Login';

// Protect administrative routes from anonymous access
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Prevent authenticated users from accessing login page
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Publicly accessible route */}
            <Route path="login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            {/* Protected administrative routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="merchants" element={<MerchantList />} />
                <Route path="merchants/master" element={<MerchantList type="master" />} />
                <Route path="merchants/reviews" element={<ProductReviewsList />} />
                <Route path="merchants/create" element={<MerchantCreate />} />
                <Route path="merchants/edit/:id" element={<MerchantCreate />} />
                <Route path="merchants/:id" element={<MerchantDetail />} />
                <Route path="merchant-stocks/:id" element={<MerchantProducts />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="giftcards/:id" element={<GiftCardDetail />} />

                <Route path="users" element={<UserList />} />
                <Route path="categories" element={<CategoryList />} />
                <Route path="categories/subcategories" element={<SubcategoryList />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="reports" element={<ReportList />} />
                <Route path="reviews" element={<ReviewList />} />
                <Route path="kural" element={<KuralList />} />
                <Route path="health-goals" element={<HealthGoalList />} />
                <Route path="banners/seasonal" element={<SeasonalBanners />} />
                <Route path="contacts" element={<ContactsList />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;

