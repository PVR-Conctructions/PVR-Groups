import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const placeholderImages = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
];

const ImageGallery = ({ images }) => {
    const gallery = images?.length ? images : placeholderImages;
    const [current, setCurrent] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    const next = () => setCurrent((prev) => (prev + 1) % gallery.length);
    const prev = () => setCurrent((prev) => (prev - 1 + gallery.length) % gallery.length);

    return (
        <>
            {/* Main Slider */}
            <div className="relative rounded-2xl overflow-hidden group">
                <div className="aspect-video">
                    <img
                        src={gallery[current]}
                        alt={`Project image ${current + 1}`}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-500"
                        onClick={() => setLightbox(true)}
                    />
                </div>

                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                    <FiChevronLeft size={20} />
                </button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                    <FiChevronRight size={20} />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                    {gallery.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-gold-400 w-6' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Thumbnails */}
            <div className="flex space-x-2 mt-3 overflow-x-auto pb-2">
                {gallery.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-gold-400' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                    >
                        <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setLightbox(false)}
                    >
                        <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-lg">
                            <FiX size={24} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-lg">
                            <FiChevronLeft size={32} />
                        </button>
                        <img src={gallery[current]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                        <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-lg">
                            <FiChevronRight size={32} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ImageGallery;
