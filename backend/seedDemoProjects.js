require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

const a = (name, icon) => ({ name, icon });

const projects = [
    { name: 'PVR Grand Heights', description: 'Premium 2 & 3 BHK apartments with world-class amenities, landscaped gardens, and panoramic city views in the heart of Vijayawada.', status: 'ongoing', images: [], amenities: [a('Swimming Pool', '🏊'), a('Gym', '🏋️'), a('Clubhouse', '🏠'), a('Children Play Area', '🎠'), a('24/7 Security', '🔒')], location: { address: 'MG Road, Vijayawada, Andhra Pradesh', mapEmbed: '' }, price: '₹1.2 Crores Onwards', area: '1450-2200 sq.ft', units: '120 Apartments', highlights: ['RERA Approved', 'Vastu Compliant', 'Smart Home Features'] },
    { name: 'PVR Emerald Villas', description: 'Exclusive gated community of independent luxury villas with private gardens, modern architecture, and premium finishes.', status: 'completed', images: [], amenities: [a('Private Garden', '🌳'), a('Modular Kitchen', '🍳'), a('Car Parking', '🚗'), a('Intercom', '📞'), a('Power Backup', '⚡')], location: { address: 'Gannavaram, Vijayawada, Andhra Pradesh', mapEmbed: '' }, price: '₹1.8 Crores Onwards', area: '2400-3500 sq.ft', units: '48 Villas', highlights: ['Gated Community', '24/7 Water Supply', 'Near Airport'] },
    { name: 'PVR Business Tower', description: 'State-of-the-art commercial complex with modern office spaces, retail outlets, and co-working zones in a prime business district.', status: 'completed', images: [], amenities: [a('High-Speed Elevators', '🛗'), a('Central AC', '❄️'), a('Food Court', '🍽️'), a('Conference Rooms', '📊'), a('Ample Parking', '🅿️')], location: { address: 'Auto Nagar, Vijayawada, Andhra Pradesh', mapEmbed: '' }, price: '₹45 Lakhs Onwards', area: '500-5000 sq.ft', units: '200 Office Spaces', highlights: ['Prime Location', 'IT Infrastructure', 'Green Building Certified'] },
    { name: 'Raintree Park Residency', description: 'Sprawling residential township with lush green surroundings, sports facilities, and a vibrant community lifestyle.', status: 'ongoing', images: [], amenities: [a('Tennis Court', '🎾'), a('Jogging Track', '🏃'), a('Mini Theatre', '🎬'), a('Library', '📚'), a('Meditation Hall', '🧘')], location: { address: 'Tadepalli, Vijayawada, Andhra Pradesh', mapEmbed: '' }, price: '₹65 Lakhs Onwards', area: '1100-1800 sq.ft', units: '350 Apartments', highlights: ['Township Living', 'River View', 'Eco-Friendly'] },
    { name: 'PVR Royal Enclave', description: 'Ultra-luxury penthouse and duplex apartments offering unmatched elegance with Italian marble flooring and designer interiors.', status: 'ongoing', images: [], amenities: [a('Rooftop Pool', '🏊'), a('Sky Lounge', '🌃'), a('Private Elevator', '🛗'), a('Concierge Service', '🛎️'), a('Spa', '💆')], location: { address: 'Benz Circle, Vijayawada, Andhra Pradesh', mapEmbed: '' }, price: '₹2.5 Crores Onwards', area: '3000-4500 sq.ft', units: '32 Luxury Units', highlights: ['Ultra Luxury', 'Landmark Location', 'Imported Fixtures'] },
    { name: 'PVR Silicon Valley', description: 'Modern IT park with plug-and-play office spaces designed for startups and enterprises, featuring cutting-edge infrastructure.', status: 'ongoing', images: [], amenities: [a('Server Room', '🖥️'), a('Cafeteria', '☕'), a('ATM', '🏧'), a('Pharmacy', '💊'), a('Shuttle Service', '🚌')], location: { address: 'Mangalagiri, Guntur, Andhra Pradesh', mapEmbed: '' }, price: '₹35 Lakhs Onwards', area: '400-10000 sq.ft', units: '500 Office Units', highlights: ['Near Capital Region', '24/7 Power', 'Fiber Optic Connectivity'] },
    { name: 'PVR Lakeside Retreat', description: 'Serene waterfront apartments with breathtaking lake views, infinity pool, and resort-style living in a tranquil setting.', status: 'completed', images: [], amenities: [a('Infinity Pool', '🏊'), a('Yoga Deck', '🧘'), a('Boating', '🚣'), a('Amphitheatre', '🎭'), a('BBQ Area', '🍖')], location: { address: 'Kondapalli, Vijayawada, Andhra Pradesh', mapEmbed: '' }, price: '₹85 Lakhs Onwards', area: '1300-2100 sq.ft', units: '96 Apartments', highlights: ['Lakefront Living', 'Hill View', 'Weekend Home'] },
    { name: 'PVR Golden Square', description: 'Premium shopping mall and entertainment hub with international brand outlets, multiplex cinema, and gourmet dining options.', status: 'ongoing', images: [], amenities: [a('Multiplex', '🎬'), a('Food Court', '🍔'), a('Kids Zone', '🎠'), a('Escalators', '🛗'), a('Valet Parking', '🚗')], location: { address: 'Labbipet, Vijayawada, Andhra Pradesh', mapEmbed: '' }, price: '₹55 Lakhs Onwards', area: '300-8000 sq.ft', units: '150 Retail Spaces', highlights: ['High Footfall Area', 'Anchor Tenants', 'Smart Mall'] }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB');
    for (const p of projects) {
        const exists = await Project.findOne({ name: p.name });
        if (!exists) {
            await Project.create(p);
            console.log('Created:', p.name);
        } else {
            console.log('Already exists:', p.name);
        }
    }
    console.log('\nDone! Total projects:', await Project.countDocuments());
    await mongoose.disconnect();
    process.exit(0);
}).catch(err => { console.error('Error:', err.message); process.exit(1); });
