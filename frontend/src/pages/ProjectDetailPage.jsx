import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImageGallery from '../components/ImageGallery';
import AmenitiesGrid from '../components/AmenitiesGrid';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiStar, FiCalendar as FiCalendarIcon, FiPhone, FiDownload, FiHeart, FiShare2, FiCheckCircle, FiX, FiAward, FiHome, FiLayers, FiGrid, FiClock, FiShield, FiMapPin as FiMap } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { generateProjectPDF } from '../utils/generateProjectPDF';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const [reviewMsg, setReviewMsg] = useState('');
    const [bookingForm, setBookingForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', preferredDate: '', message: 'I am interested in this project and would like to learn more.' });
    const [bookingMsg, setBookingMsg] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        api.get('/favorites').then(res => {
            setIsFav(res.data.some(f => f._id === id));
        }).catch(() => { });
    }, [id]);

    const toggleFav = async () => {
        try {
            if (isFav) { await api.delete(`/favorites/${id}`); setIsFav(false); }
            else { await api.post(`/favorites/${id}`); setIsFav(true); }
        } catch (err) { console.error('Favorite toggle failed'); }
    };

    useEffect(() => {
        Promise.all([
            api.get(`/projects/${id}`),
            api.get(`/feedback/project/${id}`),
        ]).then(([pRes, fRes]) => {
            setProject(pRes.data);
            setFeedback(fRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    const handleReview = async (e) => {
        e.preventDefault();
        try {
            await api.post('/feedback', { projectId: id, ...review });
            setReviewMsg('Review submitted for approval!');
            setReview({ rating: 5, comment: '' });
            setTimeout(() => setReviewMsg(''), 3000);
        } catch (err) {
            setReviewMsg(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        
        if (!bookingForm.preferredDate) {
            setBookingMsg('Please select a Date of Visit.');
            return;
        }

        setBookingMsg('');
        setBookingLoading(true);
        try {
            await api.post('/site-visit/book', { ...bookingForm, projectId: id });
            setBookingMsg('');
            setBookingSuccess(true);
            setBookingForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', preferredDate: '', message: 'I am interested in this project and would like to learn more.' });
            setShowBooking(false);
        } catch (err) {
            setBookingMsg(err.response?.data?.message || 'Failed to book visit');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!project) return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <p className="text-gray-400">Project not found</p>
        </div>
    );

    const hasSpecs = project.specifications && Object.values(project.specifications).some(v => v);

    return (
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors">
            <Navbar />
            <div className="pt-20 sm:pt-24 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-2 lg:order-1">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-gold-400/20 text-gold-400'}`}>
                                            {project.status === 'ongoing' ? '🏗 Ongoing' : '✅ Completed'}
                                        </span>
                                        {project.projectType && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                                                {project.projectType}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={toggleFav} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${isFav ? 'border-red-400 bg-red-500/10 text-red-400' : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-red-400 hover:text-red-400'}`}>
                                        <FiHeart size={16} style={isFav ? { fill: '#f87171' } : {}} />
                                        {isFav ? 'Saved' : 'Save'}
                                    </button>
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">{project.name}</h1>
                                {project.location?.address && (
                                    <div className="flex items-center text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                                        <FiMapPin className="mr-2 text-gold-400 flex-shrink-0" size={16} /> 
                                        <span className="truncate">{project.location.address}</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Completion Progress Bar (Ongoing Only) */}
                            {project.status === 'ongoing' && project.completionPercentage > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-dark-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">🏗 Project Progress</h2>
                                        <span className="text-2xl font-bold text-green-500">{project.completionPercentage}%</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.completionPercentage}%` }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                            className="h-full rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>Foundation</span>
                                        <span>Structure</span>
                                        <span>Finishing</span>
                                        <span>Handover</span>
                                    </div>
                                    {project.possessionDate && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-2">
                                            <FiClock size={14} className="text-gold-400" /> Expected Possession: <strong className="text-gray-800 dark:text-white">{project.possessionDate}</strong>
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            <ImageGallery images={project.images} categorizedImages={project.categorizedImages} />

                            <div className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-dark-border">
                                <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">About This Project</h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-[1.7]">{project.description}</p>
                            </div>

                            {/* Project Details Card */}
                            {(project.projectType || project.totalFloors || project.totalLandArea || project.constructionType || project.reraNumber || (project.configurations && project.configurations.length > 0)) && (
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-dark-border">
                                    <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">📋 Project Details</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {project.projectType && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                                <FiHome size={18} className="text-gold-400 mt-0.5 shrink-0" />
                                                <div><p className="text-xs text-gray-500">Project Type</p><p className="text-sm font-medium text-gray-900 dark:text-white">{project.projectType}</p></div>
                                            </div>
                                        )}
                                        {project.totalFloors && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                                <FiLayers size={18} className="text-gold-400 mt-0.5 shrink-0" />
                                                <div><p className="text-xs text-gray-500">Total Floors</p><p className="text-sm font-medium text-gray-900 dark:text-white">{project.totalFloors}</p></div>
                                            </div>
                                        )}
                                        {project.totalLandArea && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                                <FiMap size={18} className="text-gold-400 mt-0.5 shrink-0" />
                                                <div><p className="text-xs text-gray-500">Total Land Area</p><p className="text-sm font-medium text-gray-900 dark:text-white">{project.totalLandArea}</p></div>
                                            </div>
                                        )}
                                        {project.constructionType && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                                <FiGrid size={18} className="text-gold-400 mt-0.5 shrink-0" />
                                                <div><p className="text-xs text-gray-500">Construction Type</p><p className="text-sm font-medium text-gray-900 dark:text-white">{project.constructionType}</p></div>
                                            </div>
                                        )}
                                        {project.possessionDate && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                                <FiClock size={18} className="text-gold-400 mt-0.5 shrink-0" />
                                                <div><p className="text-xs text-gray-500">Possession Date</p><p className="text-sm font-medium text-gray-900 dark:text-white">{project.possessionDate}</p></div>
                                            </div>
                                        )}
                                        {project.reraNumber && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                                <FiShield size={18} className="text-gold-400 mt-0.5 shrink-0" />
                                                <div><p className="text-xs text-gray-500">RERA Number</p><p className="text-sm font-medium text-gray-900 dark:text-white">{project.reraNumber}</p></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Configurations */}
                                    {project.configurations && project.configurations.length > 0 && (
                                        <div className="mt-5">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Configurations</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.configurations.map((c, i) => (
                                                    <span key={i} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-medium">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bank Approvals */}
                                    {project.bankApprovals && project.bankApprovals.length > 0 && (
                                        <div className="mt-5">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🏦 Bank Approvals</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.bankApprovals.map((b, i) => (
                                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm font-medium">
                                                        ✓ {b}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Best Features */}
                            {project.bestFeatures && project.bestFeatures.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-dark-border">
                                    <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">⭐ Best Features</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {project.bestFeatures.map((feature, i) => (
                                            <motion.div key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                viewport={{ once: true }}
                                                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-400/5 dark:to-amber-400/5 border border-gold-200/50 dark:border-gold-400/20"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center shrink-0">
                                                    <FiAward size={16} className="text-gold-500" />
                                                </div>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium pt-1">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Amenities */}
                            {project.amenities && project.amenities.length > 0 && (
                                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                                    <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">🏢 Amenities</h2>
                                    <AmenitiesGrid amenities={project.amenities} />
                                </div>
                            )}

                            {/* Specifications */}
                            {hasSpecs && (
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-dark-border">
                                    <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">🔧 Specifications</h2>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Flooring', value: project.specifications?.flooring, emoji: '🏠' },
                                            { label: 'Doors', value: project.specifications?.doors, emoji: '🚪' },
                                            { label: 'Windows', value: project.specifications?.windows, emoji: '🪟' },
                                            { label: 'Kitchen', value: project.specifications?.kitchen, emoji: '🍳' },
                                            { label: 'Bathroom', value: project.specifications?.bathroom, emoji: '🚿' },
                                            { label: 'Electrical', value: project.specifications?.electrical, emoji: '⚡' },
                                            { label: 'Painting', value: project.specifications?.painting, emoji: '🎨' },
                                        ].filter(s => s.value).map((spec, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                                                <span className="text-lg">{spec.emoji}</span>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">{spec.label}</p>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200">{spec.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Location Map */}
                            {(project.coordinates?.lat || project.location?.mapEmbed) && (
                                <div className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-dark-border">
                                    <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">📍 Location</h2>
                                    {project.location?.address && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex items-center gap-2">
                                            <FiMapPin size={14} className="text-gold-400" />
                                            {project.location.address}
                                        </p>
                                    )}
                                    {project.coordinates?.lat ? (
                                        <div className="rounded-xl overflow-hidden h-72">
                                            <iframe
                                                title="Project Location"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://www.google.com/maps?q=${project.coordinates.lat},${project.coordinates.lng}&z=15&output=embed`}
                                            />
                                        </div>
                                    ) : project.location?.mapEmbed ? (
                                        <div className="rounded-xl overflow-hidden" dangerouslySetInnerHTML={{ __html: project.location.mapEmbed }} />
                                    ) : null}
                                </div>
                            )}

                            {/* Reviews */}
                            <div className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-dark-border">
                                <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Customer Reviews</h2>

                                {feedback.length > 0 ? (
                                    <div className="space-y-4 mb-8">
                                        {feedback.map((f, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{f.userId?.name || 'User'}</span>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, j) => (
                                                            <FiStar key={j} size={14} className={j < f.rating ? 'text-gold-400 fill-gold-400' : 'text-gray-300'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{f.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm mb-6">No reviews yet. Be the first to review!</p>
                                )}

                                <form onSubmit={handleReview} className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Leave a Review</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Rating:</span>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button key={n} type="button" onClick={() => setReview({ ...review, rating: n })}>
                                                <FiStar size={20} className={n <= review.rating ? 'text-gold-400 fill-gold-400' : 'text-gray-300'} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={review.comment}
                                        onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm"
                                        placeholder="Share your experience..."
                                        required
                                    />
                                    <button type="submit" className="px-6 py-2.5 rounded-xl btn-shimmer text-white text-sm font-medium">Submit Review</button>
                                    {reviewMsg && <p className="text-gold-400 text-sm">{reviewMsg}</p>}
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar order-1 lg:order-2">
                            <div className="bg-white dark:bg-dark-card rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-dark-border">
                                {project.price && (
                                    <div className="mb-4">
                                        <span className="text-sm text-gray-500">Starting from</span>
                                        <p className="text-2xl font-heading font-bold text-gold-400">{project.price}</p>
                                    </div>
                                )}

                                <div className="bg-gray-50 dark:bg-dark-border/30 rounded-xl mb-6 border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
                                    {project.area && <div className="flex justify-between items-center p-3 sm:px-4 sm:py-3"><span className="text-xs text-gray-500">Area</span><span className="text-sm text-gray-900 dark:text-white font-medium text-right">{project.area}</span></div>}
                                    {project.units && <div className="flex justify-between items-center p-3 sm:px-4 sm:py-3"><span className="text-xs text-gray-500">Units</span><span className="text-sm text-gray-900 dark:text-white font-medium text-right">{project.units}</span></div>}
                                    <div className="flex justify-between items-center p-3 sm:px-4 sm:py-3"><span className="text-xs text-gray-500">Status</span><span className="text-sm text-gray-900 dark:text-white font-medium capitalize text-right">{project.status}</span></div>
                                    {project.projectType && <div className="flex justify-between items-center p-3 sm:px-4 sm:py-3"><span className="text-xs text-gray-500">Type</span><span className="text-sm text-gray-900 dark:text-white font-medium text-right">{project.projectType}</span></div>}
                                    {project.totalFloors && <div className="flex justify-between items-center p-3 sm:px-4 sm:py-3"><span className="text-xs text-gray-500">Floors</span><span className="text-sm text-gray-900 dark:text-white font-medium text-right">{project.totalFloors}</span></div>}
                                    {project.possessionDate && <div className="flex justify-between items-center p-3 sm:px-4 sm:py-3"><span className="text-xs text-gray-500">Possession</span><span className="text-sm text-gray-900 dark:text-white font-medium text-right">{project.possessionDate}</span></div>}
                                </div>

                                <div className="flex flex-col gap-2.5 sm:gap-3">
                                    <button onClick={() => setShowBooking(!showBooking)} className="w-full py-2.5 sm:py-3 rounded-xl btn-shimmer text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-gold-400/20 text-sm sm:text-base">
                                        <FiCalendarIcon size={16} /> Book Site Visit
                                    </button>
                                    <a href="tel:+919876543210" className="w-full py-2.5 sm:py-3 rounded-xl border-2 border-gold-400 text-gold-400 font-semibold flex items-center justify-center gap-2 hover:bg-gold-400/10 transition-colors text-sm sm:text-base">
                                        <FiPhone size={16} /> Contact Sales
                                    </a>
                                    {project.brochureUrl && (
                                        <a href={project.brochureUrl} download className="w-full py-2.5 sm:py-3 rounded-xl bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-medium flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-dark-border/80 transition-colors text-sm sm:text-base">
                                            <FiDownload size={16} /> Download Brochure
                                        </a>
                                    )}
                                    <button
                                        onClick={() => generateProjectPDF(project)}
                                        className="w-full py-2.5 sm:py-3 rounded-xl bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-medium flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-dark-border/80 transition-controls text-sm sm:text-base"
                                    >
                                        <FiShare2 size={16} /> Share as PDF
                                    </button>
                                </div>

                                {/* Move bookingMsg from here to below the form to make it visible */}
                            </div>

                            {/* Booking Form */}
                            {showBooking && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                                    <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">Book a Site Visit</h3>
                                    <form onSubmit={handleBooking} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Full Name</label>
                                            <input type="text" value={bookingForm.name} onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })} placeholder="Enter your full name" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Email Address</label>
                                            <input type="email" value={bookingForm.email} onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })} placeholder="Enter your email address" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Phone Number</label>
                                            <input type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })} placeholder="Enter your phone number" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2 ml-1">
                                                <label className="block text-xs font-medium text-gray-500">Date of Visit</label>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => setBookingForm({ ...bookingForm, preferredDate: new Date().toISOString().split('T')[0] })} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 hover:bg-gold-400 hover:text-white transition-colors">Today</button>
                                                    <button type="button" onClick={() => { const tmrp = new Date(); tmrp.setDate(tmrp.getDate() + 1); setBookingForm({ ...bookingForm, preferredDate: tmrp.toISOString().split('T')[0] }) }} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 hover:bg-gold-400 hover:text-white transition-colors">Tomorrow</button>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-dark-border/50 rounded-xl overflow-hidden custom-calendar-wrapper border border-gray-200 dark:border-dark-border">
                                                <Calendar
                                                    onChange={(date) => {
                                                        const d = new Date(date);
                                                        // adjust for timezone offset
                                                        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                                                        setBookingForm({ ...bookingForm, preferredDate: d.toISOString().split('T')[0] });
                                                    }}
                                                    value={bookingForm.preferredDate ? new Date(bookingForm.preferredDate) : null}
                                                    minDate={new Date()}
                                                    className="w-full !border-0 font-sans text-sm"
                                                />
                                            </div>
                                            <style>{`
                                                .custom-calendar-wrapper .react-calendar { width: 100%; border: none; background: transparent; font-family: inherit; }
                                                .dark .custom-calendar-wrapper .react-calendar { color: #fff; }
                                                .dark .custom-calendar-wrapper .react-calendar__navigation button { color: #fff; min-width: 44px; background: none; font-size: 16px; margin-top: 8px; }
                                                .dark .custom-calendar-wrapper .react-calendar__navigation button:hover, .dark .custom-calendar-wrapper .react-calendar__navigation button:focus { background-color: rgba(255,255,255,0.1); }
                                                .dark .custom-calendar-wrapper .react-calendar__month-view__weekdays { color: #9ca3af; font-weight: 500; font-size: 0.75em; text-transform: uppercase; }
                                                .dark .custom-calendar-wrapper .react-calendar__month-view__days__day { color: #d1d5db; }
                                                .dark .custom-calendar-wrapper .react-calendar__month-view__days__day:hover, .dark .custom-calendar-wrapper .react-calendar__month-view__days__day:focus { background-color: rgba(255,255,255,0.1); border-radius: 6px; }
                                                .dark .custom-calendar-wrapper .react-calendar__month-view__days__day--weekend { color: #f87171; }
                                                .dark .custom-calendar-wrapper .react-calendar__month-view__days__day--neighboringMonth { color: #4b5563; }
                                                .custom-calendar-wrapper .react-calendar__tile--active { background: #C4A44B !important; color: #0a1628 !important; font-weight: bold; border-radius: 6px; }
                                                .custom-calendar-wrapper .react-calendar__tile--now { background: rgba(196, 164, 75, 0.2); border-radius: 6px; }
                                                .custom-calendar-wrapper .react-calendar__tile { padding: 10px 0.5em; font-size: 14px; }
                                            `}</style>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Message (Optional)</label>
                                            <textarea value={bookingForm.message} onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })} rows={2} placeholder="Any specific requirements?" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                                        </div>
                                        <button type="submit" disabled={bookingLoading} className="w-full py-2.5 rounded-xl btn-shimmer text-white font-medium text-sm mt-2 disabled:opacity-50">
                                            {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                                        </button>
                                        {bookingMsg && <p className="text-red-400 text-sm mt-2 text-center">{bookingMsg}</p>}
                                    </form>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {bookingSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-dark-card rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center border border-gray-100 dark:border-dark-border"
                    >
                        <button
                            onClick={() => setBookingSuccess(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle className="text-green-500" size={32} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Your site visit has been successfully booked. Our team will contact you shortly to confirm the timings.
                        </p>
                        <button
                            onClick={() => setBookingSuccess(false)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-colors"
                        >
                            Done
                        </button>
                    </motion.div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ProjectDetailPage;
