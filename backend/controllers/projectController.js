const supabase = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Helper to map DB to what frontend expects 
const mapProject = (p) => {
    if (!p) return null;
    return {
        ...p,
        _id: p.id,
        imageUrls: p.image_urls,
        completionPercentage: p.completion_percentage,
        categorizedImages: p.categorized_images,
        bestFeatures: p.best_features,
        floorPlans: p.floor_plans,
        brochureUrl: p.brochure_url,
        virtualTourUrl: p.virtual_tour_url,
        viewCount: p.view_count,
        projectType: p.project_type,
        totalFloors: p.total_floors,
        videoId: p.video_id,
        possessionDate: p.possession_date,
        reraNumber: p.rera_number,
        totalLandArea: p.total_land_area,
        constructionType: p.construction_type,
        bankApprovals: p.bank_approvals,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    };
};

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
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'construction_projects'
            });
            uploadedImages.push(result.secure_url);
            try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (e) {}
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
            } catch (e) {}
        }

        const insertData = {
            name: name || title || 'Untitled Project',
            title: title || name,
            description,
            location: typeof location === 'string' ? { address: location } : location,
            image_urls: uploadedImages,
            images: uploadedImages,
            status: status || 'ongoing',
            completion_percentage: completionPercentage ? Number(completionPercentage) : 0,
            amenities: amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [],
            best_features: bestFeatures ? (typeof bestFeatures === 'string' ? JSON.parse(bestFeatures) : bestFeatures) : [],
            price, area, units,
            project_type: projectType, 
            total_floors: totalFloors,
            configurations: parsedConfigs,
            video_id: Array.isArray(videoId) ? videoId[0] : videoId,
            possession_date: possessionDate, 
            rera_number: reraNumber,
            total_land_area: totalLandArea, 
            construction_type: constructionType,
            bank_approvals: bankApprovals ? (typeof bankApprovals === 'string' ? JSON.parse(bankApprovals) : bankApprovals) : [],
            specifications: {
                flooring: specFlooring || '',
                doors: specDoors || '',
                windows: specWindows || '',
                kitchen: specKitchen || '',
                bathroom: specBathroom || '',
                electrical: specElectrical || '',
                painting: specPainting || '',
            }
        };

        const { data: project, error } = await supabase.from('projects').insert(insertData).select().single();
        if (error) throw error;
        
        res.status(201).json(mapProject(project));
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: error.message || 'Server error during project creation' });
    }
};

// Fetch all projects (including existing logic)
exports.getProjects = async (req, res) => {
    try {
        const { status } = req.query;
        let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (status) {
            query = query.eq('status', status);
        }
        
        const { data: projects, error } = await query;
        if (error) throw error;
        
        res.status(200).json(projects.map(mapProject));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch a single project by ID (including view count logic)
exports.getProjectById = async (req, res) => {
    try {
        const { data: existing } = await supabase.from('projects').select('view_count').eq('id', req.params.id).single();
        if (!existing) return res.status(404).json({ message: 'Project not found' });
        
        const { data: project, error } = await supabase
            .from('projects')
            .update({ view_count: (existing.view_count || 0) + 1 })
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (error) throw error;
        res.status(200).json(mapProject(project));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete project and Cloudinary images based on dynamic route or ID
exports.deleteProject = async (req, res) => {
    try {
        const { data: project } = await supabase.from('projects').select('image_urls').eq('id', req.params.id).single();
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const deletePromises = [];
        if (project.image_urls && project.image_urls.length > 0) {
             project.image_urls.forEach(url => {
                const urlParts = url.split('/');
                const filenameAndExt = urlParts[urlParts.length - 1];
                const filename = filenameAndExt.split('.')[0];
                const publicId = `construction_projects/${filename}`;
                deletePromises.push(cloudinary.uploader.destroy(publicId));
            });
            await Promise.all(deletePromises);
        }

        const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
        if (error) throw error;
        
        res.json({ message: 'Project and associated images deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.mapProject = mapProject;
