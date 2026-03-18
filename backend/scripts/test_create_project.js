const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Project = require('../models/Project');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    try {
        const project = await Project.create({
            name: "Test Admin Project",
            description: "Test description from admin",
            status: "ongoing",
            images: [],
            imageUrls: [],
            categorizedImages: [],
            completionPercentage: 0,
            amenities: [],
            bestFeatures: [],
            location: { address: "Test location", mapEmbed: "" },
            price: "", area: "", units: "",
            highlights: [],
            projectType: "",
            totalFloors: "",
            configurations: [{ type: "test", bedrooms: "", bathrooms: "", parking: "" }],
            videoId: "",
            possessionDate: "",
            reraNumber: "",
            totalLandArea: "",
            constructionType: "",
            bankApprovals: [],
            specifications: {
                flooring: "", doors: "", windows: "", kitchen: "", bathroom: "", electrical: "", painting: ""
            }
        });
        console.log("Successfully created:", project._id);
        await Project.findByIdAndDelete(project._id);
    } catch (err) {
        console.error("Mongoose Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}
test();
