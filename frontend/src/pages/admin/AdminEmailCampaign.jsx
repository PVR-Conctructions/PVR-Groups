import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiSend, FiMail, FiUsers, FiCheckCircle } from 'react-icons/fi';

const AdminEmailCampaign = () => {
    const [form, setForm] = useState({ subject: '', htmlContent: '', targetGroup: 'all' });
    const [result, setResult] = useState(null);
    const [sending, setSending] = useState(false);

    const templates = [
        { name: 'New Project Launch', subject: 'Exciting New Project Launch - PVR Groups', content: '<h2>Dear {{name}},</h2><p>We are thrilled to announce the launch of our newest premium project!</p><p>Features include world-class amenities, prime location, and attractive pricing.</p><p style="margin-top:20px"><a href="http://localhost:5173/projects" style="background:#C4A44B;color:#0a1628;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View Projects</a></p><br><p><strong>PVR Groups</strong><br>Building Luxury Living in Vijayawada</p>' },
        { name: 'Special Offer', subject: 'Limited Time Offer! - PVR Groups', content: '<h2>Hello {{name}},</h2><p>We have a special limited-time offer just for you!</p><p>Get exclusive deals on our premium properties. This offer ends soon - don\'t miss out!</p><p style="margin-top:20px"><a href="http://localhost:5173/projects" style="background:#C4A44B;color:#0a1628;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Explore Now</a></p><br><p><strong>PVR Groups Team</strong></p>' },
        { name: 'Festival Greetings', subject: 'Festival Greetings from PVR Groups', content: '<h2>Dear {{name}},</h2><p>Wishing you and your family a very happy festival season!</p><p>May this festive season bring you prosperity and joy. We are grateful to have you as part of the PVR Groups family.</p><br><p>Warm regards,<br><strong>PVR Groups Team</strong></p>' },
    ];

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.subject || !form.htmlContent) return;
        setSending(true);
        try {
            const res = await api.post('/email/campaign', form);
            setResult(res.data);
            setSending(false);
        } catch (err) {
            setResult({ message: 'Failed to send campaign' });
            setSending(false);
        }
    };

    const applyTemplate = (t) => {
        setForm({ ...form, subject: t.subject, htmlContent: t.content });
    };

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
                        <select value={form.targetGroup} onChange={e => setForm({ ...form, targetGroup: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm">
                            <option value="all">All Users</option>
                            <option value="newsletter">Newsletter Subscribers</option>
                        </select>
                    </div>
                </div>
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

                <button type="submit" disabled={sending} className="flex items-center gap-2 px-6 py-3 rounded-xl btn-shimmer text-white font-medium text-sm disabled:opacity-50">
                    <FiSend size={16} /> {sending ? 'Sending...' : 'Send Campaign'}
                </button>
            </form>

            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <FiCheckCircle size={24} className="text-green-400" />
                        <h3 className="font-heading font-bold text-gray-900 dark:text-white">Campaign Result</h3>
                    </div>
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
