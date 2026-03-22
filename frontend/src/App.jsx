import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import EMICalculatorPage from './pages/EMICalculatorPage';
import ContactPage from './pages/ContactPage';
import VirtualTourPage from './pages/VirtualTourPage';
import UserAnnouncements from './pages/UserAnnouncements';
import UserMessages from './pages/UserMessages';
import UserDashboard from './pages/UserDashboard';
import PaymentHistory from './pages/PaymentHistory';
import ReferralPage from './pages/ReferralPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminMessages from './pages/admin/AdminMessages';
import AdminPayments from './pages/admin/AdminPayments';
import AdminEmailCampaign from './pages/admin/AdminEmailCampaign';
import AdminBookings from './pages/admin/AdminBookings';
import AdminContacts from './pages/admin/AdminContacts';
import AdminSettings from './pages/admin/AdminSettings';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import WhatsAppButton from './components/WhatsAppButton';
import ChatWidget from './components/ChatWidget';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gold-400 font-heading text-xl">PVR Groups</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300 w-full max-w-[100vw] overflow-x-hidden relative">
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
                <Route path="/register" element={user ? <Navigate to="/home" /> : <RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Protected user routes */}
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
                <Route path="/emi-calculator" element={<ProtectedRoute><EMICalculatorPage /></ProtectedRoute>} />
                <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
                <Route path="/virtual-tour" element={<ProtectedRoute><VirtualTourPage /></ProtectedRoute>} />
                <Route path="/announcements" element={<ProtectedRoute><UserAnnouncements /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><UserMessages /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="announcements" element={<AdminAnnouncements />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="contacts" element={<AdminContacts />} />
                    <Route path="email-campaign" element={<AdminEmailCampaign />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {/* Global floating widgets */}
            {user && <WhatsAppButton />}
            {user && <ChatWidget />}
        </div>
    );
}

export default App;
