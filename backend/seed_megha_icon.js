require('dotenv').config();
const supabase = require('./config/supabase');

const seedMeghaIcon = async () => {
    try {
        const insertData = {
            name: 'PVR Megha Icon',
            title: 'PVR Megha Icon Premium Residences',
            description: 'PVR Megha Icon is a landmark residential project in Tadepalli, Vijayawada. Spanning 8 acres, it features 12 magnificent towers with 10 floors each, offering an exclusive community of approximately 920 units. Choose from impeccably designed 2, 3, and 4 BHK apartments ranging from 1200 to 3800 sq.ft. It boasts unparalleled amenities including a luxurious clubhouse, swimming pool, fully-equipped gym, and an exclusive mini theatre for residents. Strategically located near the Krishna Canal Junction with AP CRDA and RERA approvals.',
            status: 'ongoing',
            completion_percentage: 10,
            image_urls: [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=3840&q=100', // 4K resolution
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840&q=100',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=3840&q=100',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=3840&q=100'
            ],
            images: [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=3840&q=100',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840&q=100',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=3840&q=100',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=3840&q=100'
            ],
            categorized_images: [
                { category: 'Exterior', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=3840&q=100' },
                { category: 'Amenities', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840&q=100' },
                { category: 'Interior', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=3840&q=100' },
                { category: 'Master Plan', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=3840&q=100' }
            ],
            amenities: ['Swimming Pool', 'Gymnasium', 'Clubhouse', 'Mini Theatre', 'Landscaped Gardens', '24/7 Security'],
            best_features: ['8 Acres Luxury Living', 'AP CRDA & RERA Approved', 'Prime Tadepalli Location', 'Exclusive Mini Theatre'],
            location: {
                address: 'Tadepalli, Vijayawada, Andhra Pradesh',
                city: 'Vijayawada',
                state: 'Andhra Pradesh'
            },
            price: '₹ 85 Lakhs - 2.5 Crores',
            area: '1200 - 3800 sq.ft',
            units: '920 Units',
            project_type: 'Residential Apartments',
            total_floors: '10 Floors (12 Towers)',
            video_id: 'LnC58FFkcaI',
            possession_date: 'December 2028',
            rera_number: 'APRE/TDP/PVR/2024/001',
            total_land_area: '8 Acres',
            construction_type: 'RCC Framed Structure',
            configurations: [
                { title: '2 BHK', size: '1200 sq.ft', price: '₹ 85L*', bedrooms: 2, bathrooms: 2, balconies: 1, parking: 1, description: 'Spacious 2 BHK for modern families.' },
                { title: '3 BHK', size: '2100 sq.ft', price: '₹ 1.4Cr*', bedrooms: 3, bathrooms: 3, balconies: 2, parking: 2, description: 'Premium 3 BHK with premium finishes.' },
                { title: '4 BHK Luxury', size: '3800 sq.ft', price: '₹ 2.5Cr*', bedrooms: 4, bathrooms: 4, balconies: 3, parking: 3, description: 'Ultra-luxury massive 4 BHK.' }
            ],
            bank_approvals: ['SBI', 'HDFC', 'ICICI', 'Axis Bank']
        };

        const { data, error } = await supabase.from('projects').insert([insertData]).select();
        
        if (error) {
            console.error('Failed to insert project:', error);
            process.exit(1);
        } else {
            console.log('Project PVR Megha Icon created successfully!', data[0].id);
            process.exit(0);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seedMeghaIcon();
