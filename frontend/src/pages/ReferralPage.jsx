import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../hooks/useApi';
import { FiCopy, FiGift, FiUsers, FiStar, FiShare2, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const ReferralPage = () => {
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/referral/code'),
            api.get('/referral/stats'),
        ]).then(([codeRes, statsRes]) => {
            setData(codeRes.data);
            setStats(statsRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const copyCode = () => {
        navigator.clipboard.writeText(data?.referralCode || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        const msg = `🏠 Check out PVR Groups - Luxury Real Estate in Vijayawada!\n\nUse my referral code: ${data?.referralCode}\n\nRegister here: ${data?.referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (loading) return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen">
            <Navbar />
            <div className="flex justify-center py-32">
                <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen transition-colors">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
                        Refer & <span className="text-gold-gradient">Earn</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Share PVR Groups with friends and earn reward points!</p>
                </motion.div>

                {/* Referral Code Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-400/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <p className="text-gold-400 text-sm font-semibold mb-2">YOUR REFERRAL CODE</p>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                                <span className="text-2xl font-heading font-bold tracking-widest">{data?.referralCode || '—'}</span>
                            </div>
                            <button onClick={copyCode} className="p-3 rounded-xl bg-gold-400 text-white hover:bg-gold-500 transition-colors">
                                {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
                            </button>
                        </div>

                        <p className="text-white/70 text-sm mb-4">Share your link:</p>
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 mb-6">
                            <span className="text-xs text-white/80 truncate flex-1">{data?.referralLink}</span>
                            <button onClick={copyCode} className="text-xs text-gold-400 font-semibold shrink-0">Copy</button>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={shareWhatsApp} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors">
                                <FaWhatsapp size={18} /> Share on WhatsApp
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'Total Referrals', value: stats?.totalReferrals || 0, icon: FiUsers, color: 'from-blue-500 to-blue-600' },
                        { label: 'Successful', value: stats?.completedReferrals || 0, icon: FiStar, color: 'from-green-500 to-green-600' },
                        { label: 'Reward Points', value: stats?.rewardPoints || 0, icon: FiGift, color: 'from-gold-400 to-gold-600' },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                                <card.icon size={20} className="text-white" />
                            </div>
                            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white">{card.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Referred Users List */}
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border">
                        <h2 className="font-heading font-bold text-gray-900 dark:text-white">Your Referrals</h2>
                    </div>
                    {stats?.referrals?.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-border/30">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.referrals.map((r, i) => (
                                    <tr key={r._id} className="border-b border-gray-50 dark:border-dark-border">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.referredUserId?.name || 'Pending'}</p>
                                                <p className="text-xs text-gray-400">{r.referredUserId?.email || r.referredEmail || ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === 'completed' || r.status === 'rewarded'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-gold-400">+{r.rewardPoints}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <FiShare2 size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No referrals yet</p>
                            <p className="text-gray-400 text-sm mt-1">Share your code and start earning points!</p>
                        </div>
                    )}
                </div>

                {/* How it works */}
                <div className="mt-8 bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                    <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-4">How It Works</h3>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {[
                            { step: '1', title: 'Share Code', desc: 'Share your unique referral code with friends' },
                            { step: '2', title: 'They Register', desc: 'Friend registers using your referral code' },
                            { step: '3', title: 'Earn Points', desc: 'You earn 100 reward points per referral!' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-400 font-bold flex items-center justify-center mx-auto mb-3">{s.step}</div>
                                <p className="font-semibold text-gray-800 dark:text-white text-sm">{s.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ReferralPage;
