import React from 'react';
import { motion } from 'framer-motion';
import { FiFilm, FiHome, FiShield, FiDroplet, FiTruck, FiActivity, FiZap, FiWifi } from 'react-icons/fi';

const iconMap = {
    'Theater': FiFilm,
    'Clubhouse': FiHome,
    'Security': FiShield,
    'Swimming Pool': FiDroplet,
    'Parking': FiTruck,
    'Gym': FiActivity,
    'Power Backup': FiZap,
    'Wi-Fi': FiWifi,
};

const defaultAmenities = [
    { name: 'Theater', icon: 'Theater' },
    { name: 'Clubhouse', icon: 'Clubhouse' },
    { name: '24/7 Security', icon: 'Security' },
    { name: 'Swimming Pool', icon: 'Swimming Pool' },
    { name: 'Parking', icon: 'Parking' },
    { name: 'Gym', icon: 'Gym' },
    { name: 'Power Backup', icon: 'Power Backup' },
    { name: 'Wi-Fi', icon: 'Wi-Fi' },
];

const AmenitiesGrid = ({ amenities }) => {
    const items = amenities?.length ? amenities : defaultAmenities;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((amenity, i) => {
                const Icon = iconMap[amenity.icon] || FiHome;
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border hover:border-gold-400/50 transition-all duration-300 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center mb-3 group-hover:bg-gold-400/20 transition-colors">
                            <Icon size={22} className="text-gold-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">{amenity.name}</span>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default AmenitiesGrid;
