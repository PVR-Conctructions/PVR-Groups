import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import { FiPlay, FiCamera } from 'react-icons/fi';

const VirtualTourPage = () => {
    const tours = [
        { name: 'Raintree Park Residency', desc: 'Explore our flagship luxury apartments with panoramic views', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600' },
        { name: 'PVR Grand Heights', desc: 'Walk through spacious 3 & 4 BHK apartments with world-class amenities', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600' },
        { name: 'PVR Business Tower', desc: 'Modern commercial spaces designed for the future of work', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600' },
    ];

    return (
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors">
            <Navbar />

            <HeroBanner
                title={<>Virtual <span className="text-gold-gradient">Tour</span></>}
                subtitle="Experience our projects from the comfort of your home"
            />

            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tours.map((tour, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group cursor-pointer"
                            >
                                <div className="relative rounded-2xl overflow-hidden">
                                    <img src={tour.img} alt={tour.name} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="w-16 h-16 rounded-full bg-gold-400/90 flex items-center justify-center shadow-lg"
                                        >
                                            <FiPlay size={24} className="text-white ml-1" />
                                        </motion.div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <h3 className="text-lg font-heading font-bold text-white mb-1">{tour.name}</h3>
                                        <p className="text-gray-300 text-sm">{tour.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4">
                            <FiCamera size={28} className="text-gold-400" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">360° Virtual Tours Coming Soon</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                            We're working on immersive 360° virtual tours for all our projects. Stay tuned for an amazing virtual experience!
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default VirtualTourPage;
