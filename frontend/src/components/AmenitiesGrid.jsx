import React from 'react';
import { motion } from 'framer-motion';
import {
    FiDroplet, FiActivity, FiHome, FiMonitor, FiSun, FiShield, FiVideo,
    FiZap, FiTruck, FiWifi, FiPackage, FiDollarSign, FiHeart, FiSmile,
    FiTarget, FiFlag, FiAward, FiCloud, FiFeather, FiClock, FiSettings,
    FiPlay, FiBox, FiBattery, FiTrash2, FiCircle, FiStar, FiCrosshair
} from 'react-icons/fi';

const iconMap = {
    'Swimming Pool': FiDroplet,
    'Gym / Fitness Center': FiActivity,
    'Clubhouse': FiHome,
    'Indoor Games': FiMonitor,
    'Jogging Track': FiSun,
    'Yoga & Meditation': FiFeather,
    'Party Hall': FiAward,
    'Mini Theater': FiPlay,
    'Parking': FiTruck,
    'EV Charging Station': FiBattery,
    'Elevator / Lift': FiBox,
    'Shopping Complex': FiPackage,
    'ATM': FiDollarSign,
    'Pharmacy': FiHeart,
    'Laundry Service': FiSettings,
    'Intercom Facility': FiWifi,
    '24/7 Security': FiShield,
    'CCTV Surveillance': FiVideo,
    'Fire Safety System': FiZap,
    'Gated Community': FiTarget,
    'Landscaped Gardens': FiCloud,
    'Rainwater Harvesting': FiDroplet,
    'Solar Power': FiSun,
    'Sewage Treatment Plant': FiSmile,
    'Waste Management': FiTrash2,
    "Children's Play Area": FiSmile,
    'Basketball Court': FiCircle,
    'Tennis Court': FiCrosshair,
    'Cricket Pitch': FiFlag,
    'Badminton Court': FiStar,
};

const AmenitiesGrid = ({ amenities }) => {
    if (!amenities || amenities.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {amenities.map((amenity, i) => {
                const name = typeof amenity === 'string' ? amenity : amenity.name;
                const Icon = iconMap[name] || FiHome;
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
                        <span className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">{name}</span>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default AmenitiesGrid;
