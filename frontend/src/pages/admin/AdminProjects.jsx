import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../hooks/useApi';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// ── 30 Construction Amenities grouped by category ──
const AMENITIES_LIST = {
    'Recreation': [
        'Swimming Pool', 'Gym / Fitness Center', 'Clubhouse', 'Indoor Games',
        'Jogging Track', 'Yoga & Meditation', 'Party Hall', 'Mini Theater'
    ],
    'Convenience': [
        'Parking', 'EV Charging Station', 'Elevator / Lift', 'Shopping Complex',
        'ATM', 'Pharmacy', 'Laundry Service', 'Intercom Facility'
    ],
    'Safety': [
        '24/7 Security', 'CCTV Surveillance', 'Fire Safety System', 'Gated Community'
    ],
    'Green Living': [
        'Landscaped Gardens', 'Rainwater Harvesting', 'Solar Power', 'Sewage Treatment Plant', 'Waste Management'
    ],
    'Children & Sports': [
        "Children's Play Area", 'Basketball Court', 'Tennis Court', 'Cricket Pitch', 'Badminton Court'
    ]
};

const INITIAL_FORM = {
    name: '', description: '', status: 'ongoing', location: '', mapEmbed: '',
    price: '', area: '', units: '',
    completionPercentage: 0,
    projectType: '', totalFloors: '', possessionDate: '', reraNumber: '',
    totalLandArea: '', constructionType: '',
    specFlooring: '', specDoors: '', specWindows: '', specKitchen: '',
    specBathroom: '', specElectrical: '', specPainting: '', videoId: '',
};

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [imageGroups, setImageGroups] = useState([]);
    const [saving, setSaving] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [bestFeatures, setBestFeatures] = useState([]);
    const [featureInput, setFeatureInput] = useState('');
    const [configurations, setConfigurations] = useState([]);
    const [configForm, setConfigForm] = useState({ type: '', price: '', area: '', bedrooms: '', bathrooms: '', balconies: '', parking: '', description: '' });
    const [bankApprovals, setBankApprovals] = useState([]);
    const [bankInput, setBankInput] = useState('');
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = () => {
        api.get('/projects').then(res => { setProjects(res.data); setLoading(false); }).catch(() => setLoading(false));
    };

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setImageGroups([]);
        setEditing(null);
        setShowForm(false);
        setSelectedAmenities([]);
        setBestFeatures([]);
        setFeatureInput('');
        setConfigurations([]);
        setConfigForm({ type: '', price: '', area: '', bedrooms: '', bathrooms: '', balconies: '', parking: '', description: '' });
        setBankApprovals([]);
        setBankInput('');
        setExpandedSections({});
    };

    const handleEdit = (p) => {
        setForm({
            name: p.name, description: p.description, status: p.status,
            location: p.location?.address || '', mapEmbed: p.location?.mapEmbed || '',
            price: p.price || '', area: p.area || '', units: p.units || '',
            completionPercentage: p.completionPercentage || 0,
            projectType: p.projectType || '', totalFloors: p.totalFloors || '',
            possessionDate: p.possessionDate || '', reraNumber: p.reraNumber || '',
            totalLandArea: p.totalLandArea || '', constructionType: p.constructionType || '',
            specFlooring: p.specifications?.flooring || '', specDoors: p.specifications?.doors || '',
            specWindows: p.specifications?.windows || '', specKitchen: p.specifications?.kitchen || '',
            specBathroom: p.specifications?.bathroom || '', specElectrical: p.specifications?.electrical || '',
            specPainting: p.specifications?.painting || '', videoId: p.videoId || '',
        });
        setSelectedAmenities(p.amenities || []);
        setBestFeatures(p.bestFeatures || []);
        setConfigurations(p.configurations || []);
        setBankApprovals(p.bankApprovals || []);
        
        if (p.categorizedImages?.length > 0) {
            setImageGroups(p.categorizedImages.map(g => ({
                category: g.category,
                label: g.label,
                files: [],
                existingUrls: g.urls || []
            })));
        } else if (p.images?.length > 0) {
            setImageGroups([{
                category: 'General',
                label: 'Project Images',
                files: [],
                existingUrls: p.images
            }]);
        } else {
            setImageGroups([]);
        }

        setEditing(p._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            formData.append('amenities', JSON.stringify(selectedAmenities));
            formData.append('bestFeatures', JSON.stringify(bestFeatures));
            formData.append('configurations', JSON.stringify(configurations));
            formData.append('bankApprovals', JSON.stringify(bankApprovals));

            
            const imageGroupsMetadata = imageGroups.map(g => ({
                category: g.category,
                label: g.label,
                existingUrls: g.existingUrls,
                newFilesCount: g.files.length
            }));
            formData.append('imageGroupsData', JSON.stringify(imageGroupsMetadata));
            
            imageGroups.forEach(g => {
                g.files.forEach(f => formData.append('images', f));
            });

            if (editing) {
                await api.put(`/projects/${editing}`, formData);
            } else {
                await api.post('/projects', formData);
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
        try { await api.delete(`/projects/${id}`); fetchProjects(); } catch (err) { alert('Failed to delete'); }
    };

    const toggleAmenity = (name) => {
        setSelectedAmenities(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]);
    };

    const addItem = (list, setList, input, setInput) => {
        if (input.trim()) { setList([...list, input.trim()]); setInput(''); }
    };

    const removeItem = (list, setList, idx) => { setList(list.filter((_, i) => i !== idx)); };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // reusable section expander
    const SectionHeader = ({ title, section, count }) => (
        <button type="button" onClick={() => toggleSection(section)} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-border dark:to-dark-border/70 text-gray-800 dark:text-white text-sm font-semibold hover:from-gold-400/10 hover:to-gold-400/5 transition-all">
            <span>{title} {count > 0 && <span className="text-xs text-gold-500 ml-1">({count})</span>}</span>
            {expandedSections[section] ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>
    );

    const inputCls = "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-gold-400/40 focus:border-gold-400 transition-all outline-none";

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
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => resetForm()}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border dark:border-dark-border custom-scrollbar">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">{editing ? 'Edit Project' : 'Add Project'}</h2>
                                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Basic Info */}
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project Name" className={inputCls} required />
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Project Description" className={inputCls} required />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <select value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className={inputCls}>
                                        <option value="">Select Project Type</option>
                                        <option value="Residential Apartments">Residential Apartments</option>
                                        <option value="Villas">Villas</option>
                                        <option value="Commercial Complex">Commercial Complex</option>
                                        <option value="Mixed Use Development">Mixed Use Development</option>
                                        <option value="Plotted Development">Plotted Development</option>
                                        <option value="Township">Township</option>
                                    </select>
                                </div>

                                {/* Completion Percentage (only for ongoing) */}
                                {form.status === 'ongoing' && (
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-semibold text-green-800 dark:text-green-400">Project Completion</label>
                                            <span className="text-lg font-bold text-green-700 dark:text-green-400">{form.completionPercentage}%</span>
                                        </div>
                                        <input type="range" min="0" max="100" step="1" value={form.completionPercentage} onChange={(e) => setForm({ ...form, completionPercentage: Number(e.target.value) })} className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-green-500" />
                                        <div className="flex justify-between text-xs text-green-600 dark:text-green-500 mt-1"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
                                    </div>
                                )}

                                {/* Price, Area, Units */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (e.g., ₹45L)" className={inputCls} />
                                    <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Area (e.g., 1200 sq.ft)" className={inputCls} />
                                    <input type="text" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} placeholder="Units (e.g., 200)" className={inputCls} />
                                </div>

                                {/* Extra Project Details */}
                                <SectionHeader title="📋 Project Details" section="details" count={0} />
                                {expandedSections.details && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pl-1">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input type="text" value={form.totalFloors} onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} placeholder="Total Floors (e.g., G+14)" className={inputCls} />
                                            <input type="text" value={form.totalLandArea} onChange={(e) => setForm({ ...form, totalLandArea: e.target.value })} placeholder="Total Land Area (e.g., 5 Acres)" className={inputCls} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input type="text" value={form.possessionDate} onChange={(e) => setForm({ ...form, possessionDate: e.target.value })} placeholder="Possession Date (e.g., Dec 2027)" className={inputCls} />
                                            <input type="text" value={form.constructionType} onChange={(e) => setForm({ ...form, constructionType: e.target.value })} placeholder="Construction Type (e.g., RCC)" className={inputCls} />
                                        </div>
                                        <input type="text" value={form.reraNumber} onChange={(e) => setForm({ ...form, reraNumber: e.target.value })} placeholder="RERA Registration Number" className={inputCls} />

                                        {/* Configurations */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-2 ml-1">Configurations Details</label>
                                            <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-border/50 space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <input type="text" value={configForm.type} onChange={(e) => setConfigForm({ ...configForm, type: e.target.value })} placeholder="Type (e.g., 2 BHK)" className={inputCls} />
                                                    <input type="text" value={configForm.price} onChange={(e) => setConfigForm({ ...configForm, price: e.target.value })} placeholder="Price" className={inputCls} />
                                                    <input type="text" value={configForm.area} onChange={(e) => setConfigForm({ ...configForm, area: e.target.value })} placeholder="Area (Sq Ft)" className={inputCls} />
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <input type="number" value={configForm.bedrooms} onChange={(e) => setConfigForm({ ...configForm, bedrooms: e.target.value })} placeholder="Beds" className={inputCls} />
                                                    <input type="number" value={configForm.bathrooms} onChange={(e) => setConfigForm({ ...configForm, bathrooms: e.target.value })} placeholder="Baths" className={inputCls} />
                                                    <input type="number" value={configForm.balconies} onChange={(e) => setConfigForm({ ...configForm, balconies: e.target.value })} placeholder="Balconies" className={inputCls} />
                                                    <input type="number" value={configForm.parking} onChange={(e) => setConfigForm({ ...configForm, parking: e.target.value })} placeholder="Parking" className={inputCls} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <input type="text" value={configForm.description} onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })} placeholder="Short Description" className={inputCls} />
                                                    <button type="button" onClick={() => {
                                                        if (configForm.type) {
                                                            setConfigurations([...configurations, { ...configForm }]);
                                                            setConfigForm({ type: '', price: '', area: '', bedrooms: '', bathrooms: '', balconies: '', parking: '', description: '' });
                                                        } else {
                                                            alert('Configuration Type is required');
                                                        }
                                                    }} className="px-5 py-2 rounded-xl bg-gold-400 text-white text-sm font-medium hover:bg-gold-500 transition-colors shrink-0">Add Config</button>
                                                </div>
                                            </div>
                                            {configurations.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                                    {configurations.map((c, i) => (
                                                        <div key={i} className="relative p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-500/5">
                                                            <button type="button" onClick={() => removeItem(configurations, setConfigurations, i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"><FiX size={14} /></button>
                                                            <p className="font-semibold text-sm text-blue-900 dark:text-blue-400">{c.type}</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{c.area} • {c.price}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{c.bedrooms} Beds, {c.bathrooms} Baths, {c.balconies} Balconies, {c.parking} Parking</p>
                                                            {c.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bank Approvals */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Bank Approvals</label>
                                            <div className="flex gap-2">
                                                <input type="text" value={bankInput} onChange={(e) => setBankInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(bankApprovals, setBankApprovals, bankInput, setBankInput))} placeholder="Add bank (e.g., SBI, HDFC)..." className={inputCls} />
                                                <button type="button" onClick={() => addItem(bankApprovals, setBankApprovals, bankInput, setBankInput)} className="px-4 py-2 rounded-xl bg-gold-400 text-white text-sm font-medium hover:bg-gold-500 transition-colors shrink-0">Add</button>
                                            </div>
                                            {bankApprovals.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {bankApprovals.map((b, i) => (
                                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-1.5">
                                                            🏦 {b}<button type="button" onClick={() => removeItem(bankApprovals, setBankApprovals, i)} className="hover:text-red-500 transition-colors"><FiX size={12} /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Specifications */}
                                <SectionHeader title="🔧 Specifications" section="specs" count={0} />
                                {expandedSections.specs && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 pl-1">
                                        <input type="text" value={form.specFlooring} onChange={(e) => setForm({ ...form, specFlooring: e.target.value })} placeholder="Flooring (e.g., Vitrified tiles in living areas)" className={inputCls} />
                                        <input type="text" value={form.specDoors} onChange={(e) => setForm({ ...form, specDoors: e.target.value })} placeholder="Doors (e.g., Teak wood main door)" className={inputCls} />
                                        <input type="text" value={form.specWindows} onChange={(e) => setForm({ ...form, specWindows: e.target.value })} placeholder="Windows (e.g., UPVC windows with safety grills)" className={inputCls} />
                                        <input type="text" value={form.specKitchen} onChange={(e) => setForm({ ...form, specKitchen: e.target.value })} placeholder="Kitchen (e.g., Granite countertop, steel sink)" className={inputCls} />
                                        <input type="text" value={form.specBathroom} onChange={(e) => setForm({ ...form, specBathroom: e.target.value })} placeholder="Bathroom (e.g., Anti-skid tiles, premium fittings)" className={inputCls} />
                                        <input type="text" value={form.specElectrical} onChange={(e) => setForm({ ...form, specElectrical: e.target.value })} placeholder="Electrical (e.g., Concealed copper wiring)" className={inputCls} />
                                        <input type="text" value={form.specPainting} onChange={(e) => setForm({ ...form, specPainting: e.target.value })} placeholder="Painting (e.g., Asian Paints premium emulsion)" className={inputCls} />
                                    </motion.div>
                                )}

                                {/* Amenities */}
                                <SectionHeader title="🏢 Amenities" section="amenities" count={selectedAmenities.length} />
                                {expandedSections.amenities && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pl-1">
                                        {Object.entries(AMENITIES_LIST).map(([category, items]) => (
                                            <div key={category}>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{category}</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {items.map((amenity) => (
                                                        <label key={amenity} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all border ${selectedAmenities.includes(amenity) ? 'bg-gold-400/10 border-gold-400 text-gold-700 dark:text-gold-400 font-medium' : 'bg-gray-50 dark:bg-dark-border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-gold-300'}`}>
                                                            <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="sr-only" />
                                                            <div className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center text-[10px] shrink-0 ${selectedAmenities.includes(amenity) ? 'bg-gold-400 border-gold-400 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                                                {selectedAmenities.includes(amenity) && '✓'}
                                                            </div>
                                                            {amenity}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Best Features */}
                                <SectionHeader title="⭐ Best Features" section="features" count={bestFeatures.length} />
                                {expandedSections.features && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 pl-1">
                                        <div className="flex gap-2">
                                            <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(bestFeatures, setBestFeatures, featureInput, setFeatureInput))} placeholder="Add a best feature..." className={inputCls} />
                                            <button type="button" onClick={() => addItem(bestFeatures, setBestFeatures, featureInput, setFeatureInput)} className="px-4 py-2 rounded-xl bg-gold-400 text-white text-sm font-medium hover:bg-gold-500 transition-colors shrink-0">Add</button>
                                        </div>
                                        {bestFeatures.length > 0 && (
                                            <div className="space-y-2">
                                                {bestFeatures.map((f, i) => (
                                                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold-50 dark:bg-gold-400/10 border border-gold-200 dark:border-gold-400/20 text-sm text-gray-800 dark:text-gray-200">
                                                        <span className="text-gold-500">★</span>
                                                        <span className="flex-1">{f}</span>
                                                        <button type="button" onClick={() => removeItem(bestFeatures, setBestFeatures, i)} className="text-gray-400 hover:text-red-500 transition-colors"><FiX size={14} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Location */}
                                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location Address" className={inputCls} />
                                <textarea value={form.mapEmbed} onChange={(e) => setForm({ ...form, mapEmbed: e.target.value })} rows={2} placeholder="Google Maps Embed Code" className={`${inputCls} font-mono text-xs`} />

                                {/* Project Video URL */}
                                <input type="text" 
                                    value={form.videoId ? `https://www.youtube.com/watch?v=${form.videoId}` : ''} 
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (!raw) {
                                            setForm(prev => ({ ...prev, videoId: '' }));
                                            return;
                                        }
                                        const id = extractVideoId(raw);
                                        if (id) {
                                            setForm(prev => ({ ...prev, videoId: id }));
                                        } else {
                                            // Handle edge cases later, just store empty if we can't parse or set raw to alert length over
                                            if (raw.length > 20 && !raw.includes('youtube.com') && !raw.includes('youtu.be')) alert('Invalid YouTube URL');
                                        }
                                    }} 
                                    placeholder="Project Video (YouTube URL)" 
                                    className={inputCls} 
                                />

                                {/* Images */}
                                <SectionHeader title="📸 Categorized Images" section="images" count={imageGroups.length} />
                                {expandedSections.images && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pl-1">
                                        {imageGroups.map((group, groupIdx) => (
                                            <div key={groupIdx} className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-border/50 space-y-3 relative">
                                                <button type="button" onClick={() => {
                                                    const newGroups = [...imageGroups];
                                                    newGroups.splice(groupIdx, 1);
                                                    setImageGroups(newGroups);
                                                }} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><FiX size={16} /></button>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                                                    <select value={group.category} onChange={(e) => {
                                                        const newG = [...imageGroups]; newG[groupIdx].category = e.target.value; setImageGroups(newG);
                                                    }} className={inputCls} required>
                                                        <option value="">Select Category...</option>
                                                        <option value="Exterior">Exterior</option>
                                                        <option value="Interior">Interior</option>
                                                        <option value="Floor Plan">Floor Plan</option>
                                                        <option value="Amenities">Amenities</option>
                                                        <option value="Construction Update">Construction Update</option>
                                                        <option value="General">General</option>
                                                    </select>
                                                    <input type="text" value={group.label} onChange={(e) => {
                                                        const newG = [...imageGroups]; newG[groupIdx].label = e.target.value; setImageGroups(newG);
                                                    }} placeholder="Label (e.g., Kitchen, Elevation)" className={inputCls} required />
                                                </div>
                                                
                                                <div className="border border-dashed border-gray-300 dark:border-dark-border rounded-lg p-3 bg-white dark:bg-dark-card">
                                                    <input type="file" multiple accept="image/*" onChange={(e) => {
                                                        const newG = [...imageGroups]; newG[groupIdx].files = Array.from(e.target.files); setImageGroups(newG);
                                                    }} className="text-sm text-gray-500 w-full" />
                                                    
                                                    {group.existingUrls.length > 0 && (
                                                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                                            {group.existingUrls.map((url, urlIdx) => (
                                                                <div key={urlIdx} className="relative shrink-0">
                                                                    <img src={url} alt="" className="w-12 h-12 object-cover rounded shadow-sm" />
                                                                    <button type="button" onClick={() => {
                                                                        const newG = [...imageGroups];
                                                                        newG[groupIdx].existingUrls = newG[groupIdx].existingUrls.filter((_, i) => i !== urlIdx);
                                                                        setImageGroups(newG);
                                                                    }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md"><FiX size={10}/></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {group.files.length > 0 && <p className="text-xs text-gold-500 mt-2">{group.files.length} new image(s) selected</p>}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <button type="button" onClick={() => setImageGroups([...imageGroups, { category: '', label: '', files: [], existingUrls: [] }])} className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border text-gray-500 hover:border-gold-400 hover:text-gold-400 transition-colors flex items-center justify-center gap-2 font-medium text-sm">
                                            <FiPlus size={16} /> Add Image Group
                                        </button>
                                    </motion.div>
                                )}

                                <button type="submit" disabled={saving} className="w-full py-3 rounded-xl btn-shimmer text-white font-semibold disabled:opacity-50">
                                    {saving ? 'Saving...' : editing ? 'Update Project' : 'Create Project'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${p.status === 'ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-gold-100 text-gold-700 dark:bg-gold-400/20 dark:text-gold-400'}`}>
                                                    {p.status}
                                                </span>
                                                {p.status === 'ongoing' && p.completionPercentage > 0 && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${p.completionPercentage}%` }}></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{p.completionPercentage}%</span>
                                                    </div>
                                                )}
                                            </div>
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
