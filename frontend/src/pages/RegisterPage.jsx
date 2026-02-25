import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import WelcomePopup from '../components/WelcomePopup';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [userName, setUserName] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Phone: allow only digits, max 10
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setForm({ ...form, phone: digitsOnly });
        } else {
            setForm({ ...form, [name]: value });
        }

        // Clear field error when user types
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: '' });
        }
    };

    const validate = () => {
        const errors = {};

        if (!form.name.trim()) errors.name = 'Full name is required';
        if (!form.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address';

        if (!form.phone.trim()) errors.phone = 'Phone number is required';
        else if (form.phone.length !== 10) errors.phone = 'Phone must be exactly 10 digits';

        if (!form.password.trim()) errors.password = 'Password is required';
        else if (form.password.length < 3) errors.password = 'Password must be at least 3 characters';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        setLoading(true);
        try {
            const user = await register(form.name, form.email, form.phone, form.password);
            setUserName(user.name);
            setShowWelcome(true);
        } catch (err) {
            if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Cannot connect to server. Please make sure the backend is running (npm start in backend folder).');
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (fieldName) =>
        `w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-card border text-white placeholder-gray-500 text-sm transition-colors ${fieldErrors[fieldName]
            ? 'border-red-500 bg-red-500/5'
            : 'border-dark-border'
        }`;

    return (
        <div className="min-h-screen flex bg-dark-bg">
            {/* Left decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-dark-bg" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-6"
                        >
                            <span className="text-white font-heading font-bold text-3xl">P</span>
                        </motion.div>
                        <h2 className="text-4xl font-heading font-bold text-white mb-4">Join PVR Groups</h2>
                        <p className="text-gray-400 text-lg">Create your account to explore luxury living</p>
                    </div>
                </div>
                <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 right-20 w-48 h-48 bg-gold-400/10 rounded-full blur-3xl" />
            </div>

            {/* Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                            <span className="text-white font-heading font-bold text-lg">P</span>
                        </div>
                        <span className="text-xl font-heading font-bold text-white">PVR <span className="text-gold-400">Groups</span></span>
                    </div>

                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400 mb-8">Register to explore our premium projects</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className={inputClass('name')}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {fieldErrors.name && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={inputClass('email')}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {fieldErrors.email && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                            <div className="relative">
                                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    inputMode="numeric"
                                    maxLength={10}
                                    className={`${inputClass('phone')} ${form.phone.length > 0 && form.phone.length < 10 ? 'pr-20' : 'pr-4'}`}
                                    placeholder="Enter 10-digit phone number"
                                />
                                {form.phone.length > 0 && (
                                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium ${form.phone.length === 10 ? 'text-green-400' : 'text-gray-500'}`}>
                                        {form.phone.length}/10
                                    </span>
                                )}
                            </div>
                            {fieldErrors.phone && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.phone}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`${inputClass('password')} pr-12`}
                                    placeholder="Create a password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.password}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl btn-shimmer text-white font-semibold disabled:opacity-50 mt-2">
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">Sign In</Link>
                    </p>
                </motion.div>
            </div>

            <WelcomePopup show={showWelcome} onClose={() => navigate('/home')} userName={userName} />
        </div>
    );
};

export default RegisterPage;
