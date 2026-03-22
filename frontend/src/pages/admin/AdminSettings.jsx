import React, { useState } from 'react';
import api from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FiShield, FiCheck, FiX } from 'react-icons/fi';

const AdminSettings = () => {
    const { user, setUser } = useAuth();
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSetup2FA = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/admin/setup-2fa');
            setQrCode(res.data.qrCode);
            setSecret(res.data.secret);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to setup 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/admin/verify-2fa', { token: authCode });
            setUser({ ...user, twofa_enabled: true });
            setMessage(res.data.message);
            setQrCode(''); // clear setup data
            setSecret('');
            setAuthCode('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm("Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.")) {
            return;
        }
        
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/admin/disable-2fa');
            setUser({ ...user, twofa_enabled: false });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Admin Settings</h1>
            
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gold-400/20 rounded-xl text-gold-400">
                        <FiShield size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
                        <p className="text-gray-500 text-sm">Enhance your account security with Google Authenticator.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center">
                        <FiX className="mr-2" />
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center">
                        <FiCheck className="mr-2" />
                        {message}
                    </div>
                )}

                {user?.twofa_enabled ? (
                    <div className="space-y-6">
                        <div className="bg-green-500/10 border border-green-500/30 px-4 py-4 rounded-xl flex items-center">
                            <FiCheck className="text-green-400 text-xl mr-3" />
                            <span className="text-green-400 font-medium">Two-Factor Authentication is currently enabled.</span>
                        </div>
                        <button
                            onClick={handleDisable2FA}
                            disabled={loading}
                            className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Disable Two-Factor Authentication'}
                        </button>
                    </div>
                ) : (
                    <div>
                        {!qrCode ? (
                            <button
                                onClick={handleSetup2FA}
                                disabled={loading}
                                className="px-6 py-2.5 bg-gold-400 hover:bg-gold-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
                            </button>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 border-t border-gray-100 dark:border-dark-border pt-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">1. Scan the QR Code</h3>
                                    <p className="text-gray-500 text-sm mb-4">Open Google Authenticator on your phone and scan the code below:</p>
                                    <div className="bg-white p-4 rounded-xl inline-block shadow-sm">
                                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">2. Enter the Verification Code</h3>
                                    <p className="text-gray-500 text-sm mb-4">Enter the 6-digit code generated by the app to verify and activate 2FA.</p>
                                    <div className="flex space-x-3">
                                        <input
                                            type="text"
                                            value={authCode}
                                            onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))}
                                            maxLength="6"
                                            placeholder="000000"
                                            className="px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white font-mono tracking-widest text-center w-36 focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                                        />
                                        <button
                                            onClick={handleVerify2FA}
                                            disabled={loading || authCode.length !== 6}
                                            className="px-6 py-2.5 bg-gold-400 hover:bg-gold-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Verifying...' : 'Verify Code'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
