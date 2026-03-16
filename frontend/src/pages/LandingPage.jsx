import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { FaWhatsapp, FaArrowRight, FaBuilding, FaAward, FaRegHandshake } from 'react-icons/fa';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    
    const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true });

    const handleEnter = () => {
        navigate(user ? '/home' : '/login');
    };

    const handleContact = () => {
        navigate('/contact');
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 50 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: { duration: 0.8, ease: "easeOut" }
    };
    
    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 font-sans overflow-x-hidden selection:bg-[#deb868] selection:text-black">
            
            {/* SECTION 1 - HERO SECTION */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
                        alt="Cinematic City Skyline" 
                        className="w-full h-full object-cover object-center opacity-40 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
                    <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center px-6 mt-16 sm:mt-20 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 sm:mb-6 tracking-tighter leading-tight drop-shadow-2xl">
                            <span className="text-white">PVR</span> <br className="md:hidden"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728]">CONSTRUCTIONS</span>
                        </h1>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-base sm:text-xl md:text-3xl text-gray-300 font-light tracking-wide mb-6 sm:mb-10 max-w-3xl drop-shadow-lg px-2"
                    >
                        Building Andhra Pradesh's Future with Trust and Innovation.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 sm:mt-8 w-full sm:w-auto px-2 sm:px-0"
                    >
                        <button
                            onClick={handleEnter}
                            className="group relative px-6 py-3 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-black font-bold text-sm sm:text-lg tracking-wider uppercase overflow-hidden shadow-[0_0_30px_rgba(222,184,104,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(222,184,104,0.6)]"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Explore Projects
                                <FaArrowRight className="transition-transform group-hover:translate-x-2" />
                            </span>
                        </button>
                        
                        <button
                            onClick={handleContact}
                            className="group px-6 py-3 sm:px-10 sm:py-4 rounded-full bg-transparent border-2 border-[#deb868] text-[#deb868] font-bold text-sm sm:text-lg tracking-wider uppercase transition-all hover:bg-[#deb868] hover:text-black hover:shadow-[0_0_30px_rgba(222,184,104,0.3)] backdrop-blur-sm"
                        >
                            Contact Us
                        </button>
                    </motion.div>
                </div>
                
                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[#deb868] text-sm md:text-base font-medium tracking-widest uppercase drop-shadow-[0_0_10px_rgba(222,184,104,0.6)]">Discover</span>
                    <div className="w-[2px] h-16 bg-gradient-to-b from-[#deb868] to-transparent animate-pulse" />
                </motion.div>
            </section>

            {/* SECTION 2 - ABOUT THE FOUNDER */}
            <section className="relative py-16 sm:py-28 px-4 sm:px-6 lg:px-20 max-w-7xl mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
                
                <div className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-center">
                    <motion.div 
                        {...fadeInUp}
                        className="w-full lg:w-5/12 relative group"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#deb868]/20 to-transparent rounded-2xl blur-xl transition-all duration-500 group-hover:bg-[#deb868]/30" />
                        <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                            <img 
                                src="/images/landing/owner_hero_bg.png" 
                                alt="Bandi Pavan Kumar" 
                                className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    </motion.div>
                    
                    <motion.div {...fadeInUp} className="w-full lg:w-7/12 space-y-8">
                        <div>
                            <h4 className="text-[#deb868] text-sm font-bold tracking-widest uppercase mb-2">Leadership & Vision</h4>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                                Delivering Excellence For Over <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] to-[#fcf6ba] italic">15 Years</span>
                            </h2>
                        </div>
                        
                        <div className="space-y-4 sm:space-y-6 text-gray-400 text-base sm:text-lg leading-relaxed font-light">
                            <p>
                                Under the visionary leadership of Bandi Pavan Kumar, PVR Constructions has emerged as one of the <strong>Top 10 Construction Companies in Andhra Pradesh</strong>. Our commitment goes beyond building structures; we craft lifestyles.
                            </p>
                            <p>
                                With an unwavering dedication to modern infrastructure and high-quality residential projects, he has transformed the real estate landscape, ensuring every home reflects luxury, durability, and architectural brilliance.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-800">
                            <div>
                                <h5 className="text-white font-bold text-xl mb-1">Visionary</h5>
                                <p className="text-sm text-gray-500">Pioneering modern luxury living spaces.</p>
                            </div>
                            <div>
                                <h5 className="text-white font-bold text-xl mb-1">Trusted</h5>
                                <p className="text-sm text-gray-500">A legacy built on transparency and quality.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 3 - FLAGSHIP PROJECT */}
            <section className="py-16 sm:py-24 bg-[#0a0a0f] border-y border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <span className="text-[#deb868] text-sm font-bold tracking-widest uppercase block mb-2">The Crown Jewel</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Our Flagship Project</h2>
                    </motion.div>
                    
                    <motion.div {...fadeInUp} className="relative rounded-3xl overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-90" />
                        <img 
                            src="/images/landing/project_megha_icon.png" 
                            alt="PVR Megha Icon" 
                            className="w-full h-[350px] sm:h-[500px] md:h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        
                        <div className="absolute inset-0 z-20 flex flex-col justify-center p-5 sm:p-8 md:p-16 lg:p-24 max-w-4xl">
                            <h3 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-3 sm:mb-6 leading-none tracking-tight">
                                PVR <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728]">Megha Icon</span>
                            </h3>
                            <p className="text-sm sm:text-xl md:text-2xl text-gray-300 font-light mb-4 sm:mb-8 leading-relaxed">
                                The <strong>largest residential masterpiece</strong> by PVR Constructions in Andhra Pradesh.
                                Featuring <strong>900 premium luxury flats</strong> designed for an elevated lifestyle.
                            </p>
                            
                            <ul className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-12">
                                {[
                                    { icon: <FaBuilding/>, text: "900 Premium Flats" },
                                    { icon: <FaAward/>, text: "Luxury Clubhouse" },
                                    { text: "Green Spaces" },
                                    { text: "Modern Architecture" }
                                ].map((amenity, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-300 border-l border-[#deb868]/50 pl-4">
                                        <span className="text-[#deb868]">{amenity.icon || <div className="w-1.5 h-1.5 rounded-full bg-[#deb868]"/>}</span>
                                        <span className="text-sm font-medium tracking-wide">{amenity.text}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <button 
                                onClick={handleEnter}
                                className="bg-white text-black px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold uppercase tracking-wider text-xs sm:text-sm hover:bg-[#deb868] transition-colors w-max flex items-center gap-3"
                            >
                                View Project Details <FaArrowRight />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 4 - COMPLETED PROJECTS */}
            <section className="py-16 sm:py-28 px-4 sm:px-6 lg:px-20 max-w-7xl mx-auto">
                <motion.div {...fadeInUp} className="mb-10 sm:mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Masterpieces Delivered</h2>
                    <p className="text-gray-400 text-lg max-w-2xl font-light">
                        A showcase of our commitment to quality, timely delivery, and architectural brilliance across Andhra Pradesh.
                    </p>
                </motion.div>

                <div className="space-y-16 sm:space-y-32">
                    {[
                        {
                            title: "Prestige Residences",
                            desc: "An epitome of luxury living, offering unparalleled comfort and state-of-the-art amenities. Delivered exactly on schedule, securing trust.",
                            img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000",
                            year: "2023"
                        },
                        {
                            title: "Silicon Towers",
                            desc: "Modern corporate and residential hubs seamlessly integrated. A testament to functional design meets aesthetic luxury.",
                            img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
                            year: "2022"
                        },
                        {
                            title: "Royal Heights",
                            desc: "Elevated living spaces providing panoramic views of the city. Built with premium materials ensuring lifelong durability.",
                            img: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=1000",
                            year: "2020"
                        },
                        {
                            title: "PVR Emerald",
                            desc: "A sprawling estate perfectly harmonizing with nature while providing ultimate high-end residential luxury.",
                            img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000",
                            year: "2019"
                        }
                    ].map((project, idx) => (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 sm:gap-12 items-center`}
                        >
                            <div className="w-full md:w-1/2 space-y-6">
                                <span className="text-gray-500 font-bold text-4xl sm:text-6xl opacity-20 block -mb-6 sm:-mb-8">{project.year}</span>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{project.title}</h3>
                                <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-light">
                                    {project.desc}
                                </p>
                                <div className="pt-4">
                                    <span className="inline-block border-b hover:border-[#deb868] pb-1 text-[#deb868] text-sm tracking-widest uppercase transition-colors uppercase cursor-pointer" onClick={handleEnter}>
                                        Read More
                                    </span>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-1/2">
                                <div className="rounded-2xl overflow-hidden aspect-[4/3] relative group shadow-2xl">
                                    <div className="absolute inset-0 bg-[#deb868] opacity-0 group-hover:opacity-20 mix-blend-overlay transition-opacity duration-500 z-10" />
                                    <img 
                                        src={project.img} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* SECTION 5 - ONGOING PROJECTS */}
            <section className="py-16 sm:py-28 bg-[#0a0a0f] border-t border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
                    <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <span className="text-[#deb868] text-sm font-bold tracking-widest uppercase block mb-2">In Progress</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Shaping the Future</h2>
                        </div>
                        <button onClick={handleEnter} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                            View all ongoing <FaArrowRight className="text-[#deb868]" />
                        </button>
                    </motion.div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[
                            { title: "PVR Symphony", progress: 75, location: "Vijayawada", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800" },
                            { title: "Azure Heights", progress: 40, location: "Guntur", image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&q=80&w=800" },
                            { title: "The Botanica", progress: 15, location: "Amaravati", image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800" }
                        ].map((proj, idx) => (
                            <motion.div 
                                key={idx}
                                variants={fadeInUp}
                                className="bg-[#12121a] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#deb868]/40 transition-colors group"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-gray-700 z-10">
                                        {proj.location}
                                    </div>
                                    <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-4">{proj.title}</h3>
                                    
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Construction Progress</span>
                                            <span className="text-[#deb868]">{proj.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${proj.progress}%` }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                                className="bg-gradient-to-r from-[#bf953f] to-[#fcf6ba] h-1.5 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* SECTION 6 - AWARDS & RECOGNITION */}
            <section className="py-16 sm:py-28 px-4 sm:px-6 lg:px-20 max-w-7xl mx-auto">
                <motion.div {...fadeInUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">A Legacy of Excellence</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Our relentless pursuit of quality and architectural innovation has been consistently recognized by leading industry bodies.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {[
                        "Best Luxury Developer 2023",
                        "Excellence in Architecture",
                        "Most Trusted Brand",
                        "Youngest Construction MD"
                    ].map((award, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className="aspect-[3/4] rounded-xl overflow-hidden relative group"
                        >
                            <img 
                                src="/images/landing/certificate_golden.png" 
                                alt={award} 
                                className="w-full h-full object-cover"
                            />
                            {/* Inner Gold Frame */}
                            <div className="absolute inset-2 border border-[#deb868]/30 rounded-lg pointer-events-none group-hover:border-[#deb868] transition-colors duration-500" />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-6 bg-glass">
                                <FaAward className="text-4xl text-[#deb868] mb-3" />
                                <h4 className="text-white font-bold">{award}</h4>
                                <p className="text-xs text-gray-400 mt-2">Awarded by National Real Estate Board</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* SECTION 7 - TRUST STATISTICS */}
            <section className="py-24 relative overflow-hidden" ref={statsRef}>
                <div className="absolute inset-0 bg-[#12121a]">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:divide-x divide-gray-800">
                        {[
                            { value: 15, suffix: "+", label: "Years Experience" },
                            { value: 900, suffix: "+", label: "Flats Constructed" },
                            { value: 1000, suffix: "+", label: "Happy Families" },
                            { value: 25, suffix: "+", label: "Cities Covered" }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center px-4">
                                <div className="text-3xl sm:text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] to-[#fcf6ba] mb-2">
                                    {statsInView ? (
                                        <CountUp end={stat.value} duration={3} />
                                    ) : (
                                        "0"
                                    )}
                                    {stat.suffix}
                                </div>
                                <div className="text-xs sm:text-sm md:text-base text-gray-400 font-medium tracking-wide uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 8 - FINAL CALL TO ACTION */}
            <section className="relative py-16 sm:py-32 px-4 sm:px-6 lg:px-20 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[#050505]">
                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-20" alt="Luxury home interior" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-[#050505]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center backdrop-blur-sm bg-black/30 p-6 sm:p-12 md:p-20 rounded-3xl border border-gray-800 shadow-2xl">
                    <FaRegHandshake className="text-5xl text-[#deb868] mx-auto mb-6" />
                    <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6">Ready to Experience Luxury?</h2>
                    <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-10 font-light max-w-2xl mx-auto">
                        Join the hundreds of families who have found their dream homes with PVR Constructions. Book a personalized site visit today.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button 
                            onClick={handleEnter}
                            className="px-6 py-3 sm:px-10 sm:py-5 rounded-full bg-white text-black font-bold text-sm sm:text-base uppercase tracking-wider hover:bg-[#deb868] transition-colors shadow-lg"
                        >
                            Explore All Properties
                        </button>
                        
                        <a 
                            href="https://wa.me/911234567890" // Replace with actual WhatsApp number
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 py-3 sm:px-10 sm:py-5 rounded-full bg-[#25D366] text-white font-bold text-sm sm:text-base uppercase tracking-wider hover:bg-[#20bd5a] transition-colors shadow-lg flex items-center justify-center gap-3"
                        >
                            <FaWhatsapp className="text-2xl" /> Book via WhatsApp
                        </a>
                    </div>
                </div>
            </section>
            
            <style jsx="true">{`
                .bg-glass {
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
