require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

const MONGODB_URI = process.env.MONGODB_URI;

const images = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600607687931-cebf10cb4cb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600607687644-8716d7eb4eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4ea0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
];

const projects = [
    {
        name: 'PVR The Skyline',
        description: 'Premium high-rise apartments with panoramic views of the city. Featuring smart home tech, expansive balconies, and club class amenities.',
        status: 'ongoing',
        images: [images[0], images[1], images[2]],
        amenities: [{ name: 'Gym', icon: 'FiActivity' }, { name: 'Pool', icon: 'FiDroplet' }, { name: '24/7 Security', icon: 'FiShield' }],
        location: { address: 'Benz Circle, Vijayawada', mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.2152876611343!2d80.64808631486518!3d16.513479988607153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35f000b208eb67%3A0xe6bf4dc1a0df92b!2sBenz%20Circle%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1689234858925!5m2!1sen!2sin" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>' },
        price: '₹1.5 Cr Onwards',
        area: '1800 - 3200 sq.ft',
        units: '3 BHK, 4 BHK',
        highlights: ['Smart Home Automation', 'Infinity Pool', 'Helipad', 'EV Charging Station'],
        coordinates: { lat: 16.5062, lng: 80.6480 },
    },
    {
        name: 'PVR Golden Villas',
        description: 'Ultra-luxury independent villas nestled in serene greenery. Private gardens, double-height ceilings, and world-class leisure facilities.',
        status: 'completed',
        images: [images[3], images[4], images[1]],
        amenities: [{ name: 'Clubhouse', icon: 'FiCoffee' }, { name: 'Park', icon: 'FiSun' }, { name: 'Tennis Court', icon: 'FiTarget' }],
        location: { address: 'Mangalagiri Road, Vijayawada', mapEmbed: '' },
        price: '₹3.2 Cr Onwards',
        area: '4000 - 6500 sq.ft',
        units: '5 BHK Villas',
        highlights: ['Private Cinema', 'Private Pool', 'Vastu Compliant', 'Lush Landscapes'],
        coordinates: { lat: 16.4344, lng: 80.5662 },
    },
    {
        name: 'PVR Tech Park Residences',
        description: 'Modern apartments designed for IT professionals. Co-working spaces within the premises, blazing fast internet, and modern minimalistic design.',
        status: 'ongoing',
        images: [images[5], images[6], images[0]],
        amenities: [{ name: 'Co-working Space', icon: 'FiCpu' }, { name: 'Gym', icon: 'FiActivity' }, { name: 'Cafeteria', icon: 'FiCoffee' }],
        location: { address: 'Autonagar, Vijayawada', mapEmbed: '' },
        price: '₹85 Lakhs Onwards',
        area: '1200 - 1800 sq.ft',
        units: '2 BHK, 3 BHK',
        highlights: ['Business Lounge', 'Proximity to IT Hubs', 'Solar Panels', 'Smart Access'],
        coordinates: { lat: 16.4950, lng: 80.6720 },
    },
    {
        name: 'PVR Grandeur',
        description: 'An architectural masterpiece offering palatial apartments. A blend of classical aesthetics and modern luxury in the heart of the city.',
        status: 'completed',
        images: [images[7], images[8], images[2]],
        amenities: [{ name: 'Spa', icon: 'FiSmile' }, { name: 'Library', icon: 'FiBook' }, { name: 'Concierge', icon: 'FiBell' }],
        location: { address: 'Patamata, Vijayawada', mapEmbed: '' },
        price: '₹2.1 Cr Onwards',
        area: '2500 - 4500 sq.ft',
        units: '4 BHK',
        highlights: ['Italian Marble Flooring', 'Home Automation', 'Grand Lobby', 'Temperature Controlled Pool'],
        coordinates: { lat: 16.4990, lng: 80.6540 },
    },
    {
        name: 'PVR Serenity Enclave',
        description: 'Peaceful and tranquil living away from the city chaos. Surrounded by nature, offering a perfect ecosystem for families and elders.',
        status: 'ongoing',
        images: [images[9], images[0], images[3]],
        amenities: [{ name: 'Yoga Deck', icon: 'FiWind' }, { name: 'Walking Trail', icon: 'FiMap' }, { name: 'Clinic', icon: 'FiHeart' }],
        location: { address: 'Poranki, Vijayawada', mapEmbed: '' },
        price: '₹75 Lakhs Onwards',
        area: '1500 - 2200 sq.ft',
        units: '3 BHK',
        highlights: ['Organic Farm', 'Meditation Center', 'Senior Citizen Park', 'Rainwater Harvesting'],
        coordinates: { lat: 16.4600, lng: 80.6860 },
    },
    {
        name: 'PVR The Oasis',
        description: 'Resort-style living in the city. Featuring the largest swimming pool in the district, exotic landscaping, and premium fittings.',
        status: 'ongoing',
        images: [images[1], images[4], images[8]],
        amenities: [{ name: 'Huge Pool', icon: 'FiDroplet' }, { name: 'BBQ Area', icon: 'FiThermometer' }, { name: 'Kids Play Area', icon: 'FiUsers' }],
        location: { address: 'Gannavaram, Vijayawada', mapEmbed: '' },
        price: '₹1.1 Cr Onwards',
        area: '1800 - 2800 sq.ft',
        units: '3 BHK, 4 BHK',
        highlights: ['Near Airport', 'Resort Theme', 'Mini Theater', 'Skating Rink'],
        coordinates: { lat: 16.5360, lng: 80.7960 },
    },
    {
        name: 'PVR Regal Towers',
        description: 'A symbol of prestige. Twin towers offering duplex apartments with exclusive elevators opening directly into your foyer.',
        status: 'completed',
        images: [images[2], images[5], images[7]],
        amenities: [{ name: 'Private Lift', icon: 'FiArrowUp' }, { name: 'Sky Lounge', icon: 'FiCloud' }, { name: 'Valet Parking', icon: 'FiTruck' }],
        location: { address: 'Labbipet, Vijayawada', mapEmbed: '' },
        price: '₹4.5 Cr Onwards',
        area: '4500 - 8000 sq.ft',
        units: 'Duplex 4 BHK, 5 BHK',
        highlights: ['Private Terrace', 'Personal Jacuzzi', 'Chef\'s Kitchen', 'Soundproof Windows'],
        coordinates: { lat: 16.5050, lng: 80.6350 },
    },
    {
        name: 'PVR Eco Woods',
        description: 'A sustainable housing project built with green building principles. Zero carbon footprint, natural cooling, and maximum sunlight.',
        status: 'completed',
        images: [images[6], images[9], images[1]],
        amenities: [{ name: 'Solar Grid', icon: 'FiSun' }, { name: 'Windmill', icon: 'FiWind' }, { name: 'Recycling', icon: 'FiRefreshCw' }],
        location: { address: 'Kankipadu, Vijayawada', mapEmbed: '' },
        price: '₹60 Lakhs Onwards',
        area: '1000 - 1600 sq.ft',
        units: '2 BHK, 3 BHK',
        highlights: ['LEED Gold Certified', 'Low Maintenance', 'Amphitheater', 'Community Garden'],
        coordinates: { lat: 16.4420, lng: 80.7490 },
    },
    {
        name: 'PVR Sapphire Mall & Residences',
        description: 'A mixed-use development consisting of a high-end shopping mall on the lower floors and luxury residences above.',
        status: 'ongoing',
        images: [images[8], images[2], images[4]],
        amenities: [{ name: 'Mall Access', icon: 'FiShoppingBag' }, { name: 'Food Court', icon: 'FiCoffee' }, { name: 'Multiplex', icon: 'FiVideo' }],
        location: { address: 'Guntur Road, Vijayawada', mapEmbed: '' },
        price: '₹1.8 Cr Onwards',
        area: '2000 - 3500 sq.ft',
        units: '3 BHK, 4 BHK',
        highlights: ['Integrated Lifestyle', 'High Street Retail', 'Exclusive Resident Club', 'Central A/C'],
        coordinates: { lat: 16.4670, lng: 80.5920 },
    },
    {
        name: 'PVR Riverfront',
        description: 'Exclusive villas facing the Krishna River. Breathtaking views, private boat jetty, and ultimate privacy for elite buyers.',
        status: 'completed',
        images: [images[4], images[7], images[3]],
        amenities: [{ name: 'River View', icon: 'FiEye' }, { name: 'Boat Jetty', icon: 'FiAnchor' }, { name: 'Golf Putting', icon: 'FiTarget' }],
        location: { address: 'Yanamalakuduru, Vijayawada', mapEmbed: '' },
        price: '₹5.5 Cr Onwards',
        area: '6000 - 10000 sq.ft',
        units: '6 BHK Mansion',
        highlights: ['Riverfront Property', 'Helipad', 'Servant Quarters', 'Home Theater'],
        coordinates: { lat: 16.4800, lng: 80.6400 },
    }
];

const seedProjects = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        await Project.deleteMany({}); // Delete existing projects
        console.log('🧹 Cleared existing projects');

        await Project.insertMany(projects);
        console.log('🎉 Successfully added 10 default projects!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding projects:', error);
        process.exit(1);
    }
};

seedProjects();
