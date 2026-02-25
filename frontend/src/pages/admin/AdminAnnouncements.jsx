import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', content: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchAnnouncements(); }, []);

    const fetchAnnouncements = () => {
        api.get('/admin/announcements').then(res => { setAnnouncements(res.data); setLoading(false); }).catch(() => setLoading(false));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admin/announcements', form);
            fetchAnnouncements();
            setForm({ title: '', content: '' });
            setShowForm(false);
        } catch (err) {
            alert('Failed to post announcement');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try { await api.delete(`/admin/announcements/${id}`); fetchAnnouncements(); } catch (err) { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Announcements</h1>
                    <p className="text-gray-500 mt-1">Post updates and news</p>
                </div>
                <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl btn-shimmer text-white font-medium flex items-center gap-2">
                    <FiPlus size={18} /> New Announcement
                </button>
            </div>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">New Announcement</h2>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Content" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl btn-shimmer text-white font-medium disabled:opacity-50">
                            {saving ? 'Posting...' : 'Post Announcement'}
                        </button>
                    </form>
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map(a => (
                        <div key={a._id} className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-2">{a.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{a.content}</p>
                                    <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</p>
                                </div>
                                <button onClick={() => handleDelete(a._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div className="text-center py-16 text-gray-500">No announcements yet</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAnnouncements;
