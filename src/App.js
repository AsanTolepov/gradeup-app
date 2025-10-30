import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Komponentlar
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminRoute from './components/AdminRoute';

// Sahifalar
import DashboardPage from './components/pages/DashboardPage';
import TimetablePage from './components/pages/TimetablePage';
import ProfilePage from './components/pages/ProfilePage'; // <--- YANGI PROFIL SAHIFASI IMPORTI
import AdminPage from './components/pages/AdminPage'; // E'lon qo'shish sahifasi
import EditTimetablePage from './components/pages/EditTimetablePage'; // Tahrirlash sahifasi

import './App.css';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Yuklanmoqda...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {currentUser ? (
          <Route path="/" element={<MainLayout />}>
            {/* Umumiy sahifalar */}
            <Route index element={<DashboardPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="profile" element={<ProfilePage />} /> {/* <--- YANGI PROFIL SAHIFASI UCHUN MARSHRUT */}
            
            {/* ADMIN UCHUN MARSHRUTLAR */}
            <Route path="admin" element={<AdminRoute />}>
              <Route index element={<AdminPage />} />
              <Route path="edit-timetable" element={<EditTimetablePage />} />
            </Route>

            {/* Agar mavjud bo'lmagan sahifaga kirilsa, asosiy sahifaga yo'naltirish */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;