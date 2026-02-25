const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['ongoing', 'completed'], required: true },
    images: [{ type: String }],
    amenities: [{
        name: { type: String },
        icon: { type: String }
    }],
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
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
