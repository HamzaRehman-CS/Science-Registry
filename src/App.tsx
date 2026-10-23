import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ApplicationForm from './pages/ApplicationForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import FunActivityPortal from './pages/FunActivityPortal';
import { useState } from 'react';
import { hasAdminSession } from './lib/applications';

function AdminRoute() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => hasAdminSession());

  return isAdmin ? (
    <AdminDashboard />
  ) : (
    <AdminLogin onSuccess={() => setIsAdmin(true)} />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Data Science Community Registration Portal */}
        <Route path="/" element={<ApplicationForm />} />

        {/* Administrative Recruitment Portal */}
        <Route path="/admin" element={<AdminRoute />} />

        {/* Legacy Fun Vault */}
        <Route path="/fun" element={<FunActivityPortal />} />
        <Route path="/roast" element={<FunActivityPortal />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
