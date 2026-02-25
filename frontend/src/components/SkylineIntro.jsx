import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SkylineIntro = ({ onComplete }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const seen = sessionStorage.getItem('pvr_intro_seen');
        if (seen) { setShow(false); onComplete?.(); return; }
        const timer = setTimeout(() => {
            setShow(false);
            sessionStorage.setItem('pvr_intro_seen', 'true');
            onComplete?.();
        }, 4500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #050d1a 0%, #0a1628 40%, #1a2a4a 100%)' }}
                    onClick={() => { setShow(false); sessionStorage.setItem('pvr_intro_seen', 'true'); onComplete?.(); }}
                >
                    {/* Stars background */}
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%` }}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                        />
                    ))}

                    {/* Skyline silhouette */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 320" className="w-full" style={{ filter: 'drop-shadow(0 0 20px rgba(196,164,75,0.2))' }}>
                            <defs>
                                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1a2a4a" />
                                    <stop offset="100%" stopColor="#0a1628" />
                                </linearGradient>
                            </defs>
                            <motion.path
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.5, delay: 0.3 }}
                                d="M0,320 L0,240 L60,240 L60,180 L80,180 L80,200 L120,200 L120,140 L140,140 L140,120 L160,120 L160,140 L200,140 L200,200 L240,200 L240,160 L280,160 L280,100 L300,100 L300,80 L320,80 L320,100 L360,100 L360,160 L400,160 L400,200 L440,200 L440,180 L480,180 L480,120 L500,120 L500,60 L520,60 L520,80 L560,80 L560,120 L600,120 L600,160 L640,160 L640,200 L680,200 L680,140 L720,140 L720,100 L740,100 L740,40 L760,40 L760,60 L800,60 L800,100 L840,100 L840,140 L880,140 L880,180 L920,180 L920,160 L960,160 L960,120 L1000,120 L1000,80 L1020,80 L1020,60 L1040,60 L1040,80 L1080,80 L1080,120 L1120,120 L1120,180 L1160,180 L1160,200 L1200,200 L1200,140 L1240,140 L1240,100 L1280,100 L1280,160 L1320,160 L1320,200 L1360,200 L1360,220 L1400,220 L1400,240 L1440,240 L1440,320 Z"
                                fill="url(#skyGrad)"
                            />
                            {/* Building windows - glowing dots */}
                            {[
                                [140, 130], [300, 90], [500, 70], [520, 75], [740, 50], [760, 55],
                                [1020, 70], [1040, 75], [120, 150], [280, 110], [480, 130],
                                [680, 150], [880, 150], [1120, 190], [1240, 110], [360, 110],
                            ].map(([x, y], i) => (
                                <motion.rect
                                    key={i}
                                    x={x} y={y}
                                    width="6" height="8"
                                    fill="#C4A44B"
                                    rx="1"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                                />
                            ))}
                        </svg>
                    </div>

                    {/* Gold shimmer text */}
                    <div className="text-center z-10 px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-2xl shadow-gold-400/30">
                                <span className="text-white font-heading font-bold text-3xl">P</span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="text-4xl md:text-6xl font-heading font-bold mb-4"
                            style={{
                                background: 'linear-gradient(135deg, #C4A44B 0%, #f0dca0 30%, #C4A44B 60%, #f0dca0 100%)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                animation: 'shimmer 3s linear infinite',
                            }}
                        >
                            Welcome to PVR Groups
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1.5 }}
                            className="text-white/60 text-lg md:text-xl font-light tracking-wide"
                        >
                            Building Luxury Living in Vijayawada
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 2.5 }}
                            className="mt-8"
                        >
                            <span className="text-white/30 text-xs tracking-widest uppercase animate-pulse">Tap to enter</span>
                        </motion.div>
                    </div>

                    <style>{`
                        @keyframes shimmer {
                            0% { background-position: 0% center; }
                            100% { background-position: 200% center; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SkylineIntro;
