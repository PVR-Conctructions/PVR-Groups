const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Debit Card'], required: true },
    status: { type: String, enum: ['paid', 'pending', 'failed', 'refunded'], default: 'pending' },
    invoiceNumber: { type: String, unique: true },
    description: { type: String },
    transactionId: { type: String },
}, { timestamps: true });

// Auto-generate invoice number
paymentSchema.pre('save', function (next) {
    if (!this.invoiceNumber) {
        this.invoiceNumber = 'PVR-INV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
