import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';

const WelcomePopup = ({ show, onClose, userName }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-dark-card rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border dark:border-dark-border"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-6"
                        >
                            <FiCheck size={36} className="text-white" />
                        </motion.div>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                            Welcome to PVR Groups
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Hello, <span className="text-gold-400 font-semibold">{userName}</span>!
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Your account has been created successfully. Explore our premium projects and luxury living spaces.
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl btn-shimmer text-white font-semibold"
                        >
                            Start Exploring
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WelcomePopup;
