const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Get user's payment history
router.get('/', auth, async (req, res) => {
    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select('*, projects(name)')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const formatted = payments.map(p => ({
            ...p,
            _id: p.id,
            projectId: p.projects ? { _id: p.project_id, name: p.projects.name } : p.project_id,
            userId: p.user_id,
            invoiceNumber: p.invoice_number,
            transactionId: p.transaction_id,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single payment (for invoice)
router.get('/:id', auth, async (req, res) => {
    try {
        const { data: p, error } = await supabase
            .from('payments')
            .select('*, projects(name, location), users(name, email, phone)')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();
            
        if (error || !p) return res.status(404).json({ message: 'Payment not found' });
        
        const formatted = {
            ...p,
            _id: p.id,
            projectId: p.projects ? { _id: p.project_id, name: p.projects.name, location: p.projects.location } : p.project_id,
            userId: p.users ? { _id: p.user_id, name: p.users.name, email: p.users.email, phone: p.users.phone } : p.user_id,
            invoiceNumber: p.invoice_number,
            transactionId: p.transaction_id,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        };
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Get all payments
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select('*, users(name, email), projects(name)')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const formatted = payments.map(p => ({
            ...p,
            _id: p.id,
            userId: p.users ? { _id: p.user_id, name: p.users.name, email: p.users.email } : p.user_id,
            projectId: p.projects ? { _id: p.project_id, name: p.projects.name } : p.project_id,
            invoiceNumber: p.invoice_number,
            transactionId: p.transaction_id,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Create payment record
router.post('/', auth, adminAuth, async (req, res) => {
    try {
        const invoice_number = 'PVR-INV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        
        const insertData = {
            user_id: req.body.userId,
            project_id: req.body.projectId,
            amount: req.body.amount,
            method: req.body.method,
            status: req.body.status || 'pending',
            invoice_number: req.body.invoiceNumber || invoice_number,
            description: req.body.description,
            transaction_id: req.body.transactionId
        };
        
        const { data: p, error } = await supabase.from('payments').insert(insertData).select().single();
        if (error) throw error;
        
        res.status(201).json({ ...p, _id: p.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Update payment status
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const updateData = {};
        if (req.body.status) updateData.status = req.body.status;
        if (req.body.amount !== undefined) updateData.amount = req.body.amount;
        if (req.body.method) updateData.method = req.body.method;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.transactionId !== undefined) updateData.transaction_id = req.body.transactionId;
        
        const { data: payment, error } = await supabase
            .from('payments')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (error || !payment) return res.status(404).json({ message: 'Payment not found' });
        res.json({ ...payment, _id: payment.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
