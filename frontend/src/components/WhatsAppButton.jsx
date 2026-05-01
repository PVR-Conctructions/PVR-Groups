import React from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
    return (
        <motion.a
            href="https://wa.me/987654321?text=Hi%20PVR%20Groups!%20I'm%20interested%20in%20your%20projects."
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-[120px] lg:bottom-[105px] right-4 lg:right-5 w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center z-[90] hover:bg-green-600 transition-colors animate-pulse-gold"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
            <FaWhatsapp size={24} className="w-[20px] h-[20px] lg:w-[26px] lg:h-[26px]" />
        </motion.a>
    );
};

export default WhatsAppButton;
