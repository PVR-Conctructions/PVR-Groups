const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const projectController = require('../controllers/projectController');
const { mapProject } = projectController;
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

        let uploadedUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => {
                return cloudinary.uploader.upload(file.path, {
                    folder: 'construction_projects'
                }).then(result => {
                    try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) { }
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
                allImages = uploadedUrls;
            }
        } else {
            allImages = uploadedUrls;
        }

        let parsedConfigs = [];
        if (configurations) {
            try {
                parsedConfigs = JSON.parse(configurations).map(cfg => ({
                    ...cfg,
                    bedrooms: cfg.bedrooms === "" ? null : Number(cfg.bedrooms),
                    bathrooms: cfg.bathrooms === "" ? null : Number(cfg.bathrooms),
                    balconies: cfg.balconies === "" ? null : Number(cfg.balconies),
                    parking: cfg.parking === "" ? null : Number(cfg.parking)
                }));
            } catch (e) { }
        }

        const insertData = {
            name, description, status,
            images: allImages,
            image_urls: allImages,
            categorized_images: categorizedImages,
            completion_percentage: completionPercentage !== undefined ? Number(completionPercentage) : 0,
            amenities: amenities ? JSON.parse(amenities) : [],
            best_features: bestFeatures ? JSON.parse(bestFeatures) : [],
            location: { address: location, mapEmbed },
            price, area, units,
            highlights: highlights ? JSON.parse(highlights) : [],
            project_type: projectType || '',
            total_floors: totalFloors || '',
            configurations: parsedConfigs,
            video_id: Array.isArray(videoId) ? videoId[0] : (videoId || ''),
            possession_date: possessionDate || '',
            rera_number: reraNumber || '',
            total_land_area: totalLandArea || '',
            construction_type: constructionType || '',
            bank_approvals: bankApprovals ? JSON.parse(bankApprovals) : [],
            specifications: {
                flooring: specFlooring || '',
                doors: specDoors || '',
                windows: specWindows || '',
                kitchen: specKitchen || '',
                bathroom: specBathroom || '',
                electrical: specElectrical || '',
                painting: specPainting || '',
            },
        };

        const { data: project, error } = await supabase.from('projects').insert(insertData).select().single();
        if (error) throw error;

        res.status(201).json(mapProject(project));
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

        if (completionPercentage !== undefined) updateData.completion_percentage = Number(completionPercentage);
        if (amenities) updateData.amenities = JSON.parse(amenities);
        if (bestFeatures) updateData.best_features = JSON.parse(bestFeatures);
        if (highlights) updateData.highlights = JSON.parse(highlights);
        
        const { data: existingProject } = await supabase.from('projects').select('*').eq('id', req.params.id).single();

        if (location !== undefined || mapEmbed !== undefined) {
            updateData.location = { 
                address: location !== undefined ? location : existingProject?.location?.address, 
                mapEmbed: mapEmbed !== undefined ? mapEmbed : existingProject?.location?.mapEmbed 
            };
        }
        
        if (configurations) {
            try {
                updateData.configurations = JSON.parse(configurations).map(cfg => ({
                    ...cfg,
                    bedrooms: cfg.bedrooms === "" ? null : Number(cfg.bedrooms),
                    bathrooms: cfg.bathrooms === "" ? null : Number(cfg.bathrooms),
                    balconies: cfg.balconies === "" ? null : Number(cfg.balconies),
                    parking: cfg.parking === "" ? null : Number(cfg.parking)
                }));
            } catch (e) { }
        }

        if (videoId !== undefined) updateData.video_id = Array.isArray(videoId) ? videoId[0] : videoId;
        if (bankApprovals) updateData.bank_approvals = JSON.parse(bankApprovals);

        if (projectType !== undefined) updateData.project_type = projectType;
        if (totalFloors !== undefined) updateData.total_floors = totalFloors;
        if (possessionDate !== undefined) updateData.possession_date = possessionDate;
        if (reraNumber !== undefined) updateData.rera_number = reraNumber;
        if (totalLandArea !== undefined) updateData.total_land_area = totalLandArea;
        if (constructionType !== undefined) updateData.construction_type = constructionType;

        if (specFlooring || specDoors || specWindows || specKitchen || specBathroom || specElectrical || specPainting) {
            updateData.specifications = {
                flooring: specFlooring !== undefined ? specFlooring : existingProject?.specifications?.flooring || '',
                doors: specDoors !== undefined ? specDoors : existingProject?.specifications?.doors || '',
                windows: specWindows !== undefined ? specWindows : existingProject?.specifications?.windows || '',
                kitchen: specKitchen !== undefined ? specKitchen : existingProject?.specifications?.kitchen || '',
                bathroom: specBathroom !== undefined ? specBathroom : existingProject?.specifications?.bathroom || '',
                electrical: specElectrical !== undefined ? specElectrical : existingProject?.specifications?.electrical || '',
                painting: specPainting !== undefined ? specPainting : existingProject?.specifications?.painting || '',
            };
        }

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
                updateData.categorized_images = groups.map(g => {
                    const newFilesCount = Number(g.newFilesCount) || 0;
                    const newUrls = uploadedUrls.slice(fileIndex, fileIndex + newFilesCount);
                    fileIndex += newFilesCount;
                    const urls = [...(g.existingUrls || []), ...newUrls];
                    allImages = [...allImages, ...urls];
                    return { category: g.category, label: g.label, urls };
                });
                updateData.images = allImages;
                updateData.image_urls = allImages;
            } catch (e) { }
        } else if (uploadedUrls.length > 0) {
            const merged = [...(existingProject?.images || []), ...uploadedUrls];
            updateData.images = merged;
            updateData.image_urls = merged;
        }

        const { data: updatedProject, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (error || !updatedProject) return res.status(404).json({ message: 'Project not found' });

        res.json(mapProject(updatedProject));
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ message: error.message || 'Server error during project update' });
    }
});

router.delete('/:id', projectController.deleteProject);

module.exports = router;
