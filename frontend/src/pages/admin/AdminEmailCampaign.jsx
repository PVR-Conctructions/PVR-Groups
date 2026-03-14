import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiSend, FiMail, FiUsers, FiCheckCircle, FiLoader, FiSearch, FiUser } from 'react-icons/fi';

const AdminEmailCampaign = () => {
    const [form, setForm] = useState({ subject: '', htmlContent: '', targetGroup: 'all' });
    const [result, setResult] = useState(null);
    const [sending, setSending] = useState(false);
    const pollingRef = useRef(null);

    // User selection state
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);

    const templates = [
        { name: 'New Project Launch', subject: 'Exciting New Project Launch - PVR Groups', content: '<h2>Dear {{name}},</h2><p>We are thrilled to announce the launch of our newest premium project!</p><p>Features include world-class amenities, prime location, and attractive pricing.</p><p style="margin-top:20px"><a href="http://localhost:5173/projects" style="background:#C4A44B;color:#0a1628;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View Projects</a></p><br><p><strong>PVR Groups</strong><br>Building Luxury Living in Vijayawada</p>' },
        { name: 'Special Offer', subject: 'Limited Time Offer! - PVR Groups', content: '<h2>Hello {{name}},</h2><p>We have a special limited-time offer just for you!</p><p>Get exclusive deals on our premium properties. This offer ends soon - don\'t miss out!</p><p style="margin-top:20px"><a href="http://localhost:5173/projects" style="background:#C4A44B;color:#0a1628;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Explore Now</a></p><br><p><strong>PVR Groups Team</strong></p>' },
        { name: 'Festival Greetings', subject: 'Festival Greetings from PVR Groups', content: '<h2>Dear {{name}},</h2><p>Wishing you and your family a very happy festival season!</p><p>May this festive season bring you prosperity and joy. We are grateful to have you as part of the PVR Groups family.</p><br><p>Warm regards,<br><strong>PVR Groups Team</strong></p>' },
    ];

    // Fetch users when "Selected Users" is chosen
    useEffect(() => {
        if (form.targetGroup === 'selected' && users.length === 0) {
            setLoadingUsers(true);
            api.get('/admin/users').then(res => {
                setUsers(res.data.users || res.data || []);
                setLoadingUsers(false);
            }).catch(() => setLoadingUsers(false));
        }
    }, [form.targetGroup]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const pollStatus = () => {
        pollingRef.current = setInterval(async () => {
            try {
                const res = await api.get('/email/campaign/status');
                const status = res.data;
                setResult({ ...status, message: status.message || 'Sending...' });

                if (!status.running) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    setSending(false);
                }
            } catch (err) {
                // Keep polling even if one request fails
            }
        }, 3000);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.subject || !form.htmlContent) return;
        if (form.targetGroup === 'selected' && selectedUserIds.length === 0) return;
        setSending(true);
        setResult(null);
        try {
            const payload = { ...form };
            if (form.targetGroup === 'selected') {
                payload.selectedUserIds = selectedUserIds;
            }
            const res = await api.post('/email/campaign', payload);
            setResult(res.data);

            if (res.data.started) {
                pollStatus();
            } else {
                setSending(false);
            }
        } catch (err) {
            console.error('Campaign error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to send campaign. Check your connection and try again.';
            setResult({ message: errorMsg, sent: 0, failed: 0, total: 0 });
            setSending(false);
        }
    };

    const applyTemplate = (t) => {
        setForm({ ...form, subject: t.subject, htmlContent: t.content });
    };

    const toggleUser = (userId) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Email Campaigns</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send bulk emails to users and subscribers</p>
            </div>

            {/* Templates */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Templates</p>
                <div className="flex flex-wrap gap-3">
                    {templates.map((t, i) => (
                        <button key={i} onClick={() => applyTemplate(t)}
                            className="px-4 py-2 rounded-xl text-sm border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-gold-400 hover:text-gold-400 transition-colors"
                        >{t.name}</button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSend} className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" placeholder="Email subject" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Group</label>
                        <select value={form.targetGroup} onChange={e => { setForm({ ...form, targetGroup: e.target.value }); setSelectedUserIds([]); }} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm">
                            <option value="all">All Users</option>
                            <option value="selected">Selected Users</option>
                            <option value="newsletter">Newsletter Subscribers</option>
                        </select>
                    </div>
                </div>

                {/* User Selection Panel */}
                {form.targetGroup === 'selected' && (
                    <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                        <div className="p-3 bg-gray-50 dark:bg-dark-border/30 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <FiSearch size={14} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Search users by name or email..."
                                    className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white outline-none placeholder-gray-400"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-gold-400 font-semibold">{selectedUserIds.length} selected</span>
                                <button type="button" onClick={() => setSelectedUserIds(filteredUsers.map(u => u._id))} className="px-2 py-1 rounded-lg bg-gold-400/10 text-gold-400 hover:bg-gold-400/20 transition-colors">Select All</button>
                                <button type="button" onClick={() => setSelectedUserIds([])} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Clear</button>
                            </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
                            {loadingUsers ? (
                                <div className="p-4 text-center text-sm text-gray-400"><FiLoader className="inline animate-spin mr-2" />Loading users...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-400">No users found</div>
                            ) : (
                                filteredUsers.map(user => (
                                    <label key={user._id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors ${selectedUserIds.includes(user._id) ? 'bg-gold-400/5' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUserIds.includes(user._id)}
                                            onChange={() => toggleUser(user._id)}
                                            className="w-4 h-4 rounded border-gray-300 text-gold-400 focus:ring-gold-400 accent-[#C4A44B]"
                                        />
                                        <FiUser size={14} className="text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Content (HTML) — Use {'{{name}}'} for personalization</label>
                    <textarea value={form.htmlContent} onChange={e => setForm({ ...form, htmlContent: e.target.value })} rows={10} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm font-mono" placeholder="<h2>Hello {{name}},</h2><p>Your email content here...</p>" required />
                </div>

                {/* Preview */}
                {form.htmlContent && (
                    <div className="border border-gray-200 dark:border-dark-border rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <div className="text-sm text-gray-700 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: form.htmlContent.replace(/{{name}}/g, 'John Doe') }} />
                    </div>
                )}

                <button type="submit" disabled={sending || (form.targetGroup === 'selected' && selectedUserIds.length === 0)} className="flex items-center gap-2 px-6 py-3 rounded-xl btn-shimmer text-white font-medium text-sm disabled:opacity-50">
                    {sending ? <FiLoader size={16} className="animate-spin" /> : <FiSend size={16} />}
                    {sending ? 'Sending Campaign...' : form.targetGroup === 'selected' ? `Send to ${selectedUserIds.length} User${selectedUserIds.length !== 1 ? 's' : ''}` : 'Send Campaign'}
                </button>
            </form>

            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border"
                >
                    <div className="flex items-center gap-3 mb-3">
                        {result.running ? (
                            <FiLoader size={24} className="text-gold-400 animate-spin" />
                        ) : (
                            <FiCheckCircle size={24} className="text-green-400" />
                        )}
                        <h3 className="font-heading font-bold text-gray-900 dark:text-white">
                            {result.running ? 'Campaign In Progress...' : 'Campaign Result'}
                        </h3>
                    </div>
                    {result.message && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{result.message}</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-50 dark:bg-dark-border/30 rounded-xl">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.total || 0}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
                            <p className="text-2xl font-bold text-green-500">{result.sent || 0}</p>
                            <p className="text-xs text-gray-500">Sent</p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                            <p className="text-2xl font-bold text-red-500">{result.failed || 0}</p>
                            <p className="text-xs text-gray-500">Failed</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminEmailCampaign;

