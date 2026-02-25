import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiMail, FiPhone, FiCalendar } from 'react-icons/fi';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/users').then(res => { setUsers(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Users</h1>
                <p className="text-gray-500 mt-1">View all registered users ({users.length})</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-dark-border">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Phone</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Registered</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Last Login</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-bold text-sm">{u.name?.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{u.name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1"><FiMail size={12} /> {u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="flex items-center gap-1"><FiPhone size={14} /> {u.phone}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="flex items-center gap-1"><FiCalendar size={14} /> {new Date(u.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.verified ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                                                {u.verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No users registered yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
