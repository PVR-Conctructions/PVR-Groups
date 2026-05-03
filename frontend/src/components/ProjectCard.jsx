import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiArrowRight, FiHeart, FiCheckSquare, FiSquare, FiBox } from 'react-icons/fi';
import api from '../hooks/useApi';
import CdnImage from './CdnImage';

// Global cache to prevent 20 cards from making 20 API calls
let favCachePromise = null;

const ProjectCard = ({ project, index, compareSelected = [], onToggleCompare, showCompare = false, isHighlighted = false }) => {
    const [isFav, setIsFav] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    useEffect(() => {
        const fetchFavs = async () => {
            if (!favCachePromise) {
                favCachePromise = api.get('/favorites').then(res => res.data.map(f => f._id)).catch(() => []);
            }
            const favIds = await favCachePromise;
            setIsFav(favIds.includes(project._id));
        };
        fetchFavs();
    }, [project._id]);

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFavLoading(true);
        try {
            if (isFav) {
                await api.delete(`/favorites/${project._id}`);
                setIsFav(false);
            } else {
                await api.post(`/favorites/${project._id}`);
                setIsFav(true);
            }
        } catch (err) {
            console.error('Favorite toggle failed');
        }
        setFavLoading(false);
    };

    const isCompared = compareSelected?.includes(project._id);

    const handleCompareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleCompare) onToggleCompare(project._id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`card-hover group w-full min-w-0 ${isHighlighted ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-[#050B14] shadow-[0_0_20px_rgba(212,168,67,0.3)] rounded-2xl' : ''}`}
        >
            <Link to={`/projects/${project._id}`}>
                <div className={`bg-[#0A1220] rounded-2xl overflow-hidden shadow-xl border transition-colors flex flex-col h-full ${isHighlighted ? 'border-gold-400' : 'border-gray-800 hover:border-gold-400/50'}`}>
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden flex-shrink-0">
                        <CdnImage
                            src={project.images?.[0]}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                        />
                        <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${project.status === 'ongoing'
                                ? 'bg-green-500/90 text-white'
                                : project.status === 'upcoming' 
                                ? 'bg-blue-500/90 text-white'
                                : 'bg-gold-400/90 text-black'
                                }`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                {project.status === 'ongoing' ? 'Ongoing' : project.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                            </span>
                        </div>

                        {/* Favorite button */}
                        <button
                            onClick={toggleFavorite}
                            disabled={favLoading}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all duration-200 z-10"
                        >
                            <FiHeart
                                size={14}
                                className={`transition-colors ${isFav ? 'fill-gold-400 text-gold-400' : 'text-white'}`}
                            />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col min-w-0">
                        <h3 className="text-lg font-heading font-bold text-white mb-1 group-hover:text-gold-400 transition-colors truncate min-w-0">
                            {project.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4 min-w-0">
                            <FiMapPin size={12} className="text-gold-400 flex-shrink-0" />
                            <span className="truncate flex-1 min-w-0">{project.location?.address || 'Vijayawada'}</span>
                        </div>
                        
                        {/* Amenities mockup since it's in the design */}
                        <div className="flex items-center flex-wrap gap-y-2 gap-x-3 text-xs text-gray-400 mb-6">
                            <div className="flex items-center gap-1.5"><span className="text-gold-400">⌘</span> Clubhouse</div>
                            <div className="flex items-center gap-1.5"><span className="text-gold-400">≈</span> Pool</div>
                            <div className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">+8</div>
                        </div>

                        <div className="mt-auto min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-4 min-w-0">
                                <span className="text-gold-400 font-bold text-base truncate flex-1 min-w-0">{project.price || 'Contact for Price'}</span>
                                <span className="flex items-center flex-shrink-0 text-xs text-gold-400 font-medium group-hover:translate-x-1 transition-transform">
                                    View Details <FiArrowRight className="ml-1" size={12} />
                                </span>
                            </div>

                            {/* Bottom Actions Bar */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-800 gap-2">
                                <button
                                    onClick={handleCompareClick}
                                    className={`flex items-center flex-shrink-0 gap-2 text-xs font-medium transition-colors ${isCompared ? 'text-gold-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {isCompared ? <FiCheckSquare size={16} /> : <FiSquare size={16} />}
                                    Compare
                                </button>
                                
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Handle virtual tour click if needed
                                    }}
                                    className="flex items-center flex-shrink-0 gap-2 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 text-xs hover:border-gold-400 hover:text-gold-400 transition-colors"
                                >
                                    <FiBox size={14} /> Virtual Tour
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProjectCard;
