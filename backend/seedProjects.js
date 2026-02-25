const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pvr-groups';

const demoProjects = [
    {
        name: 'Raintree Park Residency',
        description: 'Raintree Park Residency is our flagship luxury residential project, offering premium 2, 3 & 4 BHK apartments in the heart of Vijayawada. Nestled amidst lush green landscapes, this gated community features world-class amenities including a rooftop infinity pool, a state-of-the-art fitness center, children\'s play areas, and a grand clubhouse. Every apartment is designed with Italian marble flooring, modular kitchens, and floor-to-ceiling windows that offer panoramic views of the Krishna River. With 24/7 security surveillance, dedicated parking, and smart home automation in every unit, Raintree Park sets a new standard for luxury urban living.',
        status: 'ongoing',
        images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800'
        ],
        amenities: [
            { name: 'Swimming Pool', icon: 'FiDroplet' },
            { name: 'Gym', icon: 'FiActivity' },
            { name: 'Children Play Area', icon: 'FiSmile' },
            { name: 'Clubhouse', icon: 'FiHome' },
            { name: 'Landscaped Gardens', icon: 'FiSun' },
            { name: 'Jogging Track', icon: 'FiActivity' },
            { name: '24/7 Security', icon: 'FiShield' },
            { name: 'Power Backup', icon: 'FiZap' },
            { name: 'Car Parking', icon: 'FiTruck' },
            { name: 'Elevator', icon: 'FiArrowUp' },
            { name: 'Community Hall', icon: 'FiUsers' },
            { name: 'Smart Home', icon: 'FiWifi' },
        ],
        location: {
            address: 'Tadepalli, Vijayawada, Andhra Pradesh',
            mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30604.1!2d80.6!3d16.49!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35eff9482d944b%3A0x939b7e84ab4a0265!2sVijayawada!5e0!3m2!1sen!2sin" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
        },
        price: '₹65 Lakhs Onwards',
        area: '1,250 - 2,800 sq.ft',
        units: '320 Premium Apartments',
        highlights: ['RERA Approved', 'Vastu Compliant', 'Zero Water Waste', 'EV Charging Stations', 'Earthquake Resistant'],
        floorPlans: ['2 BHK - 1,250 sq.ft', '3 BHK - 1,850 sq.ft', '4 BHK - 2,800 sq.ft'],
    },
    {
        name: 'PVR Grand Heights',
        description: 'PVR Grand Heights is a premium high-rise residential tower offering breathtaking views and modern living. Located on the bustling MG Road in Vijayawada, this 25-story landmark features spacious 3 & 4 BHK apartments with world-class finishes. Each apartment boasts imported marble countertops, designer bathrooms with rain showers, private balconies with city views, and a fully automated smart home system. The project includes a sky lounge on the 24th floor, an Olympic-size swimming pool, a multi-purpose sports court, a dedicated co-working space, and a wellness spa.',
        status: 'ongoing',
        images: [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
            'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
            'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'
        ],
        amenities: [
            { name: 'Sky Lounge', icon: 'FiStar' },
            { name: 'Infinity Pool', icon: 'FiDroplet' },
            { name: 'Co-Working Space', icon: 'FiMonitor' },
            { name: 'Wellness Spa', icon: 'FiHeart' },
            { name: 'Sports Court', icon: 'FiActivity' },
            { name: 'Home Theater', icon: 'FiFilm' },
            { name: 'Library', icon: 'FiBook' },
            { name: 'BBQ Deck', icon: 'FiSun' },
            { name: 'Yoga Studio', icon: 'FiHeart' },
            { name: 'Guest Suites', icon: 'FiHome' },
            { name: 'Concierge', icon: 'FiUser' },
            { name: 'Power Backup', icon: 'FiZap' },
        ],
        location: {
            address: 'MG Road, Vijayawada, Andhra Pradesh',
            mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30604.1!2d80.62!3d16.51!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35eff9482d944b%3A0x939b7e84ab4a0265!2sVijayawada!5e0!3m2!1sen!2sin" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
        },
        price: '₹1.2 Crores Onwards',
        area: '1,800 - 3,500 sq.ft',
        units: '180 Ultra-Luxury Apartments',
        highlights: ['25-Story Landmark Tower', 'Sky Lounge', 'Italian Marble', 'Private Elevators for Penthouses', 'Smart Home 2.0'],
        floorPlans: ['3 BHK - 1,800 sq.ft', '4 BHK - 2,600 sq.ft', 'Penthouse - 3,500 sq.ft'],
    },
    {
        name: 'PVR Emerald Villas',
        description: 'PVR Emerald Villas is a completed premium villa community spread across 15 acres of beautifully landscaped grounds in Gannavaram. These 120 independent luxury villas feature contemporary architecture with traditional Vastu principles. Each villa offers 4 bedrooms with en-suite bathrooms, a private garden, covered car parking for 2 vehicles, a home office space, and a dedicated servant quarter. The community amenities include an exclusive clubhouse with a temperature-controlled pool, tennis courts, a mini-golf course, jogging trails, and a multi-cuisine restaurant.',
        status: 'completed',
        images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
            'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
        ],
        amenities: [
            { name: 'Private Gardens', icon: 'FiSun' },
            { name: 'Clubhouse', icon: 'FiHome' },
            { name: 'Swimming Pool', icon: 'FiDroplet' },
            { name: 'Tennis Court', icon: 'FiActivity' },
            { name: 'Mini Golf', icon: 'FiTarget' },
            { name: 'Jogging Trail', icon: 'FiActivity' },
            { name: 'Restaurant', icon: 'FiCoffee' },
            { name: 'Children Park', icon: 'FiSmile' },
            { name: 'Covered Parking', icon: 'FiTruck' },
            { name: 'Power Backup', icon: 'FiZap' },
            { name: 'Water Treatment', icon: 'FiDroplet' },
            { name: '24/7 Security', icon: 'FiShield' },
        ],
        location: {
            address: 'Gannavaram, Vijayawada, Andhra Pradesh',
            mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30604.1!2d80.8!3d16.54!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35eff9482d944b%3A0x939b7e84ab4a0265!2sVijayawada!5e0!3m2!1sen!2sin" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
        },
        price: '₹1.8 Crores Onwards',
        area: '2,400 - 4,200 sq.ft',
        units: '120 Independent Villas (Sold Out)',
        highlights: ['15 Acres Community', 'Near Airport', 'All Villas Sold', 'Vastu Compliant', 'Private Garden per Villa'],
        floorPlans: ['3 BHK Villa - 2,400 sq.ft', '4 BHK Villa - 3,200 sq.ft', '5 BHK Villa - 4,200 sq.ft'],
    },
    {
        name: 'PVR Business Tower',
        description: 'PVR Business Tower is a landmark commercial project completed in the prime business district of Vijayawada. This 18-story Grade A commercial tower offers fully equipped office spaces ranging from compact 500 sq.ft offices to sprawling 5,000 sq.ft corporate floors. The building features a stunning glass facade, high-speed elevators, centralized air conditioning, a grand reception lobby with concierge services, and underground parking for over 200 vehicles. Tenants enjoy access to a rooftop cafeteria with city views, conference rooms with video conferencing, and a business center.',
        status: 'completed',
        images: [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
            'https://images.unsplash.com/photo-1554435517-10513ab87dd0?w=800',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
            'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800',
            'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800'
        ],
        amenities: [
            { name: 'High-Speed Elevators', icon: 'FiArrowUp' },
            { name: 'Central AC', icon: 'FiWind' },
            { name: 'Grand Lobby', icon: 'FiHome' },
            { name: 'Conference Rooms', icon: 'FiUsers' },
            { name: 'Rooftop Cafeteria', icon: 'FiCoffee' },
            { name: 'Underground Parking', icon: 'FiTruck' },
            { name: 'Concierge', icon: 'FiUser' },
            { name: 'Business Center', icon: 'FiMonitor' },
            { name: 'Fire Safety', icon: 'FiShield' },
            { name: 'CCTV', icon: 'FiEye' },
            { name: 'Power Backup', icon: 'FiZap' },
            { name: 'Fiber Internet', icon: 'FiWifi' },
        ],
        location: {
            address: 'Auto Nagar, Vijayawada, Andhra Pradesh',
            mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30604.1!2d80.65!3d16.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35eff9482d944b%3A0x939b7e84ab4a0265!2sVijayawada!5e0!3m2!1sen!2sin" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
        },
        price: '₹45 Lakhs Onwards',
        area: '500 - 5,000 sq.ft',
        units: '85 Office Spaces (90% Occupied)',
        highlights: ['Grade A Commercial', '18 Stories', 'Glass Facade', 'MNC Tenants', '200+ Car Parking'],
        floorPlans: ['Small Office - 500 sq.ft', 'Medium Office - 1,500 sq.ft', 'Corporate Floor - 5,000 sq.ft'],
    },
];

async function seedProjects() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await Project.deleteMany({});
        console.log('🗑️  Cleared existing projects');

        const created = await Project.insertMany(demoProjects);
        console.log(`✅ Seeded ${created.length} demo projects:`);
        created.forEach(p => console.log(`   - ${p.name} (${p.status})`));

        await mongoose.disconnect();
        console.log('✅ Done! Refresh your browser to see the projects.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding projects:', err.message);
        process.exit(1);
    }
}

seedProjects();
