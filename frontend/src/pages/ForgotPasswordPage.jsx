import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Link to="/login" className="inline-flex items-center space-x-2 text-gray-400 hover:text-gold-400 mb-8 transition-colors">
                    <FiArrowLeft size={18} /> <span>Back to Login</span>
                </Link>

                {sent ? (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <FiMail size={28} className="text-green-400" />
                        </div>
                        <h1 className="text-2xl font-heading font-bold text-white mb-2">Check Your Email</h1>
                        <p className="text-gray-400 mb-8">We've sent a password reset link to <span className="text-gold-400">{email}</span></p>
                        <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">Back to Sign In</Link>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-heading font-bold text-white mb-2">Forgot Password</h1>
                        <p className="text-gray-400 mb-8">Enter your email and we'll send you a reset link</p>

                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-500 text-sm"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl btn-shimmer text-white font-semibold disabled:opacity-50">
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
