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
            className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center z-50 hover:bg-green-600 transition-colors animate-pulse-gold"
        >
            <FaWhatsapp size={26} />
        </motion.a>
    );
};

export default WhatsAppButton;
