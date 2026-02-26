import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImageGallery from '../components/ImageGallery';
import AmenitiesGrid from '../components/AmenitiesGrid';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiStar, FiCalendar, FiPhone, FiDownload, FiHeart, FiShare2 } from 'react-icons/fi';
import { generateProjectPDF } from '../utils/generateProjectPDF';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const [reviewMsg, setReviewMsg] = useState('');
    const [bookingForm, setBookingForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', preferredDate: '', message: '' });
    const [bookingMsg, setBookingMsg] = useState('');
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
        try {
            await api.post('/site-visit/book', { ...bookingForm, projectId: id });
            setBookingMsg('Site visit booked successfully! We will contact you soon.');
            setShowBooking(false);
            setTimeout(() => setBookingMsg(''), 5000);
        } catch (err) {
            setBookingMsg(err.response?.data?.message || 'Failed to book visit');
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

    return (
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors">
            <Navbar />
            <div className="pt-24 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-gold-400/20 text-gold-400'}`}>
                                        {project.status === 'ongoing' ? '🏗 Ongoing' : '✅ Completed'}
                                    </span>
                                    <button onClick={toggleFav} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${isFav ? 'border-red-400 bg-red-500/10 text-red-400' : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-red-400 hover:text-red-400'}`}>
                                        <FiHeart size={16} style={isFav ? { fill: '#f87171' } : {}} />
                                        {isFav ? 'Saved' : 'Save'}
                                    </button>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">{project.name}</h1>
                                {project.location?.address && (
                                    <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                                        <FiMapPin className="mr-2 text-gold-400" size={16} /> {project.location.address}
                                    </div>
                                )}
                            </motion.div>

                            <ImageGallery images={project.images} />

                            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">About This Project</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.description}</p>
                            </div>

                            {/* Amenities */}
                            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">Amenities</h2>
                                <AmenitiesGrid amenities={project.amenities} />
                            </div>

                            {/* Location Map */}
                            {(project.coordinates?.lat || project.location?.mapEmbed) && (
                                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                                    <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">📍 Location</h2>
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
                            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>

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
                        <div className="space-y-6 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border">
                                {project.price && (
                                    <div className="mb-4">
                                        <span className="text-sm text-gray-500">Starting from</span>
                                        <p className="text-2xl font-heading font-bold text-gold-400">{project.price}</p>
                                    </div>
                                )}

                                <div className="space-y-3 mb-6">
                                    {project.area && <div className="flex justify-between text-sm"><span className="text-gray-500">Area</span><span className="text-gray-900 dark:text-white font-medium">{project.area}</span></div>}
                                    {project.units && <div className="flex justify-between text-sm"><span className="text-gray-500">Units</span><span className="text-gray-900 dark:text-white font-medium">{project.units}</span></div>}
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="text-gray-900 dark:text-white font-medium capitalize">{project.status}</span></div>
                                </div>

                                <div className="space-y-3">
                                    <button onClick={() => setShowBooking(!showBooking)} className="w-full py-3 rounded-xl btn-shimmer text-white font-semibold flex items-center justify-center gap-2">
                                        <FiCalendar size={16} /> Book Site Visit
                                    </button>
                                    <a href="tel:+919876543210" className="w-full py-3 rounded-xl border-2 border-gold-400 text-gold-400 font-semibold flex items-center justify-center gap-2 hover:bg-gold-400/10 transition-colors">
                                        <FiPhone size={16} /> Contact Sales
                                    </a>
                                    {project.brochureUrl && (
                                        <a href={project.brochureUrl} download className="w-full py-3 rounded-xl bg-primary-800 text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors">
                                            <FiDownload size={16} /> Download Brochure
                                        </a>
                                    )}
                                    <button
                                        onClick={() => generateProjectPDF(project)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 text-white font-semibold flex items-center justify-center gap-2 hover:from-primary-600 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-900/20"
                                    >
                                        <FiShare2 size={16} /> Share as PDF
                                    </button>
                                </div>

                                {bookingMsg && <p className="text-gold-400 text-sm mt-4 text-center">{bookingMsg}</p>}
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
                                            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Date of Visit</label>
                                            <input type="date" value={bookingForm.preferredDate} onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Message (Optional)</label>
                                            <textarea value={bookingForm.message} onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })} rows={2} placeholder="Any specific requirements?" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white text-sm" />
                                        </div>
                                        <button type="submit" className="w-full py-2.5 rounded-xl btn-shimmer text-white font-medium text-sm mt-2">Confirm Booking</button>
                                    </form>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProjectDetailPage;
