import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SkylineIntro from '../components/SkylineIntro';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const handleEnter = () => {
        navigate(user ? '/home' : '/login');
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-dark-bg">
            <SkylineIntro />
            {/* Animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-dark-bg to-primary-800" />
                {/* Floating orbs */}
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-20 left-10 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, 60, 0], y: [0, -30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl"
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(212,168,67,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.3) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-2xl shadow-gold-400/20">
                        <span className="text-white font-heading font-bold text-5xl">P</span>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white text-center mb-4"
                >
                    Welcome to{' '}
                    <span className="text-gold-gradient">PVR Groups</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-xl md:text-2xl text-gray-400 text-center mb-12 max-w-2xl font-light"
                >
                    {t('tagline')}
                </motion.p>

                {/* Horizontal line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '120px' }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mb-12"
                />

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEnter}
                    className="px-12 py-4 rounded-2xl btn-shimmer text-white text-lg font-semibold tracking-wide shadow-2xl shadow-gold-400/20"
                >
                    Enter Website
                </motion.button>

                {/* Bottom tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="absolute bottom-8 text-gray-500 text-sm"
                >
                    One of the Largest Construction Companies in Vijayawada
                </motion.p>
            </div>
        </div>
    );
};

export default LandingPage;
