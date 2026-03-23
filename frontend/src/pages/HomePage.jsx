import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import AnnouncementPopup from '../components/AnnouncementPopup';
import api from '../hooks/useApi';
import { FiArrowRight, FiTarget, FiEye, FiAward } from 'react-icons/fi';

const HomePage = () => {
    const [projects, setProjects] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState(null);
    const { t, language } = useLanguage();

    useEffect(() => {
        api.get('/projects').then(res => setProjects(res.data.slice(0, 6))).catch(() => { });
        api.get('/recommendations').then(res => setRecommendations(res.data)).catch(() => { });
        api.get('/admin/announcements').then(res => {
            const list = res.data;
            if (list.length > 0) {
                const latest = list[0];
                const lastSeen = localStorage.getItem('pvr_last_seen_announcement');
                if (lastSeen !== latest._id) setNewAnnouncement(latest);
            }
        }).catch(() => { });
    }, []);

    const fadeUp = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
        viewport: { once: true, margin: "-50px" },
    };

    return (
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors">
            <Navbar />

            {/* Hero Banner */}
            <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-dark-bg" />
                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight"
                    >
                        {language === 'te'
                            ? 'విజయవాడలో లగ్జరీ లివింగ్ నిర్మిస్తోంది'
                            : <>Building <span className="text-gold-gradient">Luxury Living</span> in Vijayawada</>
                        }
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
                    >
                        {language === 'te'
                            ? 'విజయవాడలో ప్రపంచ స్థాయి గృహ మరియు వాణిజ్య ప్రాజెక్ట్‌లను అందిస్తోంది.'
                            : 'One of the largest construction companies delivering world-class residential and commercial spaces with unmatched quality and innovation.'
                        }
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/projects" className="px-8 py-3.5 rounded-xl btn-shimmer text-white font-semibold">
                            {t('ourProjects')}
                        </Link>
                        <Link to="/contact" className="px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">
                            Contact Us
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* About */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <span className="text-gold-400 font-medium text-sm tracking-widest uppercase">About Us</span>
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mt-3 mb-6">
                            Crafting Dreams Into Reality
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            PVR Groups has been at the forefront of the construction industry in Vijayawada for over two decades. We blend innovative architecture with luxurious living to create spaces that inspire and endure.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                        {[
                            { icon: FiTarget, title: 'Our Mission', color: 'from-primary-600 to-primary-800', text: 'To transform the skyline of Vijayawada with iconic structures that combine luxury, sustainability, and innovation, while delivering unparalleled value to our customers.' },
                            { icon: FiEye, title: 'Our Vision', color: 'from-gold-400 to-gold-600', text: 'To be the most trusted and admired construction company in Andhra Pradesh, setting new benchmarks in quality construction, timely delivery, and customer delight.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-dark-border"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5`}>
                                    <item.icon size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="py-20 bg-gradient-to-br from-primary-800 via-primary-900 to-dark-bg px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp} className="text-center mb-12">
                        <span className="text-gold-400 font-medium text-sm tracking-widest uppercase">Our Achievements</span>
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mt-3">Numbers Speak Louder</h2>
                    </motion.div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: '25+', label: 'Years Experience' },
                            { value: '150+', label: 'Projects Completed' },
                            { value: '5000+', label: 'Happy Families' },
                            { value: '10M+', label: 'Sq.Ft Delivered' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
                            >
                                <p className="text-3xl md:text-4xl font-heading font-bold text-gold-400 mb-2">{stat.value}</p>
                                <p className="text-gray-300 text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp} className="flex items-end justify-between mb-12">
                        <div>
                            <span className="text-gold-400 font-medium text-sm tracking-widest uppercase">{t('ourProjects')}</span>
                            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mt-3">Featured Projects</h2>
                        </div>
                        <Link to="/projects" className="hidden md:flex items-center text-gold-400 hover:text-gold-300 font-medium transition-colors">
                            {t('viewAll')} <FiArrowRight className="ml-2" />
                        </Link>
                    </motion.div>

                    {projects.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <FiAward size={48} className="text-gold-400/30 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Projects coming soon. Stay tuned!</p>
                        </div>
                    )}

                    <div className="md:hidden text-center mt-8">
                        <Link to="/projects" className="inline-flex items-center text-gold-400 hover:text-gold-300 font-medium">
                            View All Projects <FiArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Recommended For You */}
            {recommendations.length > 0 && (
                <section className="py-20 bg-gray-100 dark:bg-dark-card/30 px-4">
                    <div className="max-w-7xl mx-auto">
                        <motion.div {...fadeUp} className="text-center mb-12">
                            <span className="text-gold-400 font-medium text-sm tracking-widest uppercase">AI Powered</span>
                            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mt-3">
                                Recommended <span className="text-gold-gradient">For You</span>
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Projects picked based on your preferences</p>
                        </motion.div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.slice(0, 3).map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="py-20 bg-gray-100 dark:bg-dark-card/50 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp} className="text-center mb-12">
                        <span className="text-gold-400 font-medium text-sm tracking-widest uppercase">Testimonials</span>
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mt-3">What Our Clients Say</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Rajesh Kumar', role: 'Homeowner', rating: 5, text: 'PVR Groups delivered our dream home with exceptional quality. The attention to detail and luxurious amenities exceeded our expectations!' },
                            { name: 'Priya Sharma', role: 'Investor', rating: 5, text: 'PVR Groups stands out for their transparency, timely delivery, and premium quality construction. Highly recommended for investors.' },
                            { name: 'Suresh Reddy', role: 'Homeowner', rating: 5, text: 'The clubhouse and swimming pool facilities are world-class. Living in a PVR Groups property feels like a five-star experience every day.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-border"
                            >
                                <div className="flex mb-3">
                                    {[...Array(5)].map((_, j) => (
                                        <span key={j} className={`text-lg ${j < item.rating ? 'text-gold-400' : 'text-gray-300'}`}>★</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 italic">"{item.text}"</p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">{item.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-primary-800 to-primary-900">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div {...fadeUp}>
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
                            Ready to Find Your <span className="text-gold-gradient">Dream Home?</span>
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                            Schedule a site visit today and experience luxury living firsthand with PVR Groups.
                        </p>
                        <Link to="/contact" className="inline-block px-10 py-4 rounded-2xl btn-shimmer text-white text-lg font-semibold">
                            Book a Site Visit
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />

            <AnnouncementPopup
                announcement={newAnnouncement}
                onClose={() => {
                    if (newAnnouncement) localStorage.setItem('pvr_last_seen_announcement', newAnnouncement._id);
                    setNewAnnouncement(null);
                }}
            />
        </div>
    );
};

export default HomePage;
