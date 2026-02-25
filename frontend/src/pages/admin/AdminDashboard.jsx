import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiUsers, FiFolder, FiMessageSquare, FiTrendingUp, FiClock, FiCheckCircle, FiMail, FiCalendar, FiEye, FiDollarSign } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GOLD = '#C4A44B';
const BLUE = '#3B82F6';
const GREEN = '#22C55E';
const PURPLE = '#A855F7';
const COLORS = [GOLD, BLUE, GREEN, PURPLE, '#EF4444', '#06B6D4'];

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [projectViews, setProjectViews] = useState([]);
    const [revenue, setRevenue] = useState({ monthly: [], totalRevenue: 0 });
    const [visitors, setVisitors] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/admin/dashboard').catch(() => ({ data: {} })),
            api.get('/analytics/registrations').catch(() => ({ data: [] })),
            api.get('/analytics/project-views').catch(() => ({ data: [] })),
            api.get('/analytics/revenue').catch(() => ({ data: { monthly: [], totalRevenue: 0 } })),
            api.get('/analytics/visitors').catch(() => ({ data: null })),
        ]).then(([statsRes, regRes, viewRes, revRes, visRes]) => {
            setStats(statsRes.data);
            setRegistrations(regRes.data);
            setProjectViews(viewRes.data);
            setRevenue(revRes.data);
            setVisitors(visRes.data);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const statCards = [
        { icon: FiUsers, label: 'Total Users', value: stats?.totalUsers || 0, color: 'from-blue-500 to-blue-600' },
        { icon: FiFolder, label: 'Total Projects', value: stats?.totalProjects || 0, color: 'from-gold-400 to-gold-600' },
        { icon: FiClock, label: 'Ongoing', value: stats?.ongoingProjects || 0, color: 'from-green-500 to-green-600' },
        { icon: FiCheckCircle, label: 'Completed', value: stats?.completedProjects || 0, color: 'from-purple-500 to-purple-600' },
        { icon: FiMessageSquare, label: 'Feedback', value: stats?.totalFeedback || 0, color: 'from-orange-500 to-orange-600' },
        { icon: FiTrendingUp, label: 'Pending Reviews', value: stats?.pendingFeedback || 0, color: 'from-red-500 to-red-600' },
        { icon: FiMail, label: 'Newsletter', value: stats?.totalNewsletterSubs || 0, color: 'from-teal-500 to-teal-600' },
        { icon: FiDollarSign, label: 'Revenue', value: revenue?.totalRevenue ? '₹' + (revenue.totalRevenue / 100000).toFixed(1) + 'L' : '₹0', color: 'from-emerald-500 to-emerald-600' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white dark:bg-dark-card p-3 rounded-xl shadow-lg border border-gray-100 dark:border-dark-border">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-xs text-gray-500" style={{ color: p.color }}>
                        {p.name}: {typeof p.value === 'number' && p.value > 999 ? '₹' + (p.value / 1000).toFixed(0) + 'K' : p.value}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">PVR Groups Admin Analytics</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-gray-100 dark:border-dark-border"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                            <card.icon size={18} className="text-white" />
                        </div>
                        <p className="text-xl font-heading font-bold text-gray-900 dark:text-white">{card.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Registration Trends */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border"
                >
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-1">User Registrations</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Monthly new user sign-ups</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={registrations}>
                            <defs>
                                <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="users" stroke={GOLD} fill="url(#gradGold)" strokeWidth={2} name="Users" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Revenue Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border"
                >
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-1">Revenue</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Monthly payment collections</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={revenue?.monthly || []}>
                            <defs>
                                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" stroke={GREEN} fill="url(#gradGreen)" strokeWidth={2} name="Revenue" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Most Viewed Projects */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border"
                >
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-1">Most Viewed Projects</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Top trending projects by views</p>
                    {projectViews.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={projectViews} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={100} stroke="#9ca3af" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="viewCount" name="Views" fill={GOLD} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
                            <div className="text-center">
                                <FiEye size={32} className="mx-auto mb-2 text-gray-300" />
                                <p>No view data yet</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Visitor Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border"
                >
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-1">Activity Distribution</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Site visits, feedback, and inquiries</p>
                    {visitors?.distribution ? (
                        <div className="flex items-center">
                            <ResponsiveContainer width="60%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={visitors.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {visitors.distribution.map((entry, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3 ml-4">
                                {visitors.distribution.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">{d.name}</span>
                                        <span className="text-xs font-bold text-gray-800 dark:text-white">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No data</div>
                    )}
                </motion.div>
            </div>

            {/* Recent Users */}
            {visitors?.recentUsers?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border"
                >
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">Recent Sign-ups</h2>
                    <div className="space-y-3">
                        {visitors.recentUsers.map((u, i) => (
                            <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-dark-border last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{u.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</p>
                                        <p className="text-xs text-gray-400">{u.email}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminDashboard;
