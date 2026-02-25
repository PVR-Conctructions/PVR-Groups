import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX } from 'react-icons/fi';

const AnnouncementPopup = ({ announcement, onClose }) => {
    const [particles, setParticles] = useState([]);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!announcement) return;

        // Create confetti particles
        const colors = ['#D4A843', '#FFD700', '#FFA500', '#FF6347', '#40E0D0', '#FF69B4', '#7B68EE', '#00FF7F', '#FF4500', '#1E90FF'];
        const newParticles = Array.from({ length: 80 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            size: 4 + Math.random() * 8,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            speedX: (Math.random() - 0.5) * 4,
            speedY: 2 + Math.random() * 4,
            delay: Math.random() * 1,
            shape: Math.random() > 0.5 ? 'circle' : 'rect',
        }));
        setParticles(newParticles);
    }, [announcement]);

    if (!announcement) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Confetti / Crackers */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ x: `${p.x}vw`, y: '-5vh', rotate: 0, opacity: 1 }}
                            animate={{
                                y: '110vh',
                                x: `${p.x + p.speedX * 15}vw`,
                                rotate: p.rotation + 720,
                                opacity: [1, 1, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: p.delay,
                                ease: 'easeIn',
                            }}
                            style={{
                                position: 'absolute',
                                width: p.size,
                                height: p.shape === 'rect' ? p.size * 2 : p.size,
                                backgroundColor: p.color,
                                borderRadius: p.shape === 'circle' ? '50%' : '2px',
                            }}
                        />
                    ))}
                </div>

                {/* Popup */}
                <motion.div
                    initial={{ scale: 0.3, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="relative bg-white dark:bg-dark-card rounded-3xl p-8 max-w-md mx-4 shadow-2xl border border-gold-400/30 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold-400/20 blur-3xl rounded-full" />

                    {/* Close */}
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-gray-400">
                        <FiX size={20} />
                    </button>

                    <div className="relative text-center">
                        {/* Bell icon with pulse */}
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 0.6, repeat: 3 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gold-400/30"
                        >
                            <FiBell size={32} className="text-white" />
                        </motion.div>

                        {/* Celebration text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl mb-2"
                        >
                            🎉 🎊 🎆
                        </motion.p>

                        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                            New Announcement!
                        </h2>

                        <div className="bg-gold-400/10 rounded-2xl p-5 mb-6">
                            <h3 className="text-lg font-bold text-gold-400 mb-2">{announcement.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{announcement.content}</p>
                            <p className="text-xs text-gray-400 mt-3">
                                {new Date(announcement.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl btn-shimmer text-white font-semibold"
                        >
                            Got it! 🎉
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AnnouncementPopup;
