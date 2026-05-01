const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const projectController = require('../controllers/projectController');
const { mapProject } = projectController;
const { processAndUploadImage, deleteFromBunnyStorage } = require('../utils/imageWorkers');
const { cacheMiddleware, invalidateCacheMiddleware, CACHE_KEYS } = require('../middleware/cache');
const { body, validationResult } = require('express-validator');
const os = require('os');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// ─── Helper: write buffer → compress with Sharp → upload to Bunny ─────────────
async function processSingleFile(file, folderName) {
    const ext = path.extname(file.originalname) || '.jpg';
    const baseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '') || 'img';
    const filename = `${baseName}_${Date.now()}`;
    const finalBunnyPath = `projects/${folderName}/${filename}.webp`;
    const tmpPath = path.join(os.tmpdir(), `pvr_${filename}${ext}`);
    fs.writeFileSync(tmpPath, file.buffer);
    try {
        return await processAndUploadImage(tmpPath, finalBunnyPath);
    } finally {
        try { fs.unlinkSync(tmpPath); } catch (_) {}
    }
}

// ─── Input validation rules ───────────────────────────────────────────────────
const projectCreateValidation = [
    body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 200 }),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('status').isIn(['ongoing', 'completed', 'upcoming']).withMessage('Invalid status'),
    body('price').optional().isString(),
    body('area').optional().isString(),
];

// ─── GET all projects (public) — CACHED 60 s ─────────────────────────────────
router.get('/',
    cacheMiddleware(CACHE_KEYS.PROJECTS_ALL, 60),
    projectController.getProjects
);

// ─── GET single project (public) — CACHED 120 s ──────────────────────────────
router.get('/:id',
    cacheMiddleware((req) => CACHE_KEYS.PROJECT_SINGLE(req.params.id), 120),
    projectController.getProjectById
);

// ─── POST /upload  (general / non-admin) ─────────────────────────────────────
router.post('/upload',
    upload.array('images', 10),
    invalidateCacheMiddleware(CACHE_KEYS.PROJECTS_ALL),
    projectController.uploadProject
);

// ─── POST / Create project (admin only) ──────────────────────────────────────
router.post('/',
    auth, adminAuth,
    upload.array('images', 50),
    projectCreateValidation,
    invalidateCacheMiddleware(CACHE_KEYS.PROJECTS_ALL),
    async (req, res) => {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const {
                name, description, status, location, price, area, units, highlights, mapEmbed,
                amenities, bestFeatures, completionPercentage, imageGroupsData,
                projectType, totalFloors, configurations, videoId, possessionDate,
                reraNumber, totalLandArea, constructionType, bankApprovals,
                specFlooring, specDoors, specWindows, specKitchen,
                specBathroom, specElectrical, specPainting,
            } = req.body;

            const folderName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            let uploadedUrls = [];

            if (req.files?.length > 0) {
                uploadedUrls = await Promise.all(
                    req.files.map((file) => processSingleFile(file, folderName))
                );
            }

            // Build categorized image groups
            let categorizedImages = [];
            let allImages = [];
            if (imageGroupsData) {
                try {
                    const groups = JSON.parse(imageGroupsData);
                    let fileIndex = 0;
                    categorizedImages = groups.map((g) => {
                        const newFilesCount = Number(g.newFilesCount) || 0;
                        const newUrls = uploadedUrls.slice(fileIndex, fileIndex + newFilesCount);
                        fileIndex += newFilesCount;
                        const urls = [...(g.existingUrls || []), ...newUrls];
                        allImages = [...allImages, ...urls];
                        return { category: g.category, label: g.label, urls };
                    });
                } catch (_) {
                    allImages = uploadedUrls;
                }
            } else {
                allImages = uploadedUrls;
            }

            let parsedConfigs = [];
            if (configurations) {
                try {
                    parsedConfigs = JSON.parse(configurations).map((cfg) => ({
                        ...cfg,
                        bedrooms: cfg.bedrooms === '' ? null : Number(cfg.bedrooms),
                        bathrooms: cfg.bathrooms === '' ? null : Number(cfg.bathrooms),
                        balconies: cfg.balconies === '' ? null : Number(cfg.balconies),
                        parking: cfg.parking === '' ? null : Number(cfg.parking),
                    }));
                } catch (_) {}
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
    }
);

// ─── PUT /:id Update project (admin only) ────────────────────────────────────
router.put('/:id',
    auth, adminAuth,
    upload.array('images', 50),
    // Invalidate both list and the specific project's cache
    (req, res, next) => {
        const cache = req.app.get('cache');
        if (cache) {
            cache.del(CACHE_KEYS.PROJECTS_ALL);
            cache.del(CACHE_KEYS.PROJECT_SINGLE(req.params.id));
        }
        next();
    },
    async (req, res) => {
        try {
            const {
                name, description, status, location, price, area, units, highlights, mapEmbed,
                amenities, bestFeatures, completionPercentage, imageGroupsData,
                projectType, totalFloors, configurations, videoId, possessionDate,
                reraNumber, totalLandArea, constructionType, bankApprovals,
                specFlooring, specDoors, specWindows, specKitchen,
                specBathroom, specElectrical, specPainting,
            } = req.body;

            const { data: existingProject } = await supabase
                .from('projects').select('*').eq('id', req.params.id).single();

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
            if (location !== undefined || mapEmbed !== undefined) {
                updateData.location = {
                    address: location !== undefined ? location : existingProject?.location?.address,
                    mapEmbed: mapEmbed !== undefined ? mapEmbed : existingProject?.location?.mapEmbed,
                };
            }
            if (configurations) {
                try {
                    updateData.configurations = JSON.parse(configurations).map((cfg) => ({
                        ...cfg,
                        bedrooms: cfg.bedrooms === '' ? null : Number(cfg.bedrooms),
                        bathrooms: cfg.bathrooms === '' ? null : Number(cfg.bathrooms),
                        balconies: cfg.balconies === '' ? null : Number(cfg.balconies),
                        parking: cfg.parking === '' ? null : Number(cfg.parking),
                    }));
                } catch (_) {}
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

            // Process new file uploads
            let uploadedUrls = [];
            if (req.files?.length > 0) {
                const folderName = (name || existingProject?.name || 'unnamed').toLowerCase().replace(/[^a-z0-9]/g, '-');
                uploadedUrls = await Promise.all(
                    req.files.map((file) => processSingleFile(file, folderName))
                );
            }

            if (imageGroupsData) {
                try {
                    const groups = JSON.parse(imageGroupsData);
                    let fileIndex = 0;
                    let allImages = [];
                    updateData.categorized_images = groups.map((g) => {
                        const newFilesCount = Number(g.newFilesCount) || 0;
                        const newUrls = uploadedUrls.slice(fileIndex, fileIndex + newFilesCount);
                        fileIndex += newFilesCount;
                        const urls = [...(g.existingUrls || []), ...newUrls];
                        allImages = [...allImages, ...urls];
                        return { category: g.category, label: g.label, urls };
                    });
                    updateData.images = allImages;
                    updateData.image_urls = allImages;
                } catch (_) {}
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
            res.status(500).json({ message: error.message || 'Server error' });
        }
    }
);

// ─── DELETE /:id ──────────────────────────────────────────────────────────────
router.delete('/:id',
    auth, adminAuth,
    // Invalidate both list and single project cache
    (req, res, next) => {
        const cache = req.app.get('cache');
        if (cache) {
            cache.del(CACHE_KEYS.PROJECTS_ALL);
            cache.del(CACHE_KEYS.PROJECT_SINGLE(req.params.id));
        }
        next();
    },
    projectController.deleteProject
);

module.exports = router;
