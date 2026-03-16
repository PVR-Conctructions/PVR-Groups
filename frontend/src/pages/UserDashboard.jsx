import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';
import { FiHeart, FiCalendar, FiBell, FiUser, FiTrash2, FiMapPin, FiArrowRight, FiSave, FiMail, FiPhone } from 'react-icons/fi';
import { optimizeCloudinaryUrl, cloudinarySrcSet } from '../utils/cloudinary';

const UserDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [favorites, setFavorites] = useState([]);
    const [siteVisits, setSiteVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', language: 'en' });
    const [saving, setSaving] = useState(false);

    const tabs = [
        { key: 'overview', label: 'Overview', icon: FiUser },
        { key: 'favorites', label: 'My Favorites', icon: FiHeart },
        { key: 'visits', label: 'Site Visits', icon: FiCalendar },
        { key: 'notifications', label: 'Notifications', icon: FiBell },
        { key: 'profile', label: 'Profile', icon: FiUser },
    ];

    useEffect(() => {
        Promise.all([
            api.get('/favorites').catch(() => ({ data: [] })),
            api.get('/site-visit/my').catch(() => ({ data: [] })),
        ]).then(([favRes, visitRes]) => {
            setFavorites(favRes.data);
            setSiteVisits(visitRes.data);
            setProfileForm({ name: user?.name || '', phone: user?.phone || '', language: user?.language || 'en' });
            setLoading(false);
        });
    }, [user]);

    const removeFavorite = async (projectId) => {
        try {
            await api.delete(`/favorites/${projectId}`);
            setFavorites(prev => prev.filter(f => f._id !== projectId));
        } catch (err) {
            console.error('Failed to remove favorite');
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            await api.put('/auth/profile', profileForm);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        }
        setSaving(false);
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

            <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
                        Welcome back, <span className="text-gold-gradient">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your favorites, visits, and profile</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white dark:bg-dark-card rounded-2xl p-1.5 border border-gray-100 dark:border-dark-border mb-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.key
                                    ? 'bg-gold-400 text-white shadow-lg shadow-gold-400/20'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { label: 'Favorite Projects', value: favorites.length, icon: FiHeart, color: 'from-red-500 to-pink-500', to: () => setActiveTab('favorites') },
                                { label: 'Site Visits', value: siteVisits.length, icon: FiCalendar, color: 'from-blue-500 to-indigo-500', to: () => setActiveTab('visits') },
                                { label: 'Messages', value: '—', icon: FiMail, color: 'from-green-500 to-teal-500', to: () => window.location.href = '/messages' },
                            ].map((card, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={card.to}
                                    className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border cursor-pointer hover:shadow-lg transition-shadow"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                                        <card.icon size={20} className="text-white" />
                                    </div>
                                    <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white">{card.value}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* FAVORITES */}
                    {activeTab === 'favorites' && (
                        <div>
                            {favorites.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border">
                                    <FiHeart size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">No favorites yet</p>
                                    <p className="text-gray-400 text-sm mt-2">Browse projects and tap ❤️ to save</p>
                                    <Link to="/projects" className="inline-block mt-6 px-5 py-2.5 rounded-xl btn-shimmer text-white text-sm font-semibold">
                                        Explore Projects
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favorites.map((project, i) => (
                                        <motion.div
                                            key={project._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-lg"
                                        >
                                            <div className="relative h-40">
                                                <img
                                                    src={optimizeCloudinaryUrl(project.images?.[0], 400) || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'}
                                                    srcSet={cloudinarySrcSet(project.images?.[0], [300, 600])}
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <button
                                                    onClick={() => removeFavorite(project._id)}
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/90 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-heading font-bold text-gray-900 dark:text-white text-sm mb-1">{project.name}</h3>
                                                {project.location?.address && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                                                        <FiMapPin size={12} className="text-gold-400" />
                                                        {project.location.address}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gold-400 font-semibold text-sm">{project.price || '—'}</span>
                                                    <Link to={`/projects/${project._id}`} className="text-xs text-gold-400 flex items-center gap-1 hover:underline">
                                                        View <FiArrowRight size={12} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SITE VISITS */}
                    {activeTab === 'visits' && (
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
                            {siteVisits.length === 0 ? (
                                <div className="text-center py-20">
                                    <FiCalendar size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">No site visits booked</p>
                                    <p className="text-gray-400 text-sm mt-2">Visit a project page to book a site visit</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-dark-border">
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Project</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Date</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {siteVisits.map(visit => (
                                            <tr key={visit._id} className="border-b border-gray-50 dark:border-dark-border">
                                                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{visit.projectId?.name || 'Unknown'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(visit.preferredDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                                                        {visit.status || 'Scheduled'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-8 text-center">
                            <FiBell size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No new notifications</p>
                            <p className="text-gray-400 text-sm mt-2">You'll see updates about your bookings and favorites here</p>
                        </div>
                    )}

                    {/* PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 max-w-lg">
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Email</label>
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-500 text-sm">
                                        <FiMail size={16} />
                                        {user?.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Phone</label>
                                    <input
                                        type="text"
                                        value={profileForm.phone}
                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Language</label>
                                    <select
                                        value={profileForm.language}
                                        onChange={e => setProfileForm({ ...profileForm, language: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm"
                                    >
                                        <option value="en">English</option>
                                        <option value="te">తెలుగు (Telugu)</option>
                                    </select>
                                </div>
                                <button onClick={saveProfile} disabled={saving} className="w-full py-3 rounded-xl btn-shimmer text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                                    <FiSave size={16} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default UserDashboard;
