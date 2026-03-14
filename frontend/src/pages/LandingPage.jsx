import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const handleEnter = () => {
        navigate(user ? '/home' : '/login');
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-sans overflow-x-hidden">
            {/* HERO SECTION */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/images/landing/owner_hero_bg.png" 
                        alt="Bandi Pavan Kumar - Owner of PVR Constructions" 
                        className="w-full h-full object-cover object-top opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-[#0a0a0f]/30 mix-blend-multiply" />
                    
                    {/* Glowing Particles Background Overlay */}
                    <div className="absolute inset-0 z-0 bg-[url('/images/landing/particles.png')] opacity-30 mix-blend-screen bg-cover animate-pulse" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col items-center text-center mt-[40vh] px-4">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-bold mb-4 tracking-wide"
                    >
                        <span className="text-white">PVR </span>
                        <span className="text-[#deb868]">Constructions</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-300 font-light tracking-wider mb-12"
                    >
                        Building Dreams with Strength and Trust
                    </motion.p>
                    
                    {/* Enter Button replacing the simple arrow */}
                     <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEnter}
                        className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-[#deb868] to-[#b38e45] text-[#0a0a0f] font-bold text-lg tracking-widest uppercase overflow-hidden shadow-[0_0_30px_rgba(222,184,104,0.3)] transition-all hover:shadow-[0_0_50px_rgba(222,184,104,0.5)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Enter Website
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    </motion.button>
                </div>
            </section>

            {/* SEPARATOR LINE */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50" />
            </div>

            {/* ABOUT THE OWNER SECTION */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-10 tracking-wide">
                    About the Owner
                </motion.h2>
                
                <div className="flex flex-col md:flex-row gap-10 items-center bg-[#12121a]/50 p-8 rounded-3xl border border-gray-800/50 backdrop-blur-sm">
                    <motion.div {...fadeInUp} className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-gray-700">
                        {/* Using a cropped version of the hero image for the portrait or the hero itself centered */}
                        <img 
                            src="/images/landing/owner_hero_bg.png" 
                            alt="Bandi Pavan Kumar" 
                            className="w-full h-full object-cover object-top scale-110"
                        />
                    </motion.div>
                    
                    <motion.div {...fadeInUp} className="flex-1 space-y-6">
                        <h3 className="text-2xl font-semibold text-[#deb868]">Bandi Pavan Kumar</h3>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            With over 15 years of construction experience, the owner of PVR Constructions is dedicated to delivering high-quality projects with unwavering leadership and commitment to excellence. 
                        </p>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            Awarded with numerous industry accolades, he recently received the prestigious <strong>"Youngest Construction Company Managing Award"</strong>, solidifying his reputation as a visionary leader in modern infrastructure and luxury living.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ACHIEVEMENTS / RECENT PROJECTS SECTION */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-10 tracking-wide">
                    Achievements & Portfolio
                </motion.h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Project 1 */}
                    <motion.div {...fadeInUp} className="group relative rounded-2xl overflow-hidden bg-[#1a1a24] border border-gray-800 hover:border-[#deb868]/50 transition-colors">
                        <div className="h-64 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800" alt="Prestige Residences" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">Prestige Residences</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Construction done on time, as our companies on-time and delivery construction truly.
                            </p>
                        </div>
                    </motion.div>

                    {/* Project 2 */}
                    <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="group relative rounded-2xl overflow-hidden bg-[#1a1a24] border border-gray-800 hover:border-[#deb868]/50 transition-colors">
                        <div className="h-64 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" alt="Silicon Towers" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">Silicon Towers</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Delivered focus process on on-time living construction, companies and delivery possessor construction on restricts.
                            </p>
                        </div>
                    </motion.div>

                    {/* Project 3 */}
                    <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="group relative rounded-2xl overflow-hidden bg-[#1a1a24] border border-gray-800 hover:border-[#deb868]/50 transition-colors">
                        <div className="h-64 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=800" alt="Royal Heights" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">Royal Heights</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Delivered fixed five years to an extreme construct at obtaining owner based construction process.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* HIGHLIGHTED MEGA PROJECT SECTION */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <motion.div {...fadeInUp} className="relative rounded-3xl overflow-hidden border border-[#deb868]/30 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />
                    <img 
                        src="/images/landing/project_megha_icon.png" 
                        alt="PVR Megha Icon" 
                        className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    
                    <div className="absolute inset-0 z-20 flex flex-col justify-center p-10 md:p-20 max-w-3xl">
                        <div className="inline-block px-4 py-1 bg-[#deb868]/20 border border-[#deb868]/50 text-[#deb868] text-sm font-bold tracking-widest uppercase rounded-full mb-6 w-max backdrop-blur-sm">
                            Flagship Project
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            PVR <span className="text-[#deb868]">Megha Icon</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mb-8">
                            The largest and most ambitious luxury residential project ever constructed by PVR Groups. A true architectural marvel redefining the skyline of Vijayawada with world-class amenities and unprecedented scale.
                        </p>
                        <button 
                            onClick={handleEnter}
                            className="bg-transparent border border-[#deb868] text-[#deb868] px-8 py-3 rounded-full hover:bg-[#deb868] hover:text-black transition-colors w-max font-bold tracking-wide"
                        >
                            Explore Projects Gallery
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* CERTIFICATES & AWARDS SECTION */}
            <section className="max-w-7xl mx-auto px-6 py-20 pb-32">
                <div className="flex items-center justify-between mb-12">
                     <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold text-white tracking-wide">
                        Awards & Recognition
                    </motion.h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((item, index) => (
                        <motion.div 
                            key={index}
                            {...fadeInUp} 
                            transition={{ delay: index * 0.1 }}
                            className="relative aspect-[3/4] rounded-xl overflow-hidden group shadow-xl border border-gray-800 hover:border-[#deb868]/50"
                        >
                            {/* We use the singular generated certificate and apply slight hue rotations or scale to make them look like a collection if we only have one image, or just display the same prestigious one */}
                            <img 
                                src="/images/landing/certificate_golden.png" 
                                alt="Certificate of Excellence" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Overlay for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <div>
                                    <p className="text-[#deb868] font-bold text-lg">Award of Excellence</p>
                                    <p className="text-xs text-gray-300 mt-1">Recognized for outstanding quality</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
