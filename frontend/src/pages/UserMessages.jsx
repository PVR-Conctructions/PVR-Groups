import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { FiMessageCircle, FiSend, FiUser, FiShield, FiClock } from 'react-icons/fi';

const UserMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const { user } = useAuth();
    const bottomRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        markRead();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/messages/my');
            setMessages(res.data.reverse());
        } catch (err) {
            console.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const markRead = async () => {
        try {
            await api.put('/messages/read');
        } catch (err) { }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            const res = await api.post('/messages/send', { content: newMessage.trim() });
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isMyMessage = (msg) => msg.sender?._id === user?._id || msg.sender === user?._id;

    return (
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors min-h-screen">
            <Navbar />

            <HeroBanner
                title={<>My <span className="text-gold-gradient">Messages</span></>}
                subtitle="Your conversations with PVR Groups admin team"
            />

            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
                        {/* Messages area */}
                        <div className="h-[500px] overflow-y-auto p-6 space-y-4" id="messages-container">
                            {loading ? (
                                <div className="text-center py-20 text-gray-500">Loading messages...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-20">
                                    <FiMessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-2">No messages yet</p>
                                    <p className="text-gray-400 text-sm">Send a message to PVR Groups team below</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const mine = isMyMessage(msg);
                                    return (
                                        <motion.div
                                            key={msg._id || i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[75%] ${mine ? 'order-2' : ''}`}>
                                                {/* Sender label */}
                                                <div className={`flex items-center gap-1 mb-1 ${mine ? 'justify-end' : ''}`}>
                                                    {mine ? (
                                                        <FiUser size={10} className="text-gold-400" />
                                                    ) : (
                                                        <FiShield size={10} className="text-blue-400" />
                                                    )}
                                                    <span className="text-xs text-gray-400">
                                                        {mine ? 'You' : 'PVR Groups Admin'}
                                                    </span>
                                                </div>

                                                {/* Bubble */}
                                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${mine
                                                    ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white rounded-br-md'
                                                    : 'bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 rounded-bl-md'
                                                    }`}>
                                                    {msg.announcementId && (
                                                        <p className={`text-xs mb-1.5 pb-1.5 border-b ${mine ? 'border-white/20 text-white/70' : 'border-gray-200 dark:border-gray-600 text-gray-400'}`}>
                                                            Re: {msg.announcementId.title || 'Announcement'}
                                                        </p>
                                                    )}
                                                    {msg.content}
                                                </div>

                                                {/* Time */}
                                                <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : ''}`}>
                                                    <FiClock size={10} className="text-gray-300" />
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(msg.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-border/50">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!newMessage.trim() || sending}
                                    className="px-5 py-3 rounded-xl btn-shimmer text-white disabled:opacity-50 flex items-center gap-2"
                                >
                                    <FiSend size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default UserMessages;
