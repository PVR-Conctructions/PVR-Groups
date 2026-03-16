import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiArrowRight, FiHeart, FiCheckSquare, FiSquare } from 'react-icons/fi';
import api from '../hooks/useApi';
import { optimizeCloudinaryUrl, cloudinarySrcSet } from '../utils/cloudinary';

const ProjectCard = ({ project, index, compareSelected = [], onToggleCompare, showCompare = false }) => {
    const [isFav, setIsFav] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    useEffect(() => {
        api.get('/favorites').then(res => {
            const favIds = res.data.map(f => f._id);
            setIsFav(favIds.includes(project._id));
        }).catch(() => { });
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

    const isCompared = compareSelected.includes(project._id);

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
            className="card-hover group"
        >
            <Link to={`/projects/${project._id}`}>
                <div className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-dark-border">
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                        <img
                            src={optimizeCloudinaryUrl(project.images?.[0], 600) || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600'}
                            srcSet={cloudinarySrcSet(project.images?.[0])}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                        />
                        <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'ongoing'
                                ? 'bg-green-500/90 text-white'
                                : 'bg-gold-400/90 text-white'
                                }`}>
                                {project.status === 'ongoing' ? '🏗 Ongoing' : '✅ Completed'}
                            </span>
                        </div>

                        {/* Favorite button */}
                        <button
                            onClick={toggleFavorite}
                            disabled={favLoading}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all duration-200 z-10"
                        >
                            <FiHeart
                                size={18}
                                className={`transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`}
                                style={isFav ? { fill: '#ef4444' } : {}}
                            />
                        </button>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gold-400 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {project.description}
                        </p>
                        {project.location?.address && (
                            <div className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 text-xs mb-4">
                                <FiMapPin size={14} className="text-gold-400" />
                                <span>{project.location.address}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            {project.price && (
                                <span className="text-gold-400 font-semibold text-sm">{project.price}</span>
                            )}
                            <span className="flex items-center text-sm text-primary-600 dark:text-gold-400 font-medium group-hover:translate-x-1 transition-transform">
                                View Details <FiArrowRight className="ml-1" size={14} />
                            </span>
                        </div>

                        {/* Compare checkbox */}
                        {showCompare && (
                            <button
                                onClick={handleCompareClick}
                                className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${isCompared
                                        ? 'border-gold-400 bg-gold-400/10 text-gold-400'
                                        : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-gold-400 hover:text-gold-400'
                                    }`}
                            >
                                {isCompared ? <FiCheckSquare size={14} /> : <FiSquare size={14} />}
                                {isCompared ? 'Selected for Compare' : 'Compare'}
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProjectCard;
