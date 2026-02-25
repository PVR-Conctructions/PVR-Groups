import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiMessageCircle, FiSend, FiUser, FiClock, FiBell, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState({});
    const [sending, setSending] = useState({});
    const [expandedUser, setExpandedUser] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/messages/admin/all');
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    // Group messages by user
    const groupedByUser = messages.reduce((acc, msg) => {
        // Determine the user (non-admin party)
        const msgUser = msg.sender?.role !== 'admin' ? msg.sender : msg.receiver;
        if (!msgUser?._id) return acc;
        const userId = msgUser._id;

        if (!acc[userId]) {
            acc[userId] = {
                user: msgUser,
                messages: [],
            };
        }
        acc[userId].messages.push(msg);
        return acc;
    }, {});

    const userConversations = Object.values(groupedByUser).sort((a, b) => {
        const aLast = a.messages[0]?.createdAt || '';
        const bLast = b.messages[0]?.createdAt || '';
        return new Date(bLast) - new Date(aLast);
    });

    const handleReply = async (userId) => {
        const content = replyContent[userId];
        if (!content?.trim()) return;

        setSending({ ...sending, [userId]: true });
        try {
            await api.post('/messages/admin/reply', {
                userId,
                content: content.trim(),
            });
            setReplyContent({ ...replyContent, [userId]: '' });
            fetchMessages();
        } catch (err) {
            alert('Failed to send reply');
        } finally {
            setSending({ ...sending, [userId]: false });
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading messages...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Messages</h1>
                    <p className="text-gray-500 text-sm">User replies and conversations</p>
                </div>
                <span className="px-3 py-1 bg-gold-400/10 text-gold-400 text-sm rounded-full font-medium">
                    {userConversations.length} conversations
                </span>
            </div>

            {userConversations.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border dark:border-dark-border">
                    <FiMessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No messages from users yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {userConversations.map(({ user: convUser, messages: convMessages }) => {
                        const isExpanded = expandedUser === convUser._id;
                        const unread = convMessages.filter(m => m.sender?._id !== convUser._id ? false : !m.read).length;
                        const sortedMessages = [...convMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                        return (
                            <motion.div
                                key={convUser._id}
                                layout
                                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden"
                            >
                                {/* User header */}
                                <button
                                    onClick={() => setExpandedUser(isExpanded ? null : convUser._id)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">{convUser.name?.charAt(0) || 'U'}</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{convUser.name}</p>
                                            <p className="text-xs text-gray-400">{convUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {unread > 0 && (
                                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">{unread}</span>
                                        )}
                                        <span className="text-xs text-gray-400">{convMessages.length} messages</span>
                                        {isExpanded ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                                    </div>
                                </button>

                                {/* Messages */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 dark:border-dark-border">
                                        <div className="max-h-80 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-dark-border/20">
                                            {sortedMessages.map((msg) => {
                                                const fromUser = msg.sender?._id === convUser._id;
                                                return (
                                                    <div key={msg._id} className={`flex ${fromUser ? 'justify-start' : 'justify-end'}`}>
                                                        <div className={`max-w-[75%]`}>
                                                            <div className={`flex items-center gap-1 mb-1 ${fromUser ? '' : 'justify-end'}`}>
                                                                {fromUser ? <FiUser size={10} className="text-blue-400" /> : <span className="text-[10px]">👑</span>}
                                                                <span className="text-[10px] text-gray-400">{fromUser ? convUser.name : 'You (Admin)'}</span>
                                                            </div>
                                                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${fromUser
                                                                ? 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-dark-border rounded-bl-md'
                                                                : 'bg-gradient-to-br from-primary-700 to-primary-800 text-white rounded-br-md'
                                                                }`}>
                                                                {msg.announcementId && (
                                                                    <p className={`text-xs mb-1 pb-1 border-b flex items-center gap-1 ${fromUser ? 'border-gray-200 text-gray-400' : 'border-white/20 text-white/70'}`}>
                                                                        <FiBell size={10} /> Re: {msg.announcementId.title || 'Announcement'}
                                                                    </p>
                                                                )}
                                                                {msg.content}
                                                            </div>
                                                            <div className={`flex items-center gap-1 mt-1 ${fromUser ? '' : 'justify-end'}`}>
                                                                <FiClock size={9} className="text-gray-300" />
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(msg.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Reply input */}
                                        <div className="p-4 border-t border-gray-100 dark:border-dark-border flex gap-3">
                                            <input
                                                type="text"
                                                value={replyContent[convUser._id] || ''}
                                                onChange={(e) => setReplyContent({ ...replyContent, [convUser._id]: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleReply(convUser._id)}
                                                placeholder={`Reply to ${convUser.name}...`}
                                                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm"
                                            />
                                            <button
                                                onClick={() => handleReply(convUser._id)}
                                                disabled={!replyContent[convUser._id]?.trim() || sending[convUser._id]}
                                                className="px-4 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-600 text-white disabled:opacity-50 flex items-center gap-2 text-sm"
                                            >
                                                <FiSend size={14} /> Reply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
