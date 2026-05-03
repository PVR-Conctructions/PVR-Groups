import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import CompareModal from '../components/CompareModal';
import AnnouncementPopup from '../components/AnnouncementPopup';
import api from '../hooks/useApi';
import { FiArrowRight, FiSearch, FiFilter, FiMapPin, FiAward, FiShield, FiPlay, FiLayers, FiCalendar, FiUsers, FiStar, FiHome, FiCheckCircle } from 'react-icons/fi';

const HomePage = () => {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [newAnnouncement, setNewAnnouncement] = useState(null);
    const [compareIds, setCompareIds] = useState([]);
    const [compareProjects, setCompareProjects] = useState([]);
    const [showCompare, setShowCompare] = useState(false);
    const [settings, setSettings] = useState({ heroImageUrl: '', highlightedProjectId: null });
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/projects').then(res => setProjects(res.data)).catch(() => { });
        api.get('/settings').then(res => {
            if (res.data) setSettings(res.data);
        }).catch(() => { });
        api.get('/admin/announcements').then(res => {
            const list = res.data;
            if (list.length > 0) {
                const latest = list[0];
                const lastSeen = localStorage.getItem('pvr_last_seen_announcement');
                if (lastSeen !== latest._id) setNewAnnouncement(latest);
            }
        }).catch(() => { });
    }, []);

    const filtered = projects.filter(p => {
        const matchesFilter = filter === 'all' || p.status === filter;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleToggleCompare = (id) => {
        setCompareIds(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const openCompare = () => {
        const selected = projects.filter(p => compareIds.includes(p._id));
        setCompareProjects(selected);
        setShowCompare(true);
    };

    return (
        <div className="bg-[#050B14] min-h-screen text-white font-sans selection:bg-gold-400 selection:text-black transition-colors">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');
                `}
            </style>
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-24 lg:pt-32 flex flex-col justify-between overflow-hidden" style={{ minHeight: 'calc(100vh - 80px)' }}>
                {/* Background Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
                        alt="Luxury Background"
                        className="w-full h-full object-cover object-center opacity-30 lg:opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050B14] via-[#050B14]/80 to-[#050B14]/80 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent z-10" />
                </div>

                {/* Hero Content Area */}
                <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full flex-1 flex flex-col lg:flex-row items-center justify-between mt-4 sm:mt-10 lg:mt-0">

                    {/* LEFT COLUMN: Main Text & CTA */}
                    <div className="w-full lg:w-5/12 pb-10 lg:pb-32 relative z-30 flex flex-col items-start pt-10 lg:pt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gold-400/50 bg-transparent text-gold-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 sm:mb-8"
                        >
                            BUILDING ANDHRA PRADESH'S FUTURE
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold leading-[1.1] mb-6 tracking-tight text-white"
                        >
                            Building Landmarks.<br />
                            <span className="text-gold-400">Creating Legacies.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-gray-300 text-sm sm:text-base mb-8 max-w-md font-light leading-relaxed"
                        >
                            PVR Groups is one of Andhra Pradesh's most trusted construction and real estate development companies, delivering excellence for over <span className="text-gold-400 font-semibold">15 years</span>.
                        </motion.p>

                        {/* Features Badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10 w-full"
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <FiMapPin className="text-gold-400 text-lg sm:text-2xl" />
                                <div>
                                    <h4 className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">Prime Locations</h4>
                                    <p className="text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">Best Connectivity</p>
                                </div>
                            </div>
                            <div className="hidden sm:block w-px h-8 bg-gray-800"></div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <FiStar className="text-gold-400 text-lg sm:text-2xl" />
                                <div>
                                    <h4 className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">World Class Amenities</h4>
                                    <p className="text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">Luxury at its Best</p>
                                </div>
                            </div>
                            <div className="hidden sm:block w-px h-8 bg-gray-800"></div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <FiShield className="text-gold-400 text-lg sm:text-2xl" />
                                <div>
                                    <h4 className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">Trusted & Reliable</h4>
                                    <p className="text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">Quality You Can Trust</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                        >
                            <button onClick={() => {
                                document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
                            }} className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#d4a843] to-[#c4952e] text-black font-bold uppercase tracking-wide hover:shadow-[0_0_20px_rgba(212,168,67,0.4)] transition-all text-sm">
                                EXPLORE PROJECTS <FiArrowRight />
                            </button>
                            <Link to="/contact" className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-gold-400 hover:border-gold-300 text-white font-bold uppercase tracking-wide hover:bg-gold-400/10 transition-all text-sm">
                                <FiCalendar /> BOOK SITE VISIT
                            </Link>
                        </motion.div>
                    </div>

                    {/* Person Image Cutout - Perfectly Centered Visually */}
                    <div className="absolute bottom-0 left-1/2 lg:left-[62%] -translate-x-1/2 w-full lg:w-auto h-[50vh] lg:h-[99vh] z-20 pointer-events-none flex justify-center items-end">
                        {(settings.heroImageUrl || "https://wmraezevzjcnqusaxovt.supabase.co/storage/v1/object/public/Homepage%20image/pavan%20sir%20image%20for%20supabase.png") && (
                            <motion.img
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                                src={settings.heroImageUrl || "https://wmraezevzjcnqusaxovt.supabase.co/storage/v1/object/public/Homepage%20image/pavan%20sir%20image%20for%20supabase.png"}
                                alt="Managing Director"
                                className="w-auto h-full max-w-none object-contain object-bottom mix-blend-screen opacity-95"
                            />
                        )}
                    </div>

                    {/* RIGHT TEXT CONTENT (Desktop Only) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="hidden lg:flex flex-col items-start pb-32 relative z-30 ml-auto w-[35%] pl-4"
                    >
                        <h3 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '3.5rem' }} className="text-gold-400 mb-2 leading-none tracking-wide">
                            Bandi Pavan Kumar
                        </h3>
                        <p className="text-gray-300 text-[11px] mb-10 uppercase tracking-[0.2em] font-semibold">Managing Director, PVR Groups</p>

                        <div className="flex items-start gap-4 text-gray-300 text-sm font-light leading-relaxed mb-10 max-w-[300px]">
                            <span className="text-gold-400 text-5xl font-serif leading-none mt-1">"</span>
                            <p className="italic text-gray-200">Our vision is to transform lives by building spaces that inspire generations.</p>
                        </div>

                        <div className="border border-gold-400/30 bg-gold-400/5 backdrop-blur-sm px-5 py-3 rounded-lg text-gold-400 text-[10px] font-bold tracking-[0.15em] flex items-center gap-2 shadow-[0_0_15px_rgba(212,168,67,0.1)]">
                            <FiCalendar size={13} /> 15+ YEARS OF LEADERSHIP
                        </div>
                    </motion.div>
                </div>

                {/* BOTTOM STATS BAR */}
                <div className="relative z-30 w-full bg-gradient-to-b from-transparent to-[#050B14] pb-6 pt-10">
                    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Glassmorphism wrapper for stats */}
                        <div className="bg-[#0A1220]/60 backdrop-blur-md border border-gray-800 rounded-2xl py-6 px-4 sm:px-8 flex flex-wrap justify-between items-center gap-6 sm:gap-8 shadow-2xl">
                            {/* Stat 1 */}
                            <div className="flex items-center gap-4 flex-1 min-w-[150px] justify-center lg:justify-start">
                                <div className="p-3 border border-gold-400/30 rounded-full bg-gold-400/5">
                                    <FiAward className="text-gold-400 text-2xl sm:text-3xl" />
                                </div>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-bold text-white leading-none mb-1">15+</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Years Experience</p>
                                </div>
                            </div>
                            <div className="hidden lg:block w-px h-12 bg-gray-800"></div>
                            {/* Stat 2 */}
                            <div className="flex items-center gap-4 flex-1 min-w-[150px] justify-center lg:justify-start">
                                <div className="p-3 border border-gold-400/30 rounded-full bg-gold-400/5">
                                    <FiHome className="text-gold-400 text-2xl sm:text-3xl" />
                                </div>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-bold text-white leading-none mb-1">900+</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Projects Delivered</p>
                                </div>
                            </div>
                            <div className="hidden lg:block w-px h-12 bg-gray-800"></div>
                            {/* Stat 3 */}
                            <div className="flex items-center gap-4 flex-1 min-w-[150px] justify-center lg:justify-start">
                                <div className="p-3 border border-gold-400/30 rounded-full bg-gold-400/5">
                                    <FiUsers className="text-gold-400 text-2xl sm:text-3xl" />
                                </div>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-bold text-white leading-none mb-1">5000+</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Happy Families</p>
                                </div>
                            </div>
                            <div className="hidden lg:block w-px h-12 bg-gray-800"></div>
                            {/* Stat 4 */}
                            <div className="flex items-center gap-4 flex-1 min-w-[150px] justify-center lg:justify-start">
                                <div className="p-3 border border-gold-400/30 rounded-full bg-gold-400/5">
                                    <FiMapPin className="text-gold-400 text-2xl sm:text-3xl" />
                                </div>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-bold text-white leading-none mb-1">25+</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Cities Covered</p>
                                </div>
                            </div>
                            <div className="hidden lg:block w-px h-12 bg-gray-800"></div>
                            {/* Stat 5 */}
                            <div className="flex items-center gap-4 flex-1 min-w-[150px] justify-center lg:justify-start">
                                <div className="p-3 border border-gold-400/30 rounded-full bg-gold-400/5">
                                    <FiCheckCircle className="text-gold-400 text-2xl sm:text-3xl" />
                                </div>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-bold text-white leading-none mb-1">100%</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Customer Satisfaction</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED PROJECTS SECTION */}
            <section id="projects-section" className="py-20 px-4 bg-[#050B14]">
                <div className="max-w-[1536px] mx-auto">
                    {/* Header & Tabs */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
                        <div>
                            <span className="text-gold-400 font-bold text-xs tracking-widest uppercase mb-2 block">OUR PROJECTS</span>
                            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-3">Featured Projects</h2>
                            <p className="text-gray-400 text-sm md:text-base max-w-lg">
                                Explore our handpicked premium projects designed for modern luxury living.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                            {/* Tabs */}
                            <div className="flex bg-[#0A1220] p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                                {[
                                    { key: 'all', label: 'All Projects' },
                                    { key: 'ongoing', label: 'Ongoing' },
                                    { key: 'completed', label: 'Completed' },
                                    { key: 'upcoming', label: 'Upcoming' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setFilter(tab.key)}
                                        className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${filter === tab.key
                                            ? 'bg-gold-400 text-black shadow-lg shadow-gold-400/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search & Filter */}
                            <div className="flex gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search projects..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A1220] border border-gray-800 text-white placeholder-gray-500 text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                                    />
                                </div>
                                <button className="p-3 rounded-xl bg-[#0A1220] border border-gray-800 text-gray-400 hover:text-white hover:border-gold-400 transition-all flex-shrink-0">
                                    <FiFilter size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.length > 0 ? (
                            filtered
                                .sort((a, b) => {
                                    if (a._id === settings.highlightedProjectId) return -1;
                                    if (b._id === settings.highlightedProjectId) return 1;
                                    return 0;
                                })
                                .slice(0, 6).map((p, i) => (
                                    <ProjectCard
                                        key={p._id}
                                        project={p}
                                        index={i}
                                        isHighlighted={p._id === settings.highlightedProjectId}
                                        compareSelected={compareIds}
                                        onToggleCompare={handleToggleCompare}
                                    />
                                ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-[#0A1220] rounded-2xl border border-gray-800">
                                <p className="text-gray-400 text-lg">No projects match your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* BOTTOM STATS BAR */}
            <section className="pb-20 px-4 bg-[#050B14]">
                <div className="max-w-[1536px] mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-[#0A1220] border border-gray-800 rounded-2xl p-8 lg:p-10 divide-x divide-gray-800">
                        <div className="flex items-center justify-center gap-4 px-2">
                            <div className="text-gold-400 text-3xl"><FiLayers /></div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">25+</h3>
                                <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">Years of Excellence</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 px-2">
                            <div className="text-gold-400 text-3xl"><FiAward /></div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">15+</h3>
                                <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">Projects Completed</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 px-2">
                            <div className="text-gold-400 text-3xl"><FiShield /></div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">5000+</h3>
                                <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">Happy Families</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 px-2">
                            <div className="text-gold-400 text-3xl"><FiAward /></div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">100%</h3>
                                <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">Customer Satisfaction</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Compare Bar */}
            <AnimatePresence>
                {compareIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 w-full lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-11/12 lg:max-w-lg z-[100]"
                    >
                        <div className="bg-[#0A1220] lg:rounded-2xl shadow-2xl border-t lg:border border-gold-400/30 px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-2 pb-[calc(12px+env(safe-area-inset-bottom))] lg:pb-4">
                            <div className="flex items-center gap-2 lg:gap-3">
                                <FiLayers className="w-4 h-4 lg:w-5 lg:h-5 text-gold-400" />
                                <span className="text-xs lg:text-sm font-medium text-white whitespace-nowrap">
                                    {compareIds.length}/2 Compare
                                </span>
                            </div>
                            <div className="flex items-center gap-2 lg:gap-3">
                                <button
                                    onClick={() => setCompareIds([])}
                                    className="text-xs text-gray-400 hover:text-white transition-colors px-2"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={openCompare}
                                    disabled={compareIds.length !== 2}
                                    className="px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl bg-[#d4a843] text-black text-xs lg:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c4952e] transition-colors whitespace-nowrap"
                                >
                                    Compare Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Compare Modal */}
            {showCompare && (
                <CompareModal
                    projects={compareProjects}
                    onClose={() => { setShowCompare(false); setCompareIds([]); }}
                />
            )}

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
