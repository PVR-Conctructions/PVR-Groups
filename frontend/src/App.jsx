import React, { Suspense, lazy, memo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ── Always-eager imports (tiny, needed on first paint) ───────────────────────
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// ── Lazy-loaded user pages (loaded only when navigated to) ───────────────────
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const HomePage           = lazy(() => import('./pages/HomePage'));
const ProjectsPage       = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage  = lazy(() => import('./pages/ProjectDetailPage'));
const EMICalculatorPage  = lazy(() => import('./pages/EMICalculatorPage'));
const ContactPage        = lazy(() => import('./pages/ContactPage'));
const VirtualTourPage    = lazy(() => import('./pages/VirtualTourPage'));
const UserAnnouncements  = lazy(() => import('./pages/UserAnnouncements'));
const UserMessages       = lazy(() => import('./pages/UserMessages'));
const UserDashboard      = lazy(() => import('./pages/UserDashboard'));
const PaymentHistory     = lazy(() => import('./pages/PaymentHistory'));
const ReferralPage       = lazy(() => import('./pages/ReferralPage'));

// ── Admin pages — largest chunk, only admins ever see these ─────────────────
const AdminLayout        = lazy(() => import('./components/AdminLayout'));
const AdminDashboard     = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProjects      = lazy(() => import('./pages/admin/AdminProjects'));
const AdminUsers         = lazy(() => import('./pages/admin/AdminUsers'));
const AdminFeedback      = lazy(() => import('./pages/admin/AdminFeedback'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminMessages      = lazy(() => import('./pages/admin/AdminMessages'));
const AdminPayments      = lazy(() => import('./pages/admin/AdminPayments'));
const AdminEmailCampaign = lazy(() => import('./pages/admin/AdminEmailCampaign'));
const AdminBookings      = lazy(() => import('./pages/admin/AdminBookings'));
const AdminContacts      = lazy(() => import('./pages/admin/AdminContacts'));
const AdminSettings      = lazy(() => import('./pages/admin/AdminSettings'));

// ── Floating widgets — loaded lazily so they don't block first paint ─────────
const WhatsAppButton     = lazy(() => import('./components/WhatsAppButton'));
const ChatWidget         = lazy(() => import('./components/ChatWidget'));

// ── Shared loading skeleton ────────────────────────────────────────────────────
const PageLoader = () => (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gold-400/70 text-sm font-medium tracking-wide">Loading…</p>
        </div>
    </div>
);

// ── Memoised app shell (prevents unnecessary re-renders from context updates) ─
const AppRoutes = memo(function AppRoutes({ user }) {
    return (
        <>
            <Routes>
                {/* Public — always available, no lazy needed */}
                <Route path="/"              element={<LandingPage />} />
                <Route path="/login"         element={user ? <Navigate to="/home" /> : <LoginPage />} />
                <Route path="/register"      element={user ? <Navigate to="/home" /> : <RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Protected user routes */}
                <Route path="/home"         element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/projects"     element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
                <Route path="/emi-calculator" element={<ProtectedRoute><EMICalculatorPage /></ProtectedRoute>} />
                <Route path="/contact"      element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
                <Route path="/virtual-tour" element={<ProtectedRoute><VirtualTourPage /></ProtectedRoute>} />
                <Route path="/announcements" element={<ProtectedRoute><UserAnnouncements /></ProtectedRoute>} />
                <Route path="/messages"     element={<ProtectedRoute><UserMessages /></ProtectedRoute>} />
                <Route path="/dashboard"    element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/payments"     element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
                <Route path="/referrals"    element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />

                {/* Admin routes — loaded only when user navigates to /admin */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                    <Route index          element={<AdminDashboard />} />
                    <Route path="projects"      element={<AdminProjects />} />
                    <Route path="users"         element={<AdminUsers />} />
                    <Route path="payments"      element={<AdminPayments />} />
                    <Route path="feedback"      element={<AdminFeedback />} />
                    <Route path="announcements" element={<AdminAnnouncements />} />
                    <Route path="messages"      element={<AdminMessages />} />
                    <Route path="contacts"      element={<AdminContacts />} />
                    <Route path="email-campaign" element={<AdminEmailCampaign />} />
                    <Route path="bookings"      element={<AdminBookings />} />
                    <Route path="settings"      element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {/* Floating widgets — render lazily after routes */}
            {user && (
                <Suspense fallback={null}>
                    <WhatsAppButton />
                    <ChatWidget />
                </Suspense>
            )}
        </>
    );
});

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gold-400 font-heading text-xl">PVR Groups</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300 w-full max-w-[100vw] overflow-x-hidden relative">
            <ScrollToTop />
            {/* Single Suspense boundary wraps all lazy routes */}
            <Suspense fallback={<PageLoader />}>
                <AppRoutes user={user} />
            </Suspense>
        </div>
    );
}

export default App;
