import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import api from '../hooks/useApi';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subMsg, setSubMsg] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/newsletter/subscribe', { email });
            setSubMsg(res.data.message);
            setEmail('');
            setTimeout(() => setSubMsg(''), 3000);
        } catch (err) {
            setSubMsg(err.response?.data?.message || 'Failed to subscribe');
        }
    };

    return (
        <footer className="bg-primary-800 dark:bg-dark-bg border-t border-primary-700 dark:border-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                <span className="text-white font-heading font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-heading font-bold text-white">PVR <span className="text-gold-400">Groups</span></span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            One of the largest construction companies in Vijayawada, building luxury living spaces with world-class amenities.
                        </p>
                        <div className="flex space-x-3">
                            {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-gray-300 hover:bg-gold-400 hover:text-white transition-all duration-300">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-heading font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2.5">
                            {[{ to: '/home', label: 'Home' }, { to: '/projects', label: 'Projects' }, { to: '/emi-calculator', label: 'EMI Calculator' }, { to: '/contact', label: 'Contact Us' }, { to: '/virtual-tour', label: 'Virtual Tour' }].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-gray-300 hover:text-gold-400 text-sm transition-colors duration-200">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-heading font-semibold text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <FiMapPin className="text-gold-400 mt-0.5 flex-shrink-0" size={16} />
                                <span className="text-gray-300 text-sm">Vijayawada, Andhra Pradesh, India</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FiPhone className="text-gold-400 flex-shrink-0" size={16} />
                                <span className="text-gray-300 text-sm">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FiMail className="text-gold-400 flex-shrink-0" size={16} />
                                <span className="text-gray-300 text-sm">info@pvrgroups.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-heading font-semibold text-lg mb-4">Newsletter</h3>
                        <p className="text-gray-300 text-sm mb-4">Subscribe to get updates on our latest projects and offers.</p>
                        <form onSubmit={handleSubscribe} className="flex">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="flex-1 px-4 py-2.5 rounded-l-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:border-gold-400"
                                required
                            />
                            <button type="submit" className="px-4 py-2.5 bg-gold-400 text-white rounded-r-lg hover:bg-gold-500 transition-colors">
                                <FiSend size={16} />
                            </button>
                        </form>
                        {subMsg && <p className="text-gold-400 text-xs mt-2">{subMsg}</p>}
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-white/10 py-6">
                <p className="text-center text-gray-400 text-sm">
                    © {new Date().getFullYear()} PVR Groups. All rights reserved. Built with ❤️ in Vijayawada.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
