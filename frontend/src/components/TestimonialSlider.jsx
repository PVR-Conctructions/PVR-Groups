import React from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const testimonials = [
    { name: 'Rajesh Kumar', role: 'Homeowner', rating: 5, text: 'PVR Groups delivered our dream home with exceptional quality. The attention to detail and luxurious amenities exceeded our expectations. Highly recommended!' },
    { name: 'Priya Sharma', role: 'Investor', rating: 5, text: 'As an investor, I have worked with many builders. PVR Groups stands out for their transparency, timely delivery, and premium quality construction.' },
    { name: 'Suresh Reddy', role: 'Homeowner', rating: 5, text: 'The clubhouse and swimming pool facilities are world-class. Living in a PVR Groups property feels like a five-star experience every day.' },
    { name: 'Lakshmi Devi', role: 'Homeowner', rating: 4, text: 'We chose PVR Groups for their reputation and they did not disappoint. The 24/7 security and power backup give us complete peace of mind.' },
    { name: 'Anil Prasad', role: 'Business Owner', rating: 5, text: 'The location, amenities, and build quality of PVR Groups projects are unmatched in Vijayawada. A truly premium living experience.' },
];

const TestimonialSlider = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <Slider {...settings}>
                {testimonials.map((t, i) => (
                    <div key={i} className="px-3">
                        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-border h-full">
                            <div className="flex mb-3">
                                {[...Array(5)].map((_, j) => (
                                    <FiStar key={j} size={16} className={j < t.rating ? 'text-gold-400 fill-gold-400' : 'text-gray-300'} />
                                ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{t.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </motion.div>
    );
};

export default TestimonialSlider;
