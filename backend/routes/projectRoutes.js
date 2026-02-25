const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all projects (public)
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const projects = await Project.find(filter).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single project (public)
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create project (admin only)
router.post('/', auth, adminAuth, upload.array('images', 10), async (req, res) => {
    try {
        const { name, description, status, amenities, location, price, area, units, highlights, mapEmbed } = req.body;
        const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        const project = await Project.create({
            name, description, status,
            images,
            amenities: amenities ? JSON.parse(amenities) : [],
            location: { address: location, mapEmbed },
            price, area, units,
            highlights: highlights ? JSON.parse(highlights) : [],
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update project (admin only)
router.put('/:id', auth, adminAuth, upload.array('images', 10), async (req, res) => {
    try {
        const { name, description, status, amenities, location, price, area, units, highlights, mapEmbed } = req.body;
        const updateData = { name, description, status, price, area, units };

        if (amenities) updateData.amenities = JSON.parse(amenities);
        if (highlights) updateData.highlights = JSON.parse(highlights);
        if (location || mapEmbed) updateData.location = { address: location, mapEmbed };
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => `/uploads/${f.filename}`);
            const project = await Project.findById(req.params.id);
            updateData.images = [...(project?.images || []), ...newImages];
        }

        const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete project (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
