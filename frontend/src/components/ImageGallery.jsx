import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { cloudinaryGallery, cloudinaryThumb, cloudinaryLightbox, cloudinarySrcSet } from '../utils/cloudinary';

const placeholderImages = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
];

const ImageGallery = ({ images, categorizedImages }) => {
    const hasCategories = categorizedImages && categorizedImages.length > 0;
    
    // Build a flattened array of rich image objects
    const allImageData = [];
    if (hasCategories) {
        categorizedImages.forEach(group => {
            group.urls.forEach(url => {
                allImageData.push({ url, category: group.category, label: group.label });
            });
        });
    } else {
        const flatImages = images?.length ? images : placeholderImages;
        flatImages.forEach(url => allImageData.push({ url, category: 'General', label: '' }));
    }

    const uniqueCategories = [...new Set(allImageData.map(img => img.category).filter(c => c !== 'General'))];
    const categories = uniqueCategories.length > 0 ? ['All', ...uniqueCategories] : [];
    
    const [activeTab, setActiveTab] = useState('All');
    const [current, setCurrent] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    const filteredImages = activeTab === 'All' 
        ? allImageData 
        : allImageData.filter(img => img.category === activeTab);

    // Reset current image index when changing tabs to avoid out-of-bounds
    useEffect(() => {
        setCurrent(0);
    }, [activeTab]);

    const next = () => setCurrent((prev) => (prev + 1) % filteredImages.length);
    const prev = () => setCurrent((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);

    if (filteredImages.length === 0) return null;

    const currentImg = filteredImages[current];

    return (
        <div className="space-y-4">
            {/* Category Tabs */}
            {categories.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                activeTab === cat 
                                    ? 'bg-gold-400 text-white shadow-md' 
                                    : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:border-gold-400/50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Slider */}
            <div className="relative rounded-2xl overflow-hidden group bg-gray-100 dark:bg-dark-card border border-gray-100 dark:border-dark-border">
                <div className="aspect-video relative">
                    <img
                        src={cloudinaryGallery(currentImg.url)}
                        srcSet={cloudinarySrcSet(currentImg.url, [1920, 2560, 3840])}
                        sizes="100vw"
                        alt={`${currentImg.category} - ${currentImg.label}`}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
                        onClick={() => setLightbox(true)}
                        loading="lazy"
                    />
                    
                    {/* Image Label Overlay */}
                    {currentImg.label && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 shadow-lg flex items-center gap-2 pointer-events-none">
                            <span className="text-gold-400 text-xs uppercase tracking-wider font-bold">{currentImg.category}</span>
                            <span className="w-1 h-1 rounded-full bg-white/30"></span>
                            <span>{currentImg.label}</span>
                        </div>
                    )}
                </div>

                {filteredImages.length > 1 && (
                    <>
                        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110">
                            <FiChevronLeft size={22} />
                        </button>
                        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110">
                            <FiChevronRight size={22} />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/20 backdrop-blur-md px-3 py-2 rounded-full">
                            {filteredImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-gold-400 w-6' : 'bg-white/50 hover:bg-white/80 w-1.5'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {filteredImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                    {filteredImages.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all relative ${
                                i === current ? 'border-gold-400 scale-[1.02] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img
                                src={cloudinaryThumb(img.url)}
                                srcSet={cloudinarySrcSet(img.url, [300, 600])}
                                sizes="96px"
                                alt={`Thumb ${i + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
                        onClick={() => setLightbox(false)}
                    >
                        {/* Lightbox Header with Label */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                                {currentImg.label && (
                                    <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                                        <span className="text-gold-400 mr-2 uppercase text-xs font-bold tracking-wider">{currentImg.category}</span>
                                        {currentImg.label}
                                    </div>
                                )}
                                <span className="text-white/50 text-sm">
                                    {current + 1} / {filteredImages.length}
                                </span>
                            </div>
                            <button onClick={() => setLightbox(false)} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                                <FiX size={28} />
                            </button>
                        </div>

                        {filteredImages.length > 1 && (
                            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-10 hidden md:block">
                                <FiChevronLeft size={36} />
                            </button>
                        )}
                        
                        <motion.img 
                            key={currentImg.url}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            src={cloudinaryLightbox(currentImg.url)}
                            srcSet={cloudinarySrcSet(currentImg.url, [1920, 2560, 3840])}
                            sizes="100vw"
                            alt="" 
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                            onClick={(e) => e.stopPropagation()}
                            loading="lazy"
                        />
                        
                        {filteredImages.length > 1 && (
                            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-10 hidden md:block">
                                <FiChevronRight size={36} />
                            </button>
                        )}

                        {/* Mobile Navigation Controls */}
                        {filteredImages.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 md:hidden z-10 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10" onClick={(e) => e.stopPropagation()}>
                                <button onClick={prev} className="text-white"><FiChevronLeft size={28} /></button>
                                <span className="text-white font-medium">{current + 1} / {filteredImages.length}</span>
                                <button onClick={next} className="text-white"><FiChevronRight size={28} /></button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageGallery;
