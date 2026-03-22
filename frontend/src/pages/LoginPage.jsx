import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [step, setStep] = useState(1);
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginVerify2FA } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (step === 1) {
                const res = await login(email, password);
                if (res?.requires2FA) {
                    setStep(2);
                } else {
                    navigate(res.role === 'admin' ? '/admin' : '/home');
                }
            } else if (step === 2) {
                const user = await loginVerify2FA(email, password, authCode);
                navigate(user.role === 'admin' ? '/admin' : '/home');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-dark-bg">
            {/* Left side - decorative */}
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
                        <h2 className="text-4xl font-heading font-bold text-white mb-4">PVR Groups</h2>
                        <p className="text-gray-400 text-lg">Building Luxury Living in Vijayawada</p>
                    </div>
                </div>
                <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 right-20 w-48 h-48 bg-gold-400/10 rounded-full blur-3xl" />
                <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 left-20 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
            </div>

            {/* Right side - form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                            <span className="text-white font-heading font-bold text-lg">P</span>
                        </div>
                        <span className="text-xl font-heading font-bold text-white">PVR <span className="text-gold-400">Groups</span></span>
                    </div>

                    <h1 className="text-3xl font-heading font-bold text-white mb-2">
                        {step === 1 ? 'Welcome Back' : 'Two-Factor Authentication'}
                    </h1>
                    <p className="text-gray-400 mb-8">
                        {step === 1 ? 'Sign in to access your account' : 'Enter the 6-digit code from Google Authenticator'}
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {step === 1 ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-500 text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-500 text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                                            {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded border-dark-border bg-dark-card text-gold-400 focus:ring-gold-400 focus:ring-offset-dark-bg" />
                                        <span className="text-sm text-gray-400">Remember me</span>
                                    </label>
                                    <Link to="/forgot-password" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Authenticator Code</label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={authCode}
                                        onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        maxLength="6"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-500 text-sm text-center text-tracking-widest font-mono text-xl focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="mt-4 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center w-full"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl btn-shimmer text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (step === 1 ? 'Signing in...' : 'Verifying...') : (step === 1 ? 'Sign In' : 'Verify Code')}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                            Create Account
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
