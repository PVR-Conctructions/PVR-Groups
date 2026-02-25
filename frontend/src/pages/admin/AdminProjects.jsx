import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage } from 'react-icons/fi';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', status: 'ongoing', location: '', mapEmbed: '', price: '', area: '', units: '' });
    const [files, setFiles] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = () => {
        api.get('/projects').then(res => { setProjects(res.data); setLoading(false); }).catch(() => setLoading(false));
    };

    const resetForm = () => {
        setForm({ name: '', description: '', status: 'ongoing', location: '', mapEmbed: '', price: '', area: '', units: '' });
        setFiles(null);
        setEditing(null);
        setShowForm(false);
    };

    const handleEdit = (p) => {
        setForm({ name: p.name, description: p.description, status: p.status, location: p.location?.address || '', mapEmbed: p.location?.mapEmbed || '', price: p.price || '', area: p.area || '', units: p.units || '' });
        setEditing(p._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            if (files) Array.from(files).forEach(f => formData.append('images', f));

            if (editing) {
                await api.put(`/projects/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            fetchProjects();
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save project');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            fetchProjects();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage your construction projects</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 rounded-xl btn-shimmer text-white font-medium flex items-center gap-2">
                    <FiPlus size={18} /> Add Project
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => resetForm()}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border dark:border-dark-border">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">{editing ? 'Edit Project' : 'Add Project'}</h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm">
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (e.g., ₹45L)" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                                <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Area (e.g., 1200 sq.ft)" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                            </div>
                            <input type="text" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} placeholder="Units (e.g., 200 Apartments)" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location Address" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                            <textarea value={form.mapEmbed} onChange={(e) => setForm({ ...form, mapEmbed: e.target.value })} rows={2} placeholder="Google Maps Embed Code" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm font-mono text-xs" />
                            <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-4 text-center">
                                <FiImage size={24} className="text-gray-400 mx-auto mb-2" />
                                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} className="text-sm text-gray-500" />
                            </div>
                            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl btn-shimmer text-white font-semibold disabled:opacity-50">
                                {saving ? 'Saving...' : editing ? 'Update Project' : 'Create Project'}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {/* Projects Table */}
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
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Project</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Price</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map(p => (
                                    <tr key={p._id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{p.location?.address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-gold-100 text-gold-700 dark:bg-gold-400/20 dark:text-gold-400'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{p.price || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg mr-1"><FiEdit2 size={16} /></button>
                                            <button onClick={() => handleDelete(p._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><FiTrash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {projects.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No projects yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProjects;
