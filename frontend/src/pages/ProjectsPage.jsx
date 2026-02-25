import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import ProjectCard from '../components/ProjectCard';
import CompareModal from '../components/CompareModal';
import api from '../hooks/useApi';
import { FiSearch, FiLayers } from 'react-icons/fi';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [compareIds, setCompareIds] = useState([]);
    const [compareProjects, setCompareProjects] = useState([]);
    const [showCompare, setShowCompare] = useState(false);

    useEffect(() => {
        api.get('/projects').then(res => {
            setProjects(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
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
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors">
            <Navbar />

            <HeroBanner
                title={<>Our <span className="text-gold-gradient">Projects</span></>}
                subtitle="Explore our portfolio of luxury residential and commercial developments"
            />

            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                        <div className="flex space-x-2">
                            {[
                                { key: 'all', label: 'All Projects' },
                                { key: 'ongoing', label: '🏗 Ongoing' },
                                { key: 'completed', label: '✅ Completed' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${filter === tab.key
                                        ? 'bg-gold-400 text-white shadow-lg shadow-gold-400/20'
                                        : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-72">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search projects..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white placeholder-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((p, i) => (
                                <ProjectCard
                                    key={p._id}
                                    project={p}
                                    index={i}
                                    showCompare={true}
                                    compareSelected={compareIds}
                                    onToggleCompare={handleToggleCompare}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No projects found</p>
                            <p className="text-gray-400 text-sm mt-2">Try changing your search or filter</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Floating Compare Bar */}
            <AnimatePresence>
                {compareIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
                    >
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border px-6 py-4 flex items-center gap-4">
                            <FiLayers size={20} className="text-gold-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {compareIds.length}/2 selected
                            </span>
                            <button
                                onClick={openCompare}
                                disabled={compareIds.length !== 2}
                                className="px-5 py-2 rounded-xl btn-shimmer text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Compare Now
                            </button>
                            <button
                                onClick={() => setCompareIds([])}
                                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                Clear
                            </button>
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
