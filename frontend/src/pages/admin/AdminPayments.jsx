import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiPlus, FiX } from 'react-icons/fi';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({ userId: '', projectId: '', amount: '', method: 'UPI', status: 'pending', description: '' });
    const [msg, setMsg] = useState('');

    useEffect(() => { loadAll(); }, []);

    const loadAll = () => {
        Promise.all([
            api.get('/payments/admin/all'),
            api.get('/admin/users'),
            api.get('/projects'),
        ]).then(([pRes, uRes, prRes]) => {
            setPayments(pRes.data);
            setUsers(uRes.data);
            setProjects(prRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/payments', { ...form, amount: Number(form.amount) });
            setMsg('Payment created!');
            setShowAdd(false);
            setForm({ userId: '', projectId: '', amount: '', method: 'UPI', status: 'pending', description: '' });
            loadAll();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { setMsg('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put('/payments/' + id, { status });
            loadAll();
        } catch (err) { console.error(err); }
    };

    const statusBadge = (s) => {
        const map = {
            paid: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
            failed: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
            refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
        };
        return map[s] || map.pending;
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Manage Payments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage user payment records</p>
                </div>
                <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-shimmer text-white text-sm font-medium">
                    {showAdd ? <FiX size={16} /> : <FiPlus size={16} />}
                    {showAdd ? 'Cancel' : 'Add Payment'}
                </button>
            </div>

            {msg && <div className="mb-4 p-3 rounded-xl bg-gold-400/10 text-gold-400 text-sm font-medium">{msg}</div>}

            {showAdd && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border mb-6"
                >
                    <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
                        <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} required
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm">
                            <option value="">Select User</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                        </select>
                        <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm">
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount (₹)" required
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                        <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm">
                            {['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Debit Card'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm">
                            {['pending', 'paid', 'failed', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                        <button type="submit" className="sm:col-span-2 py-2.5 rounded-xl btn-shimmer text-white font-medium text-sm">Create Payment Record</button>
                    </form>
                </motion.div>
            )}

            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-border/30">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p, i) => (
                                <tr key={p._id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50/50 dark:hover:bg-dark-border/20">
                                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td className="px-5 py-3 text-sm text-gray-800 dark:text-gray-200">{p.userId?.name || 'N/A'}</td>
                                    <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{p.projectId?.name || 'N/A'}</td>
                                    <td className="px-5 py-3 text-sm font-semibold text-gold-400">₹{p.amount?.toLocaleString('en-IN')}</td>
                                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{p.method}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>{p.status}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <select value={p.status} onChange={e => updateStatus(p._id, e.target.value)}
                                            className="text-xs px-2 py-1 rounded-lg bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300">
                                            {['pending', 'paid', 'failed', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {payments.length === 0 && <div className="text-center py-12 text-gray-400">No payment records</div>}
            </div>
        </div>
    );
};

export default AdminPayments;
