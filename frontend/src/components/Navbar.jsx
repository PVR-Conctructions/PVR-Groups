import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FiSun, FiMoon, FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiHeart, FiGlobe, FiCalendar, FiHome, FiLayers, FiGrid, FiPieChart, FiBox, FiPhone, FiBell, FiMessageSquare } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const { language, switchLanguage, t } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/home', label: t('home'), icon: <FiHome className="w-5 h-5" /> },
        { to: '/projects', label: t('projects'), icon: <FiLayers className="w-5 h-5" /> },
        { to: '/dashboard', label: t('dashboard'), icon: <FiGrid className="w-5 h-5" /> },
        { to: '/emi-calculator', label: t('emiCalculator'), icon: <FiPieChart className="w-5 h-5" /> },
        { to: '/virtual-tour', label: t('virtualTour'), icon: <FiBox className="w-5 h-5" /> },
        { to: '/contact', label: t('contact'), icon: <FiPhone className="w-5 h-5" /> },
        { to: '/announcements', label: t('announcements'), icon: <FiBell className="w-5 h-5" /> },
        { to: '/messages', label: t('messages'), icon: <FiMessageSquare className="w-5 h-5" /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20'
            : 'bg-dark-bg/80 backdrop-blur-md'
            }`}>
            <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 md:h-20">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center space-x-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-400/20">
                            <span className="text-white font-heading font-bold text-base md:text-lg">P</span>
                        </div>
                        <span className={`text-lg md:text-xl font-heading font-bold transition-colors ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'
                            }`}>
                            PVR <span className="text-gold-400">Groups</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(link.to)
                                    ? 'text-gold-400 bg-gold-400/10'
                                    : scrolled
                                        ? 'text-gray-700 dark:text-gray-200 hover:text-gold-400 hover:bg-gold-400/10'
                                        : 'text-white/90 hover:text-gold-400 hover:bg-white/10'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link to="/admin" className="px-4 py-2 rounded-lg text-sm font-semibold text-gold-400 hover:bg-gold-400/10 transition-all duration-200">
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-1 sm:space-x-3">
                        <button onClick={toggleTheme} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border' : 'text-white/80 hover:bg-white/10'
                            }`}>
                            {darkMode ? <FiSun size={18} className="sm:w-5 sm:h-5" /> : <FiMoon size={18} className="sm:w-5 sm:h-5" />}
                        </button>

                        {/* Language toggle */}
                        <button
                            onClick={() => switchLanguage(language === 'en' ? 'te' : 'en')}
                            className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${scrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border' : 'text-white/80 hover:bg-white/10'}`}
                            title={language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
                        >
                            <FiGlobe size={14} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {language === 'en' ? 'TE' : 'EN'}
                        </button>

                        {/* Book Site Visit Button */}
                        <Link 
                            to="/contact" 
                            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold text-sm hover:shadow-[0_0_15px_rgba(212,168,67,0.4)] transition-all ml-2"
                        >
                            <FiCalendar className="w-4 h-4" /> Book Site Visit
                        </Link>

                        {/* Profile dropdown */}
                        <div className="relative">
                            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center ring-2 ring-gold-400/30">
                                    <span className="text-white text-xs sm:text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
                                </div>
                                <span className={`hidden md:block text-sm font-medium transition-colors ${scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90'
                                    }`}>{user?.name?.split(' ')[0]}</span>
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-xl shadow-xl border dark:border-dark-border overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b dark:border-dark-border">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        {isAdmin && (
                                            <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                                                <FiSettings size={16} /> <span>Admin Panel</span>
                                            </Link>
                                        )}
                                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                                            <FiUser size={16} /> <span>{t('dashboard')}</span>
                                        </Link>
                                        <Link to="/payments" onClick={() => setProfileOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                                            <FiHeart size={16} /> <span>{t('paymentHistory')}</span>
                                        </Link>
                                        <Link to="/referrals" onClick={() => setProfileOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                                            <FiHeart size={16} /> <span>{t('referEarn')}</span>
                                        </Link>
                                        <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <FiLogOut size={16} /> <span>{t('logout')}</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile menu button */}
                        <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-1 sm:p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white/80'
                            }`}>
                            {mobileOpen ? <FiX size={20} className="sm:w-6 sm:h-6" /> : <FiMenu size={20} className="sm:w-6 sm:h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/60 z-[90] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 w-72 h-[100dvh] bg-[#0A1220] z-[100] shadow-2xl md:hidden flex flex-col border-r border-gray-800"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-800">
                            <Link to="/home" className="flex items-center space-x-2" onClick={() => setMobileOpen(false)}>
                                <div className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center">
                                    <span className="text-black font-heading font-bold text-base">P</span>
                                </div>
                                <span className="text-lg font-heading font-bold text-white">
                                    PVR <span className="text-gold-400">Groups</span>
                                </span>
                            </Link>
                            <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white p-2">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                            {navLinks.map(link => {
                                const active = isActive(link.to);
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors ${active
                                            ? 'text-gold-400 bg-[#121C2D] border border-gray-800'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className={active ? 'text-gold-400' : 'text-gray-500'}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                );
                            })}
                            
                            {isAdmin && (
                                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-gold-400 hover:bg-white/5 font-medium mt-4">
                                    <FiSettings className="w-5 h-5 text-gold-400" />
                                    Admin Panel
                                </Link>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-800 space-y-2 pb-8">
                            <button onClick={() => { switchLanguage(language === 'en' ? 'te' : 'en'); setMobileOpen(false); }} className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium w-full text-left">
                                <FiGlobe className="w-5 h-5 text-gray-500" />
                                {language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
                            </button>
                            {user && (
                                <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium w-full text-left">
                                    <FiLogOut className="w-5 h-5 text-red-500" />
                                    {t('logout')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
