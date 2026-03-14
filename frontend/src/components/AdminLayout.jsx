import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiGrid, FiFolder, FiUsers, FiMessageSquare, FiBell, FiLogOut, FiArrowLeft, FiSun, FiMoon, FiMail, FiDollarSign, FiMenu, FiX, FiPhoneCall } from 'react-icons/fi';

const AdminLayout = () => {
    const { logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const links = [
        { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
        { to: '/admin/projects', icon: FiFolder, label: 'Projects' },
        { to: '/admin/users', icon: FiUsers, label: 'Users' },
        { to: '/admin/payments', icon: FiDollarSign, label: 'Payments' },
        { to: '/admin/bookings', icon: FiGrid, label: 'Bookings' },
        { to: '/admin/feedback', icon: FiMessageSquare, label: 'Feedback' },
        { to: '/admin/announcements', icon: FiBell, label: 'Announcements' },
        { to: '/admin/messages', icon: FiMail, label: 'Messages' },
        { to: '/admin/contacts', icon: FiPhoneCall, label: 'Contacts' },
        { to: '/admin/email-campaign', icon: FiMail, label: 'Email Campaigns' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1a2a4a] z-30 flex items-center justify-between px-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                        <span className="text-white font-heading font-bold">P</span>
                    </div>
                    <span className="text-white font-heading font-bold text-lg">Admin</span>
                </div>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white/80">
                    {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 admin-sidebar flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto bg-[#1a2a4a]`}>
                <div className="p-6">
                    <div className="flex items-center space-x-2 mb-8 hidden md:flex">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                            <span className="text-white font-heading font-bold text-lg">P</span>
                        </div>
                        <div>
                            <span className="text-white font-heading font-bold">PVR Groups</span>
                            <p className="text-gold-400 text-xs">Admin Panel</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gold-400/20 text-gold-400'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <link.icon size={18} />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 space-y-2">
                    <button onClick={toggleTheme} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button onClick={() => navigate('/home')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        <FiArrowLeft size={18} />
                        <span>Back to Site</span>
                    </button>
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <FiLogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 md:ml-64 pt-20 md:pt-8 p-4 md:p-8 w-full max-w-full overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
