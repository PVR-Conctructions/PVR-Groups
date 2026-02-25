import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiSend, FiCalendar, FiMessageCircle } from 'react-icons/fi';

const UserAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState({});
    const [replyOpen, setReplyOpen] = useState({});
    const [sending, setSending] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/admin/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            console.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (announcementId) => {
        const content = replyContent[announcementId];
        if (!content?.trim()) return;

        setSending({ ...sending, [announcementId]: true });
        try {
            await api.post('/messages/send', {
                content: content.trim(),
                announcementId,
            });
            setReplyContent({ ...replyContent, [announcementId]: '' });
            setReplyOpen({ ...replyOpen, [announcementId]: false });
            alert('Reply sent successfully! Admin will see your message.');
        } catch (err) {
            alert('Failed to send reply');
        } finally {
            setSending({ ...sending, [announcementId]: false });
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors min-h-screen">
            <Navbar />

            <HeroBanner
                title={<>Latest <span className="text-gold-gradient">Announcements</span></>}
                subtitle="Stay updated with the latest news and offers from PVR Groups"
            />

            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading announcements...</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-20">
                            <FiBell size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No announcements yet. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {announcements.map((ann, i) => (
                                <motion.div
                                    key={ann._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden"
                                >
                                    {/* Header with gold accent */}
                                    <div className="bg-gradient-to-r from-gold-400/10 to-transparent p-6 border-b border-gray-100 dark:border-dark-border">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold-400/20">
                                                    <FiBell size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                                                        {ann.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                        <FiCalendar size={12} />
                                                        {new Date(ann.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                                                    </div>
                                                </div>
                                            </div>
                                            {ann.active && (
                                                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs rounded-full font-medium">Active</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {ann.content}
                                        </p>
                                    </div>

                                    {/* Reply section */}
                                    <div className="px-6 pb-6">
                                        {!replyOpen[ann._id] ? (
                                            <button
                                                onClick={() => setReplyOpen({ ...replyOpen, [ann._id]: true })}
                                                className="flex items-center gap-2 text-gold-400 text-sm font-medium hover:text-gold-300 transition-colors"
                                            >
                                                <FiMessageCircle size={16} /> Reply to this announcement
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={replyContent[ann._id] || ''}
                                                    onChange={(e) => setReplyContent({ ...replyContent, [ann._id]: e.target.value })}
                                                    placeholder="Write your reply..."
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReply(ann._id)}
                                                        disabled={sending[ann._id]}
                                                        className="px-4 py-2 rounded-lg btn-shimmer text-white text-sm font-medium flex items-center gap-2"
                                                    >
                                                        <FiSend size={14} /> {sending[ann._id] ? 'Sending...' : 'Send Reply'}
                                                    </button>
                                                    <button
                                                        onClick={() => setReplyOpen({ ...replyOpen, [ann._id]: false })}
                                                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default UserAnnouncements;
