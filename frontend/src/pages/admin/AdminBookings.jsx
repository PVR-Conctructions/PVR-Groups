import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiCalendar, FiMapPin, FiPhone, FiMail, FiTrash2 } from 'react-icons/fi';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/site-visit/admin/all')
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this site visit booking?')) return;
        try {
            await api.delete(`/site-visit/admin/${id}`);
            setBookings(bookings.filter(b => b._id !== id));
        } catch (err) {
            console.error('Failed to delete booking', err);
            alert('Failed to delete booking. Please try again.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Site Visit Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage and view customer site visit requests.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="p-6">
                    {bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <FiCalendar size={48} className="mx-auto text-gray-300 dark:text-dark-border mb-4" />
                            <p className="text-gray-500">No bookings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-dark-border">
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Customer</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Contact</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Project</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Date</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Message</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-sm text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, idx) => (
                                        <motion.tr
                                            key={booking._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b border-gray-50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <p className="font-medium text-gray-900 dark:text-white">{booking.name}</p>
                                            </td>
                                            <td className="py-4 px-4 space-y-1 text-sm">
                                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                    <FiMail className="mr-2" size={14} /> {booking.email}
                                                </div>
                                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                    <FiPhone className="mr-2" size={14} /> {booking.phone}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm">
                                                <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FiMapPin className="mr-2 text-gold-400" size={14} />
                                                    {booking.projectId ? booking.projectId.name : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {new Date(booking.preferredDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                                {booking.message || '-'}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(booking._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete Booking"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
