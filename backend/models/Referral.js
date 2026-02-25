const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referredEmail: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'rewarded'], default: 'pending' },
    rewardPoints: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
