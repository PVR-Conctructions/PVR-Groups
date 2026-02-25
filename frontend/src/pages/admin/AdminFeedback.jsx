import React, { useState, useEffect } from 'react';
import api from '../../hooks/useApi';
import { FiCheck, FiTrash2, FiStar } from 'react-icons/fi';

const AdminFeedback = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchFeedback(); }, []);

    const fetchFeedback = () => {
        api.get('/feedback/all').then(res => { setFeedback(res.data); setLoading(false); }).catch(() => setLoading(false));
    };

    const handleApprove = async (id) => {
        try { await api.put(`/feedback/${id}/approve`); fetchFeedback(); } catch (err) { alert('Failed to approve'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this feedback?')) return;
        try { await api.delete(`/feedback/${id}`); fetchFeedback(); } catch (err) { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Feedback</h1>
                <p className="text-gray-500 mt-1">Manage customer reviews and ratings</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedback.map(f => (
                        <div key={f._id} className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">{f.userId?.name?.charAt(0) || 'U'}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{f.userId?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{f.userId?.email}</p>
                                        </div>
                                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${f.approved ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                                            {f.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gold-400 font-medium mb-2">Project: {f.projectId?.name || 'N/A'}</p>
                                    <div className="flex mb-2">
                                        {[...Array(5)].map((_, j) => (
                                            <FiStar key={j} size={14} className={j < f.rating ? 'text-gold-400 fill-gold-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{f.comment}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(f.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    {!f.approved && (
                                        <button onClick={() => handleApprove(f._id)} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg" title="Approve">
                                            <FiCheck size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(f._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title="Delete">
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {feedback.length === 0 && (
                        <div className="text-center py-16 text-gray-500">No feedback received yet</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;
