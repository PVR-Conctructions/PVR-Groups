import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX, FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
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
    const [zoomScale, setZoomScale] = useState(1);

    // Touch/swipe state for main gallery
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const isDragging = useRef(false);
    const minSwipeDistance = 40;

    // Touch/swipe state for lightbox
    const lbTouchStartX = useRef(null);
    const lbTouchStartY = useRef(null);

    const filteredImages = activeTab === 'All'
        ? allImageData
        : allImageData.filter(img => img.category === activeTab);

    // Reset current image index when changing tabs
    useEffect(() => {
        setCurrent(0);
    }, [activeTab]);

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % filteredImages.length);
        setZoomScale(1);
    }, [filteredImages.length]);

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
        setZoomScale(1);
    }, [filteredImages.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightbox) return;
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'Escape') setLightbox(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox, next, prev]);

    // ── Main gallery swipe handlers ──────────────────────────────────────────
    const onMainTouchStart = (e) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
        isDragging.current = false;
    };

    const onMainTouchMove = (e) => {
        if (touchStartX.current === null) return;
        const dx = Math.abs(e.targetTouches[0].clientX - touchStartX.current);
        const dy = Math.abs(e.targetTouches[0].clientY - touchStartY.current);
        // Determine horizontal drag intent early so we can prevent page scroll
        if (dx > dy && dx > 10) {
            isDragging.current = true;
            e.preventDefault(); // prevent vertical page scroll while swiping image
        }
    };

    const onMainTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const endX = e.changedTouches[0].clientX;
        const distance = touchStartX.current - endX;
        if (Math.abs(distance) >= minSwipeDistance) {
            if (distance > 0) next();
            else prev();
        }
        touchStartX.current = null;
        touchStartY.current = null;
        isDragging.current = false;
    };

    // ── Lightbox swipe handlers ──────────────────────────────────────────────
    const onLbTouchStart = (e) => {
        lbTouchStartX.current = e.targetTouches[0].clientX;
        lbTouchStartY.current = e.targetTouches[0].clientY;
    };

    const onLbTouchEnd = (e) => {
        if (zoomScale > 1.05) return; // disable swipe when zoomed in
        if (lbTouchStartX.current === null) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = lbTouchStartX.current - endX;
        const dy = Math.abs(lbTouchStartY.current - endY);
        // Only treat as horizontal swipe if X movement > Y movement
        if (Math.abs(dx) > dy && Math.abs(dx) >= minSwipeDistance) {
            if (dx > 0) next();
            else prev();
        }
        lbTouchStartX.current = null;
    };

    if (filteredImages.length === 0) return null;

    const currentImg = filteredImages[current];
    const showDots = filteredImages.length > 1 && filteredImages.length <= 12;
    const showCounter = filteredImages.length > 12;

    return (
        <div className="space-y-3 w-full max-w-full overflow-hidden">
            {/* Category Tabs */}
            {categories.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar w-full mt-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === cat
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
            <div
                className="relative rounded-2xl overflow-hidden group bg-gray-100 dark:bg-dark-card border border-gray-100 dark:border-dark-border w-full select-none shadow-sm"
                onTouchStart={onMainTouchStart}
                onTouchMove={onMainTouchMove}
                onTouchEnd={onMainTouchEnd}
                style={{ touchAction: 'pan-y' }}
            >

                <div className="h-[220px] sm:h-[300px] lg:h-[420px] relative w-full">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.img
                            key={currentImg.url}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25 }}
                            src={cloudinaryGallery(currentImg.url)}
                            srcSet={cloudinarySrcSet(currentImg.url, [1920, 2560, 3840])}
                            sizes="(max-width: 640px) 100vw, 66vw"
                            alt={`${currentImg.category} - ${currentImg.label}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setLightbox(true)}
                            loading="lazy"
                            draggable={false}
                        />
                    </AnimatePresence>

                    {/* Image Label Overlay */}
                    {currentImg.label && (
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 shadow-lg flex items-center gap-2 pointer-events-none">
                            <span className="text-gold-400 text-xs uppercase tracking-wider font-bold">{currentImg.category}</span>
                            <span className="w-1 h-1 rounded-full bg-white/30"></span>
                            <span>{currentImg.label}</span>
                        </div>
                    )}

                    {/* Counter (top-right) – always visible */}
                    {filteredImages.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10 pointer-events-none">
                            {current + 1} / {filteredImages.length}
                        </div>
                    )}
                </div>

                {/* Prev / Next arrows – always visible on mobile */}
                {filteredImages.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:bg-black/70 shadow-lg z-10"
                            aria-label="Previous image"
                        >
                            <FiChevronLeft size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); next(); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:bg-black/70 shadow-lg z-10"
                            aria-label="Next image"
                        >
                            <FiChevronRight size={20} />
                        </button>

                        {/* Dots indicator (only if ≤ 12 images) */}
                        {showDots && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                {filteredImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrent(i)}
                                        className={`rounded-full transition-all duration-300 flex-shrink-0 ${i === current ? 'bg-gold-400 w-5 h-1.5' : 'bg-white/60 w-1.5 h-1.5'}`}
                                        aria-label={`Go to image ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Text counter when many images */}
                        {showCounter && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/10 pointer-events-none">
                                {current + 1} / {filteredImages.length}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {filteredImages.length > 1 && (
                <div
                    className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar w-full"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {filteredImages.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`flex-shrink-0 min-w-[64px] w-[64px] h-[42px] sm:min-w-[90px] sm:w-[90px] sm:h-[58px] rounded-xl overflow-hidden border-2 transition-all ${
                                i === current ? 'border-gold-400 shadow-md opacity-100' : 'border-transparent opacity-55 hover:opacity-90'
                            }`}
                        >
                            <img
                                src={cloudinaryThumb(img.url)}
                                alt={`Thumb ${i + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                draggable={false}
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
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
                        onTouchStart={onLbTouchStart}
                        onTouchEnd={onLbTouchEnd}
                    >
                        {/* Lightbox Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-50">
                            <div className="flex items-center gap-3">
                                {currentImg.label && (
                                    <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 hidden sm:block">
                                        <span className="text-gold-400 mr-2 uppercase text-xs font-bold tracking-wider">{currentImg.category}</span>
                                        {currentImg.label}
                                    </div>
                                )}
                                <span className="text-white/70 text-sm font-medium bg-black/50 px-3 py-1 rounded-full border border-white/10">
                                    {current + 1} / {filteredImages.length}
                                </span>
                            </div>
                            <button onClick={() => setLightbox(false)} className="text-white p-2 bg-black/50 border border-white/10 hover:bg-white/10 rounded-full transition-colors">
                                <FiX size={22} />
                            </button>
                        </div>

                        {/* Desktop arrow buttons */}
                        {filteredImages.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); prev(); }}
                                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-50 hidden sm:flex bg-black/30 backdrop-blur-md border border-white/10"
                            >
                                <FiChevronLeft size={28} />
                            </button>
                        )}

                        <div className="w-full h-full flex items-center justify-center pt-16 pb-20">
                            <TransformWrapper
                                initialScale={1}
                                minScale={1}
                                maxScale={4}
                                centerOnInit={true}
                                wheel={{ step: 0.1 }}
                                onTransformed={(ref) => setZoomScale(ref.state.scale)}
                            >
                                {({ zoomIn, zoomOut, resetTransform }) => (
                                    <React.Fragment>
                                        <TransformComponent wrapperStyle={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                                            <motion.img
                                                key={currentImg.url}
                                                initial={{ opacity: 0, scale: 0.96 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                                src={cloudinaryLightbox(currentImg.url)}
                                                srcSet={cloudinarySrcSet(currentImg.url, [1920, 2560, 3840])}
                                                sizes="100vw"
                                                alt=""
                                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl mx-auto"
                                                loading="lazy"
                                                draggable={false}
                                            />
                                        </TransformComponent>

                                        {/* Zoom Controls */}
                                        <div className="absolute right-4 bottom-24 sm:bottom-10 flex flex-col gap-2 z-50">
                                            <button onClick={() => zoomIn()} className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors" title="Zoom In">
                                                <FiZoomIn size={18} />
                                            </button>
                                            <button onClick={() => zoomOut()} className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors" title="Zoom Out">
                                                <FiZoomOut size={18} />
                                            </button>
                                            <button onClick={() => resetTransform()} className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors" title="Reset Zoom">
                                                <FiMaximize size={18} />
                                            </button>
                                        </div>
                                    </React.Fragment>
                                )}
                            </TransformWrapper>
                        </div>

                        {filteredImages.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); next(); }}
                                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-50 hidden sm:flex bg-black/30 backdrop-blur-md border border-white/10"
                            >
                                <FiChevronRight size={28} />
                            </button>
                        )}

                        {/* Mobile bottom navigation bar */}
                        {filteredImages.length > 1 && (
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center justify-between w-[85%] sm:hidden z-50 bg-black/60 backdrop-blur-md px-4 py-3 rounded-full border border-white/10">
                                <button onClick={prev} className="text-white p-2 hover:bg-white/20 rounded-full active:scale-95 transition-transform">
                                    <FiChevronLeft size={22} />
                                </button>
                                <span className="text-white/70 text-xs font-medium">Swipe or tap arrows</span>
                                <button onClick={next} className="text-white p-2 hover:bg-white/20 rounded-full active:scale-95 transition-transform">
                                    <FiChevronRight size={22} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageGallery;
