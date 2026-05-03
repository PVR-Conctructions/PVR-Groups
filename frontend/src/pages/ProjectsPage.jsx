import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import CompareModal from '../components/CompareModal';
import api from '../hooks/useApi';
import { FiSearch, FiLayers, FiFilter, FiMapPin, FiAward, FiShield, FiHome, FiBriefcase } from 'react-icons/fi';
import { BsBuildings } from 'react-icons/bs';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [typeFilter, setTypeFilter] = useState('all'); // all, apartments, villas, commercial
    const [statusFilter, setStatusFilter] = useState('all'); // all, ongoing, under_construction, completed
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [compareIds, setCompareIds] = useState([]);
    const [compareProjects, setCompareProjects] = useState([]);
    const [showCompare, setShowCompare] = useState(false);
    const [settings, setSettings] = useState({ highlightedProjectId: null });

    useEffect(() => {
        api.get('/projects').then(res => {
            setProjects(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));

        api.get('/settings').then(res => {
            if (res.data) setSettings(res.data);
        }).catch(() => {});
    }, []);

    const filtered = projects.filter(p => {
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        // Mock type filtering since it might not be in schema, just an example
        const matchesType = typeFilter === 'all' || p.type === typeFilter; 
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
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
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40 lg:opacity-100 flex justify-end">
                    <img 
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop" 
                        alt="Luxury Villa" 
                        className="w-full lg:w-[60%] h-full object-cover object-left mask-image-gradient"
                        style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050B14] via-[#050B14]/90 to-transparent z-10 lg:w-[60%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent z-10" />
                </div>

                <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
                    <div className="max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex items-center gap-4 mb-4"
                        >
                            <span className="text-gold-400 font-bold text-xs tracking-widest uppercase">OUR PROJECTS</span>
                            <div className="h-px w-12 bg-gold-400/50"></div>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6"
                        >
                            Spaces Designed for <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600">Luxury Living</span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-gray-300 text-lg md:text-xl mb-10 max-w-lg font-light leading-relaxed"
                        >
                            Explore our portfolio of premium residential and commercial developments crafted for a superior lifestyle.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4"
                        >
                            <div className="flex items-center gap-3">
                                <FiMapPin className="text-gold-400 text-2xl" />
                                <div>
                                    <h4 className="text-white font-bold text-sm">Prime Locations</h4>
                                    <p className="text-gray-400 text-xs">Best Connectivity</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiAward className="text-gold-400 text-2xl" />
                                <div>
                                    <h4 className="text-white font-bold text-sm">World Class Amenities</h4>
                                    <p className="text-gray-400 text-xs">Luxury at its Best</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiShield className="text-gold-400 text-2xl" />
                                <div>
                                    <h4 className="text-white font-bold text-sm">Trusted & Reliable</h4>
                                    <p className="text-gray-400 text-xs">Quality You Can Trust</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* PROJECTS CONTENT */}
            <section className="py-12 px-4 bg-[#050B14]">
                <div className="max-w-[1536px] mx-auto">
                    {/* Advanced Filter Bar */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12 bg-[#0A1220] p-4 rounded-2xl border border-gray-800">
                        
                        {/* Type Tabs */}
                        <div className="flex gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar">
                            {[
                                { key: 'all', label: 'All Projects', icon: <FiLayers className="mr-2" /> },
                                { key: 'apartments', label: 'Apartments', icon: <BsBuildings className="mr-2" /> },
                                { key: 'villas', label: 'Villas', icon: <FiHome className="mr-2" /> },
                                { key: 'commercial', label: 'Commercial', icon: <FiBriefcase className="mr-2" /> },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setTypeFilter(tab.key)}
                                    className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${typeFilter === tab.key
                                        ? 'bg-gold-400/20 text-gold-400 border border-gold-400/50'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Status Tabs */}
                        <div className="flex bg-[#121C2D] p-1.5 rounded-xl gap-1 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-1 hide-scrollbar">
                            {[
                                { key: 'all', label: 'All', color: 'bg-white' },
                                { key: 'ongoing', label: 'Ongoing', color: 'bg-green-500' },
                                { key: 'under_construction', label: 'Under Construction', color: 'bg-gold-400' },
                                { key: 'completed', label: 'Completed', color: 'bg-blue-500' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setStatusFilter(tab.key)}
                                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${statusFilter === tab.key
                                        ? 'bg-[#1E293B] text-white shadow-sm border border-gray-700'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full mr-2 ${tab.color}`}></div>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Filter */}
                        <div className="flex gap-3 w-full xl:w-auto">
                            <div className="relative w-full xl:w-72">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search projects, locations..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121C2D] border border-gray-800 text-white placeholder-gray-500 text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#121C2D] border border-gray-800 text-gray-300 hover:text-white hover:border-gold-400 transition-all flex-shrink-0 text-sm font-medium">
                                <FiFilter size={16} /> Filters
                            </button>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered
                                .sort((a, b) => {
                                    if (a._id === settings.highlightedProjectId) return -1;
                                    if (b._id === settings.highlightedProjectId) return 1;
                                    return 0;
                                })
                                .map((p, i) => (
                                <ProjectCard
                                    key={p._id}
                                    project={p}
                                    index={i}
                                    isHighlighted={p._id === settings.highlightedProjectId}
                                    compareSelected={compareIds}
                                    onToggleCompare={handleToggleCompare}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[#0A1220] rounded-2xl border border-gray-800">
                            <p className="text-gray-400 text-lg">No projects found matching your criteria.</p>
                            <button onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setSearch(''); }} className="mt-4 text-gold-400 hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>
            </section>

            {/* BOTTOM STATS BAR */}
            <section className="py-20 px-4 bg-[#050B14]">
                <div className="max-w-[1536px] mx-auto border-t border-gray-800 pt-16">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-gray-800">
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
                                    className="px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl bg-gold-400 text-black text-xs lg:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-500 transition-colors whitespace-nowrap"
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
        </div>
    );
};

export default ProjectsPage;
