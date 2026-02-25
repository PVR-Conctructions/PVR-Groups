import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiNavigation } from 'react-icons/fi';

const ContactPage = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 5000);
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    const openDirections = () => {
        // Opens Google Maps with directions from current location to PVR GROUP & SSBC CENTRAL OFFICE
        const destination = encodeURIComponent('PVR GROUP & SSBC CENTRAL OFFICE, Vijayawada');
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`, '_blank');
    };

    return (
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors">
            <Navbar />

            <HeroBanner
                title={<>Get In <span className="text-gold-gradient">Touch</span></>}
                subtitle="We'd love to hear from you. Reach out and let's build your dream home together."
            />

            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info Cards */}
                        <div className="space-y-4">
                            {[
                                { icon: FiPhone, title: 'Call Us', info: '+91 98765 43210', sub: 'Mon-Sat, 9am-7pm' },
                                { icon: FiMail, title: 'Email Us', info: 'info@pvrgroups.com', sub: 'We reply within 24 hours' },
                                { icon: FiMapPin, title: 'Visit Us', info: 'PVR GROUP & SSBC', sub: 'Central Office, Vijayawada, AP' },
                                { icon: FiClock, title: 'Working Hours', info: 'Mon - Sat', sub: '9:00 AM - 7:00 PM' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-100 dark:border-dark-border flex items-start space-x-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                                        <item.icon size={20} className="text-gold-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</p>
                                        <p className="text-gold-400 text-sm font-semibold">{item.info}</p>
                                        <p className="text-gray-500 text-xs">{item.sub}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Get Directions Button */}
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                viewport={{ once: true }}
                                onClick={openDirections}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-xl px-5 py-4 hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
                            >
                                <FiNavigation size={20} />
                                <div className="text-left">
                                    <p className="font-semibold text-sm">Get Directions</p>
                                    <p className="text-xs text-gray-300">Open Google Maps Navigation</p>
                                </div>
                            </motion.button>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-gray-100 dark:border-dark-border"
                            >
                                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>

                                {sent && (
                                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm">
                                        Message sent successfully! We'll get back to you soon.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your Email" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                                        <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                                    </div>
                                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Your Message" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                                    <button type="submit" className="px-8 py-3 rounded-xl btn-shimmer text-white font-semibold flex items-center gap-2">
                                        <FiSend size={16} /> Send Message
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </div>

                    {/* Map with Directions */}
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                                PVR GROUP & SSBC Central Office
                            </h3>
                            <button
                                onClick={openDirections}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400/10 text-gold-400 hover:bg-gold-400/20 transition-colors text-sm font-medium"
                            >
                                <FiNavigation size={16} /> Get Directions
                            </button>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.0!2d80.6480!3d16.5062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35eff9482d944b%3A0x939b7e84ab4a0265!2sVijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                                title="PVR GROUP & SSBC Central Office"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
