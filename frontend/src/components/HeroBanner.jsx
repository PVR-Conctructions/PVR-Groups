import React from 'react';
import { motion } from 'framer-motion';

const HeroBanner = ({ title, subtitle, backgroundImage, children, overlay = true }) => {
    return (
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                {backgroundImage ? (
                    <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-800 via-primary-900 to-dark-bg" />
                )}
                {overlay && <div className="absolute inset-0 hero-gradient" />}
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-20 right-20 w-4 h-4 bg-gold-400/30 rounded-full"
                />
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-40 left-20 w-6 h-6 bg-gold-400/20 rounded-full"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight"
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
                    >
                        {subtitle}
                    </motion.p>
                )}
                {children && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default HeroBanner;
