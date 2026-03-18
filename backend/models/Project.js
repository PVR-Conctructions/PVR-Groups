const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true }, // Added field for Cloudinary integration
    imageUrls: [{ type: String }],       // Added field to store array of Cloudinary URLs
    description: { type: String, required: true },
    status: { type: String, enum: ['ongoing', 'completed'], required: true },
    completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
    images: [{ type: String }], // Flat array for backward compatibility (thumbnails, cards)
    categorizedImages: [
        {
            category: { type: String, required: true }, // e.g., 'Interior', 'Exterior', 'Amenities'
            label: { type: String, required: true },    // e.g., 'Kitchen', 'Living Room', 'Elevation'
            urls: [{ type: String }]                    // Array of image URLs for this specific label
        }
    ],
    amenities: [{ type: String }],
    bestFeatures: [{ type: String }],
    location: {
        address: { type: String },
        mapEmbed: { type: String }
    },
    floorPlans: [{ type: String }],
    brochureUrl: { type: String },
    price: { type: String },
    area: { type: String },
    units: { type: String },
    highlights: [{ type: String }],
    virtualTourUrl: { type: String },
    viewCount: { type: Number, default: 0 },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    // Extra project details for customers
    projectType: { type: String },          // e.g., "Residential Apartments", "Villas", "Commercial"
    totalFloors: { type: String },          // e.g., "G+14", "G+5"
    configurations: [{
        type: { type: String },
        price: { type: String },
        area: { type: String },
        bedrooms: { type: Number },
        bathrooms: { type: Number },
        balconies: { type: Number },
        parking: { type: Number },
        description: { type: String }
    }],
    videoId: { type: String },              // YouTube Video ID
    possessionDate: { type: String },       // e.g., "December 2027"
    reraNumber: { type: String },           // RERA registration number
    totalLandArea: { type: String },        // e.g., "5 Acres"
    constructionType: { type: String },     // e.g., "RCC Framed Structure"
    bankApprovals: [{ type: String }],      // e.g., ["SBI", "HDFC", "ICICI"]
    specifications: {
        flooring: { type: String },         // e.g., "Vitrified tiles in living areas"
        doors: { type: String },            // e.g., "Teak wood main door"
        windows: { type: String },          // e.g., "UPVC windows with safety grills"
        kitchen: { type: String },          // e.g., "Granite countertop, stainless steel sink"
        bathroom: { type: String },         // e.g., "Anti-skid tiles, premium CP fittings"
        electrical: { type: String },       // e.g., "Concealed copper wiring"
        painting: { type: String },         // e.g., "Asian Paints / Berger premium emulsion"
    },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
