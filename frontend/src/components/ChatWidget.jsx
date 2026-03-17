import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const WHATSAPP_NUMBER = '919876543210'; // Replace with real number
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20PVR%20Groups!%20I'm%20interested%20in%20your%20projects.`;

let socket = null;

const ChatWidget = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: "Hello! 👋 Welcome to PVR Groups. Ask me about projects, pricing, site visits, or anything else!", time: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [lastChecked, setLastChecked] = useState(new Date());
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Connect Socket.io and poll for admin replies when logged in
    useEffect(() => {
        if (!user) return;

        // Socket.io connection
        if (!socket) {
            const socketUrl = import.meta.env.PROD
                ? 'https://pvr-groups-1.onrender.com'
                : 'http://localhost:5001';
            socket = io(socketUrl, { transports: ['websocket'] });
        }
        socket.emit('register', user._id);

        // Listen for real-time admin replies
        socket.on('new_reply', (msg) => {
            setMessages(prev => [...prev, {
                from: 'admin',
                text: msg.content || msg,
                time: new Date(),
                isReal: true,
            }]);
        });

        // Poll every 10s for admin replies (fallback)
        pollRef.current = setInterval(async () => {
            try {
                const res = await api.get(`/chat/replies?since=${lastChecked.toISOString()}`);
                if (res.data.length > 0) {
                    setLastChecked(new Date());
                    res.data.forEach(msg => {
                        setMessages(prev => {
                            const alreadyExists = prev.some(m => m._id === msg._id);
                            if (alreadyExists) return prev;
                            return [...prev, {
                                from: 'admin',
                                text: msg.content,
                                time: new Date(msg.createdAt),
                                isReal: true,
                                _id: msg._id,
                            }];
                        });
                    });
                }
            } catch { }
        }, 10000);

        return () => {
            socket?.off('new_reply');
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [user]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { from: 'user', text: userMsg, time: new Date() }]);
        setInput('');
        setTyping(true);

        setTimeout(async () => {
            try {
                if (user) {
                    // Authenticated — send to backend (AI reply + DB save + admin alert)
                    const res = await api.post('/chat/send', { content: userMsg });
                    setTyping(false);
                    setMessages(prev => [...prev, {
                        from: 'bot',
                        text: res.data.autoReply,
                        time: new Date(),
                        isReal: res.data.hasRealReply,
                    }]);
                    if (res.data.hasRealReply) {
                        // Message saved, admin notified — show WhatsApp option after a moment
                        setTimeout(() => {
                            setMessages(prev => [...prev, { from: 'bot', text: '__whatsapp__', time: new Date() }]);
                        }, 1000);
                    }
                } else {
                    // Guest — use client-side auto-replies only
                    const reply = getGuestReply(userMsg);
                    setTyping(false);
                    setMessages(prev => [...prev, { from: 'bot', text: reply, time: new Date() }]);
                }
            } catch {
                setTyping(false);
                setMessages(prev => [...prev, {
                    from: 'bot',
                    text: 'Sorry, something went wrong. Please try WhatsApp for immediate help.',
                    time: new Date(),
                }]);
            }
        }, 900);
    };

    const getGuestReply = (msg) => {
        const m = msg.toLowerCase();
        if (m.match(/project|property|flat|apartment/)) return 'We have premium projects in Vijayawada! Sign in to explore and get personalized recommendations.';
        if (m.match(/price|cost|how much|budget/)) return 'Pricing starts from affordable to luxury. Sign in for detailed pricing on specific projects!';
        if (m.match(/visit|tour|site|book/)) return 'Book a site visit from any project page after signing in. Call us at +91 98765 43210 to schedule immediately!';
        if (m.match(/hi|hello|hey|good/)) return 'Hello! 👋 I can help you find your dream property. Sign in for personalized assistance or ask me anything!';
        return 'For detailed information, please sign in or contact us at +91 98765 43210. We\'d love to help you find the perfect property!';
    };

    const formatTime = (t) => {
        if (!t) return '';
        return new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border dark:border-dark-border z-50 overflow-hidden flex flex-col"
                        style={{ maxHeight: '520px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-900 to-primary-800 p-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold">P</span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-900"></div>
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">PVR Groups</p>
                                    <p className="text-green-300 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                                        {user ? 'Online — Smart Assistant' : 'Online — Guest Mode'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                    title="Chat on WhatsApp"
                                >
                                    <FaWhatsapp size={18} />
                                </a>
                                <button onClick={() => setOpen(false)} className="p-1.5 text-white/60 hover:text-white transition-colors">
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '280px', maxHeight: '340px' }}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.text === '__whatsapp__' ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            <p className="text-xs text-gray-400 text-center">Your message has been saved. Want immediate help?</p>
                                            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                                            >
                                                <FaWhatsapp size={18} /> Continue on WhatsApp
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1" style={{ maxWidth: '82%' }}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.from === 'user'
                                                ? 'bg-primary-700 text-white rounded-br-md'
                                                : msg.isReal
                                                    ? 'bg-gold-400/20 border border-gold-400/40 text-gray-800 dark:text-gray-200 rounded-bl-md'
                                                    : 'bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 rounded-bl-md'
                                                }`}>
                                                {msg.isReal && <span className="text-gold-400 text-xs font-bold block mb-1">👤 Admin Reply</span>}
                                                {msg.text}
                                            </div>
                                            <span className={`text-[10px] text-gray-400 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
                                                {formatTime(msg.time)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {typing && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-dark-border px-4 py-3 rounded-2xl rounded-bl-md">
                                        <div className="flex space-x-1">
                                            {[0, 1, 2].map(i => (
                                                <motion.div key={i} className="w-2 h-2 bg-gray-400 rounded-full"
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick suggestions */}
                        <div className="px-3 pb-2 flex-shrink-0">
                            <div className="flex flex-wrap gap-1.5">
                                {['Projects', 'Pricing', 'Book Visit', 'Location'].map(s => (
                                    <button key={s} onClick={() => { setInput(s); }}
                                        className="px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-gold-400 hover:text-gold-400 transition-colors"
                                    >{s}</button>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t dark:border-dark-border flex-shrink-0">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-border border-none text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                />
                                <button onClick={handleSend} disabled={!input.trim()}
                                    className="p-2.5 rounded-xl bg-gold-400 text-white hover:bg-gold-500 transition-colors disabled:opacity-40"
                                >
                                    <FiSend size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle button with notification pulse */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-lg flex items-center justify-center z-50 hover:shadow-xl hover:shadow-primary-900/30 transition-shadow"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <FiX size={22} />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <FiMessageCircle size={22} />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Pulse ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary-500"
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.button>
        </>
    );
};

export default ChatWidget;
