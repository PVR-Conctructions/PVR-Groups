const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const projectController = require('../controllers/projectController');
const router = express.Router();

// Get all projects (public)
router.get('/', projectController.getProjects);

// Get single project (public)
router.get('/:id', projectController.getProjectById);

// Upload multiple projects (User facing or general)
router.post('/upload', upload.array('images', 10), projectController.uploadProject);
// Create project (admin only)
router.post('/', auth, adminAuth, upload.array('images', 50), async (req, res) => {
    try {
        const cloudinary = require('../config/cloudinary');
        const fs = require('fs');
        const {
            name, description, status, location, price, area, units, highlights, mapEmbed,
            amenities, bestFeatures, completionPercentage, imageGroupsData,
            projectType, totalFloors, configurations, videoId, possessionDate,
            reraNumber, totalLandArea, constructionType, bankApprovals,
            specFlooring, specDoors, specWindows, specKitchen, specBathroom, specElectrical, specPainting
        } = req.body;

        if (!name || !description || !status) {
            return res.status(400).json({ message: 'Name, description and status are required' });
        }

        // Upload files to Cloudinary concurrently and collect secure_urls
        let uploadedUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => {
                return cloudinary.uploader.upload(file.path, {
                    folder: 'construction_projects'
                }).then(result => {
                    try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) { console.error('Unlink error:', e); }
                    return result.secure_url;
                }).catch(err => {
                    try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) {}
                    throw err;
                });
            });
            uploadedUrls = await Promise.all(uploadPromises);
        }

        let categorizedImages = [];
        let allImages = [];

        if (imageGroupsData) {
            try {
                const groups = JSON.parse(imageGroupsData);
                let fileIndex = 0;
                categorizedImages = groups.map(g => {
                    const newFilesCount = Number(g.newFilesCount) || 0;
                    const newUrls = uploadedUrls.slice(fileIndex, fileIndex + newFilesCount);
                    fileIndex += newFilesCount;
                    const urls = [...(g.existingUrls || []), ...newUrls];
                    allImages = [...allImages, ...urls];
                    return { category: g.category, label: g.label, urls };
                });
            } catch (e) { 
                console.error('Error parsing imageGroupsData', e);
                // Continue even if group parsing fails, but use all uploaded images
                allImages = uploadedUrls;
            }
        } else {
            allImages = uploadedUrls;
        }

        // Sanitize configurations for numeric fields
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
            } catch (e) { console.error('Error parsing configurations', e); }
        }

        const project = await Project.create({
            name, description, status,
            images: allImages,
            imageUrls: allImages,
            categorizedImages,
            completionPercentage: completionPercentage !== undefined ? Number(completionPercentage) : 0,
            amenities: amenities ? JSON.parse(amenities) : [],
            bestFeatures: bestFeatures ? JSON.parse(bestFeatures) : [],
            location: { address: location, mapEmbed },
            price, area, units,
            highlights: highlights ? JSON.parse(highlights) : [],
            projectType: projectType || '',
            totalFloors: totalFloors || '',
            configurations: parsedConfigs,
            videoId: videoId || '',
            possessionDate: possessionDate || '',
            reraNumber: reraNumber || '',
            totalLandArea: totalLandArea || '',
            constructionType: constructionType || '',
            bankApprovals: bankApprovals ? JSON.parse(bankApprovals) : [],
            specifications: {
                flooring: specFlooring || '',
                doors: specDoors || '',
                windows: specWindows || '',
                kitchen: specKitchen || '',
                bathroom: specBathroom || '',
                electrical: specElectrical || '',
                painting: specPainting || '',
            },
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ message: error.message || 'Server error during project creation' });
    }
});

// Update project (admin only)
router.put('/:id', auth, adminAuth, upload.array('images', 50), async (req, res) => {
    try {
        const {
            name, description, status, location, price, area, units, highlights, mapEmbed,
            amenities, bestFeatures, completionPercentage, imageGroupsData,
            projectType, totalFloors, configurations, videoId, possessionDate,
            reraNumber, totalLandArea, constructionType, bankApprovals,
            specFlooring, specDoors, specWindows, specKitchen, specBathroom, specElectrical, specPainting
        } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (status) updateData.status = status;
        if (price !== undefined) updateData.price = price;
        if (area !== undefined) updateData.area = area;
        if (units !== undefined) updateData.units = units;

        if (completionPercentage !== undefined) updateData.completionPercentage = Number(completionPercentage);
        if (amenities) updateData.amenities = JSON.parse(amenities);
        if (bestFeatures) updateData.bestFeatures = JSON.parse(bestFeatures);
        if (highlights) updateData.highlights = JSON.parse(highlights);
        if (location !== undefined || mapEmbed !== undefined) {
            updateData.location = { 
                address: location !== undefined ? location : (await Project.findById(req.params.id))?.location?.address, 
                mapEmbed: mapEmbed !== undefined ? mapEmbed : (await Project.findById(req.params.id))?.location?.mapEmbed 
            };
        }
        
        if (configurations) {
            try {
                updateData.configurations = JSON.parse(configurations).map(cfg => ({
                    ...cfg,
                    bedrooms: cfg.bedrooms === "" ? undefined : Number(cfg.bedrooms),
                    bathrooms: cfg.bathrooms === "" ? undefined : Number(cfg.bathrooms),
                    balconies: cfg.balconies === "" ? undefined : Number(cfg.balconies),
                    parking: cfg.parking === "" ? undefined : Number(cfg.parking)
                }));
            } catch (e) { console.error('Error parsing configurations', e); }
        }

        if (videoId !== undefined) updateData.videoId = videoId;
        if (bankApprovals) updateData.bankApprovals = JSON.parse(bankApprovals);

        // Extra project details
        if (projectType !== undefined) updateData.projectType = projectType;
        if (totalFloors !== undefined) updateData.totalFloors = totalFloors;
        if (possessionDate !== undefined) updateData.possessionDate = possessionDate;
        if (reraNumber !== undefined) updateData.reraNumber = reraNumber;
        if (totalLandArea !== undefined) updateData.totalLandArea = totalLandArea;
        if (constructionType !== undefined) updateData.constructionType = constructionType;

        // Specifications
        if (specFlooring || specDoors || specWindows || specKitchen || specBathroom || specElectrical || specPainting) {
            const existing = await Project.findById(req.params.id);
            updateData.specifications = {
                flooring: specFlooring !== undefined ? specFlooring : existing?.specifications?.flooring || '',
                doors: specDoors !== undefined ? specDoors : existing?.specifications?.doors || '',
                windows: specWindows !== undefined ? specWindows : existing?.specifications?.windows || '',
                kitchen: specKitchen !== undefined ? specKitchen : existing?.specifications?.kitchen || '',
                bathroom: specBathroom !== undefined ? specBathroom : existing?.specifications?.bathroom || '',
                electrical: specElectrical !== undefined ? specElectrical : existing?.specifications?.electrical || '',
                painting: specPainting !== undefined ? specPainting : existing?.specifications?.painting || '',
            };
        }

        // Upload new files to Cloudinary concurrently and collect secure_urls
        const cloudinary = require('../config/cloudinary');
        const fs = require('fs');
        let uploadedUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => {
                return cloudinary.uploader.upload(file.path, {
                    folder: 'construction_projects'
                }).then(result => {
                    try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) {}
                    return result.secure_url;
                }).catch(err => {
                    try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) {}
                    throw err;
                });
            });
            uploadedUrls = await Promise.all(uploadPromises);
        }

        if (imageGroupsData) {
            try {
                const groups = JSON.parse(imageGroupsData);
                let fileIndex = 0;
                let allImages = [];
                updateData.categorizedImages = groups.map(g => {
                    const newFilesCount = Number(g.newFilesCount) || 0;
                    const newUrls = uploadedUrls.slice(fileIndex, fileIndex + newFilesCount);
                    fileIndex += newFilesCount;
                    const urls = [...(g.existingUrls || []), ...newUrls];
                    allImages = [...allImages, ...urls];
                    return { category: g.category, label: g.label, urls };
                });
                updateData.images = allImages;
                updateData.imageUrls = allImages;
            } catch (e) { console.error('Error parsing imageGroupsData', e); }
        } else if (uploadedUrls.length > 0) {
            const project = await Project.findById(req.params.id);
            const merged = [...(project?.images || []), ...uploadedUrls];
            updateData.images = merged;
            updateData.imageUrls = merged;
        }

        const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.json(project);
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ message: error.message || 'Server error during project update' });
    }
});

// Delete project (admin only or explicit endpoint matching criteria)
// Mapping to new controller delete logic ensuring old admin stuff matches if needed:
router.delete('/:id', projectController.deleteProject);

module.exports = router;
