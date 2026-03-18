const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Upload project to Cloudinary and save to DB
exports.uploadProject = async (req, res) => {
    try {
        const { 
            name, title, description, location, status, 
            completionPercentage, amenities, bestFeatures,
            price, area, units, projectType, totalFloors,
            configurations, videoId, possessionDate, reraNumber,
            totalLandArea, constructionType, bankApprovals,
            specFlooring, specDoors, specWindows, specKitchen,
            specBathroom, specElectrical, specPainting
        } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const uploadedImages = [];

        // Upload each file to Cloudinary
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'construction_projects'
            });
            uploadedImages.push(result.secure_url);
            
            // Remove from local temporary storage
            try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) {}
        }

        // Sanitize configurations
        let parsedConfigs = [];
        if (configurations) {
            try {
                parsedConfigs = JSON.parse(configurations).map(cfg => ({
                    ...cfg,
                    bedrooms: cfg.bedrooms === "" ? undefined : Number(cfg.bedrooms),
                    bathrooms: cfg.bathrooms === "" ? undefined : Number(cfg.bathrooms),
                    balconies: cfg.balconies === "" ? undefined : Number(cfg.balconies),
                    parking: cfg.parking === "" ? undefined : Number(cfg.parking)
                }));
            } catch (e) {}
        }

        const project = new Project({
            name: name || title || 'Untitled Project',
            title: title || name,
            description,
            location: typeof location === 'string' ? { address: location } : location,
            imageUrls: uploadedImages,
            images: uploadedImages,
            status: status || 'ongoing',
            completionPercentage: completionPercentage ? Number(completionPercentage) : 0,
            amenities: amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [],
            bestFeatures: bestFeatures ? (typeof bestFeatures === 'string' ? JSON.parse(bestFeatures) : bestFeatures) : [],
            price, area, units,
            projectType, totalFloors,
            configurations: parsedConfigs,
            videoId: Array.isArray(videoId) ? videoId[0] : videoId,
            possessionDate, reraNumber,
            totalLandArea, constructionType,
            bankApprovals: bankApprovals ? (typeof bankApprovals === 'string' ? JSON.parse(bankApprovals) : bankApprovals) : [],
            specifications: {
                flooring: specFlooring || '',
                doors: specDoors || '',
                windows: specWindows || '',
                kitchen: specKitchen || '',
                bathroom: specBathroom || '',
                electrical: specElectrical || '',
                painting: specPainting || '',
            }
        });

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: error.message || 'Server error during project creation' });
    }
};

// Fetch all projects (including existing logic)
exports.getProjects = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const projects = await Project.find(filter).sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch a single project by ID (including view count logic)
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete project and Cloudinary images based on dynamic route or ID
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Extract cloudinary public_ids from imageUrls
        const deletePromises = [];
        if (project.imageUrls && project.imageUrls.length > 0) {
             project.imageUrls.forEach(url => {
                // Extracts the id from typical secure cloudinary URL structure
                const urlParts = url.split('/');
                const filenameAndExt = urlParts[urlParts.length - 1];
                const filename = filenameAndExt.split('.')[0];
                const publicId = `construction_projects/${filename}`;
                
                deletePromises.push(cloudinary.uploader.destroy(publicId));
            });
            await Promise.all(deletePromises);
        }

        await Project.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Project and associated images deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
