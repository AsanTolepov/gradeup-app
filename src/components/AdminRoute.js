import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { currentUser, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Yuklanmoqda...</div>; // Yoki Spinner komponenti
    }

    // Agar foydalanuvchi admin bo'lsa, ichki sahifalarni ko'rsat, aks holda Bosh sahifaga yo'naltir
    return currentUser && isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;