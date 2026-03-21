require('dotenv').config();
const supabase = require('./config/supabase');

const seed5Projects = async () => {
    try {
        const defaultImages = [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=3840&q=100',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840&q=100',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=3840&q=100',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=3840&q=100'
        ];

        const defaultCategorized = [
            { category: 'Exterior', urls: [defaultImages[0]] },
            { category: 'Amenities', urls: [defaultImages[1]] },
            { category: 'Interior', urls: [defaultImages[2]] },
            { category: 'Master Plan', urls: [defaultImages[3]] }
        ];

        const projectsToInsert = [
            {
                name: 'PVR Elite',
                title: 'PVR Elite Premium Living',
                description: 'PVR Elite is an under-construction premium residential project located in Kanuru, Vijayawada. It is a RERA-registered housing society offering approx 275 units across 5 towers with 5 floors each. Spread over 3.25 acres, it provides world-class amenities including a swimming pool, clubhouse, and gymnasium.',
                status: 'ongoing',
                completion_percentage: 60,
                image_urls: defaultImages,
                images: defaultImages,
                categorized_images: defaultCategorized,
                amenities: ['Swimming Pool', 'Gymnasium', 'Clubhouse', '24/7 Security'],
                best_features: ['3.25 Acres Project', '5 Premium Towers', 'Prime Kanuru Location'],
                location: { address: 'Kanuru, Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh' },
                price: '₹ 75 Lakhs Onwards',
                area: '1300 - 2400 sq.ft',
                units: '275 Units',
                project_type: 'Residential Apartments',
                total_floors: '5 Floors (5 Towers)',
                possession_date: 'December 2025',
                rera_number: 'P06170014654',
                total_land_area: '3.25 Acres',
                configurations: [
                    { title: '2 BHK', size: '1300 sq.ft', price: '₹ 75L*', bedrooms: 2, bathrooms: 2, balconies: 1, parking: 1, description: 'Spacious 2 BHK in Kanuru.' },
                    { title: '3 BHK', size: '1800 sq.ft', price: '₹ 1.1Cr*', bedrooms: 3, bathrooms: 3, balconies: 2, parking: 2, description: 'Luxurious 3 BHK for large families.' },
                    { title: '4 BHK', size: '2400 sq.ft', price: '₹ 1.5Cr*', bedrooms: 4, bathrooms: 4, balconies: 3, parking: 2, description: 'Premium 4 BHK with exclusive access.' }
                ]
            },
            {
                name: 'PVR Icon',
                title: 'PVR Icon - The Standard of Luxury',
                description: 'Located in Penamaluru (Currency Nagar), PVR Icon is a premium residential project offering 2 and 3 BHK apartments. It is strategically situated near National Highway 65 and 16. It features 190 units across 1.85 acres.',
                status: 'ongoing',
                completion_percentage: 40,
                image_urls: defaultImages,
                images: defaultImages,
                categorized_images: defaultCategorized,
                amenities: ['Gymnasium', 'Landscaped Gardens', 'Children Play Area', 'Security'],
                best_features: ['Currency Nagar Location', 'Near NH 65', '1.85 Acres'],
                location: { address: 'Penamaluru, Currency Nagar, Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh' },
                price: '₹ 50 Lakhs Onwards',
                area: '707 - 1311 sq.ft',
                units: '190 Units',
                project_type: 'Residential Apartments',
                total_floors: '5 Floors',
                possession_date: 'August 2026',
                total_land_area: '1.85 Acres',
                configurations: [
                    { title: '2 BHK', size: '707 sq.ft', price: '₹ 50L*', bedrooms: 2, bathrooms: 2, balconies: 1, parking: 1, description: 'Compact and elegant 2 BHK.' },
                    { title: '3 BHK', size: '1311 sq.ft', price: '₹ 85L*', bedrooms: 3, bathrooms: 3, balconies: 2, parking: 1, description: 'Spacious 3 BHK.' }
                ]
            },
            {
                name: 'PVR Grand',
                title: 'PVR Grand Residencies',
                description: 'Situated in Currency Nagar, Vijayawada, PVR Grand is a residential development spread across 1.16 acres. Fast-paced lifestyle connected to the heart of the city.',
                status: 'ongoing',
                completion_percentage: 80,
                image_urls: defaultImages,
                images: defaultImages,
                categorized_images: defaultCategorized,
                amenities: ['24x7 Water Supply', 'Sewage Treatment Plant', 'CCTV Security'],
                best_features: ['1.16 Acres', 'Central Currency Nagar'],
                location: { address: 'Currency Nagar, Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh' },
                price: '₹ 60 Lakhs Onwards',
                area: '1000 - 1500 sq.ft',
                units: '120 Units',
                project_type: 'Residential Apartments',
                total_land_area: '1.16 Acres',
                configurations: [
                    { title: '2 BHK', size: '1000 sq.ft', price: '₹ 60L*', bedrooms: 2, bathrooms: 2, parking: 1 },
                    { title: '3 BHK', size: '1500 sq.ft', price: '₹ 90L*', bedrooms: 3, bathrooms: 3, parking: 1 }
                ]
            },
            {
                name: 'PVR Pride',
                title: 'PVR Pride - Elevating Living',
                description: 'A new launch project in Patamatalanka, Vijayawada. Expected delivery by November 2026. Very exclusive community of 60 premium units.',
                status: 'ongoing',
                completion_percentage: 15,
                image_urls: defaultImages,
                images: defaultImages,
                categorized_images: defaultCategorized,
                amenities: ['Car Parking', 'CCTV Camera', '24/7 Security', 'Power Backup'],
                best_features: ['Exclusive 60 Units', 'Patamatalanka Location'],
                location: { address: 'Patamatalanka, Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh' },
                price: '₹ 70 Lakhs Onwards',
                area: '1200 - 1600 sq.ft',
                units: '60 Units',
                project_type: 'Residential Apartments',
                possession_date: 'November 2026',
                rera_number: 'P06170015498',
                configurations: [
                    { title: '2 BHK', size: '1200 sq.ft', price: '₹ 70L*', bedrooms: 2, bathrooms: 2, parking: 1 },
                    { title: '3 BHK', size: '1600 sq.ft', price: '₹ 95L*', bedrooms: 3, bathrooms: 3, parking: 1 }
                ]
            },
            {
                name: 'PVR Meadows',
                title: 'PVR Meadows Ready to Move Flats',
                description: 'Ready-to-move development in Sri Ramachandra Nagar offering extremely spacious 2 and 3 BHK flats on 4000 square yards of land limit.',
                status: 'completed',
                completion_percentage: 100,
                image_urls: defaultImages,
                images: defaultImages,
                categorized_images: defaultCategorized,
                amenities: ['Ready to move', 'Parking', 'Security'],
                best_features: ['Ready to Occupy', 'Sri Ramachandra Nagar'],
                location: { address: 'Sri Ramachandra Nagar, Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh' },
                price: '₹ 65 Lakhs Onwards',
                area: '1100 - 1500 sq.ft',
                units: '70 Units',
                project_type: 'Residential Apartments',
                total_land_area: '4000 Sq Yards',
                possession_date: 'Ready to Move',
                configurations: [
                    { title: '2 BHK', size: '1100 sq.ft', price: '₹ 65L*', bedrooms: 2, bathrooms: 2, parking: 1 },
                    { title: '3 BHK', size: '1500 sq.ft', price: '₹ 88L*', bedrooms: 3, bathrooms: 3, parking: 1 }
                ]
            }
        ];

        const { data, error } = await supabase.from('projects').insert(projectsToInsert).select();
        
        if (error) {
            console.error('Failed to insert projects:', error);
            process.exit(1);
        } else {
            console.log('Successfully added 5 PVR group projects!');
            process.exit(0);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed5Projects();
