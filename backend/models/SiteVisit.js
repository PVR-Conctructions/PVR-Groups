const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    preferredDate: { type: Date, required: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('SiteVisit', siteVisitSchema);
