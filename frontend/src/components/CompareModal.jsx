import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiHome, FiDollarSign, FiGrid, FiCheckCircle, FiStar } from 'react-icons/fi';

const CompareModal = ({ projects, onClose }) => {
    if (!projects || projects.length !== 2) return null;

    const fields = [
        { label: 'Price', icon: FiDollarSign, key: 'price', fallback: 'N/A' },
        { label: 'Area', icon: FiGrid, key: 'area', fallback: 'N/A' },
        { label: 'Units', icon: FiHome, key: 'units', fallback: 'N/A' },
        { label: 'Status', icon: FiCheckCircle, key: 'status', fallback: 'N/A' },
        { label: 'Location', icon: FiMapPin, key: 'location', isNested: true, nestedKey: 'address', fallback: 'N/A' },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-gray-100 dark:border-dark-border shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border p-6 flex items-center justify-between z-10">
                        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                            Compare <span className="text-gold-gradient">Projects</span>
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border text-gray-400 transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Project Headers */}
                    <div className="grid grid-cols-3 gap-4 p-6 pb-0">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">Feature</div>
                        {projects.map((p) => (
                            <div key={p._id} className="text-center">
                                <img
                                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300'}
                                    alt={p.name}
                                    className="w-full h-32 object-cover rounded-xl mb-3"
                                />
                                <h3 className="font-heading font-bold text-gray-900 dark:text-white text-sm">{p.name}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Comparison Rows */}
                    <div className="p-6 space-y-0">
                        {fields.map((field, i) => (
                            <div key={field.key} className={`grid grid-cols-3 gap-4 py-4 ${i !== fields.length - 1 ? 'border-b border-gray-100 dark:border-dark-border' : ''}`}>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                    <field.icon size={16} className="text-gold-400" />
                                    {field.label}
                                </div>
                                {projects.map((p) => {
                                    const value = field.isNested
                                        ? p[field.key]?.[field.nestedKey]
                                        : p[field.key];
                                    return (
                                        <div key={p._id} className="text-center text-sm text-gray-800 dark:text-gray-200 font-medium">
                                            {field.key === 'status' ? (
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${value === 'ongoing'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                                        : 'bg-gold-100 text-gold-700 dark:bg-gold-400/20 dark:text-gold-400'
                                                    }`}>
                                                    {value || field.fallback}
                                                </span>
                                            ) : (
                                                value || field.fallback
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Amenities comparison */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100 dark:border-dark-border">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                <FiStar size={16} className="text-gold-400" />
                                Amenities
                            </div>
                            {projects.map((p) => (
                                <div key={p._id} className="text-center">
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {(p.amenities || []).slice(0, 5).map((a, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-border rounded-full text-xs text-gray-600 dark:text-gray-300">
                                                {a.icon} {a.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Highlights */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100 dark:border-dark-border">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                <FiCheckCircle size={16} className="text-gold-400" />
                                Highlights
                            </div>
                            {projects.map((p) => (
                                <div key={p._id} className="text-center">
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {(p.highlights || []).map((h, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-gold-400/10 rounded-full text-xs text-gold-600 dark:text-gold-400 font-medium">
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CompareModal;
