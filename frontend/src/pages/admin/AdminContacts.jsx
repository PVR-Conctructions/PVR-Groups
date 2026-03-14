import React, { useState, useEffect } from 'react';
import api from '../../hooks/useApi';
import { FiCheck, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';

const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchContacts(); }, []);

    const fetchContacts = () => {
        api.get('/contacts/admin/all')
            .then(res => { setContacts(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const handleRead = async (id) => {
        try { 
            await api.put(`/contacts/admin/${id}/read`); 
            fetchContacts(); 
        } catch (err) { 
            alert('Failed to mark as read'); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this contact message?')) return;
        try { 
            await api.delete(`/contacts/admin/${id}`); 
            fetchContacts(); 
        } catch (err) { 
            alert('Failed to delete'); 
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Contact Messages</h1>
                <p className="text-gray-500 mt-1">Manage inquiries from the Contact Us page</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {contacts.map(c => (
                        <div key={c._id} className={`bg-white dark:bg-dark-card rounded-2xl p-6 border ${c.read ? 'border-gray-100 dark:border-dark-border' : 'border-primary-500 shadow-md'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">{c.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <FiMail size={12} /> {c.email}
                                                </div>
                                                {c.phone && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <FiPhone size={12} /> {c.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${c.read ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'}`}>
                                            {c.read ? 'Read' : 'New'}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">Subject: {c.subject}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 whitespace-pre-wrap">{c.message}</p>
                                    <p className="text-xs text-gray-400 mt-3">{new Date(c.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex flex-col space-y-2 ml-4">
                                    {!c.read && (
                                        <button onClick={() => handleRead(c._id)} className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg" title="Mark as Read">
                                            <FiCheck size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(c._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title="Delete">
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {contacts.length === 0 && (
                        <div className="text-center py-16 text-gray-500">No contact messages received yet</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminContacts;
