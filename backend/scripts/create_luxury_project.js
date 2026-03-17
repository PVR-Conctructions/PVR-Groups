const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const Project = require('../models/Project'); // Assuming the script will be run from the backend/scripts directory

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGE_PATHS = {
  exterior: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\b01001ae-25d5-4932-b3cf-eb03ac4c1873\\exterior_front_1773742707752.png',
  interior: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\b01001ae-25d5-4932-b3cf-eb03ac4c1873\\interior_living_1773742726455.png',
  pool: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\b01001ae-25d5-4932-b3cf-eb03ac4c1873\\amenity_pool_1773742749547.png',
  floorPlan: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\b01001ae-25d5-4932-b3cf-eb03ac4c1873\\floor_plan_1773742928236.png',
  construction: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\b01001ae-25d5-4932-b3cf-eb03ac4c1873\\construction_site_1773742950281.png'
};

async function uploadImage(filePath, folder) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `pvr_groups/${folder}`,
      use_filename: true,
      unique_filename: true,
      overwrite: true,
    });
    console.log(`Uploaded ${filePath} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    throw error;
  }
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    console.log('Uploading images to Cloudinary...');
    const [exteriorUrl, interiorUrl, poolUrl, floorPlanUrl, constructionUrl] = await Promise.all([
      uploadImage(IMAGE_PATHS.exterior, 'projects/serenity_heights/exterior'),
      uploadImage(IMAGE_PATHS.interior, 'projects/serenity_heights/interior'),
      uploadImage(IMAGE_PATHS.pool, 'projects/serenity_heights/amenities'),
      uploadImage(IMAGE_PATHS.floorPlan, 'projects/serenity_heights/floor_plans'),
      uploadImage(IMAGE_PATHS.construction, 'projects/serenity_heights/construction'),
    ]);

    // Create the Project Object
    const projectData = {
      name: "PVR Serenity Heights",
      title: "PVR Serenity Heights - Ultra Luxury Residences",
      description: "Discover a life of unparalleled luxury at PVR Serenity Heights. Nestled in a prime location, this architectural masterpiece offers breathtaking panoramic views, opulent living spaces, and top-tier amenities designed for the elite. Each unit features floor-to-ceiling windows, premium fittings, and expansive contemporary layouts that redefine modern living. Experience harmony and elegance, crafted strictly for those who demand nothing but perfection.",
      status: "ongoing",
      completionPercentage: 35,
      // Provide backwards-compatible array (flat array of images)
      imageUrls: [exteriorUrl, interiorUrl, poolUrl, floorPlanUrl, constructionUrl],
      images: [exteriorUrl, interiorUrl, poolUrl, floorPlanUrl, constructionUrl], 
      categorizedImages: [
        {
          category: "Exterior",
          label: "Building Facade",
          urls: [exteriorUrl]
        },
        {
          category: "Interior",
          label: "Living Room",
          urls: [interiorUrl]
        },
        {
          category: "Amenities",
          label: "Infinity Pool",
          urls: [poolUrl]
        },
        {
          category: "Floor Plan",
          label: "3 BHK Layout",
          urls: [floorPlanUrl]
        },
        {
          category: "Construction Progress",
          label: "Site Overview",
          urls: [constructionUrl]
        }
      ],
      amenities: [
        "Infinity Swimming Pool",
        "State-of-the-Art Gymnasium",
        "Exclusive Clubhouse",
        "Landscaped Gardens",
        "24/7 Multi-Tier Security",
        "Concierge Services",
        "Smart Home Automation",
        "Double Height Lobby"
      ],
      bestFeatures: [
        "Panoramic City Views",
        "VRV Air Conditioning",
        "Italian Marble Flooring",
        "Zero Dead Space Design"
      ],
      location: {
        address: "Financial District, Hyderabad",
        mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15228.093110294!2d78.34149955!3d17.41165485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb95a09b552fa1%3A0xb3bd0e017684cbf0!2sFinancial%20District%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1709292850980!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
      },
      floorPlans: [floorPlanUrl],
      brochureUrl: "",
      price: "₹ 5.5 Cr Onwards",
      area: "3500 - 5200 Sq.Ft.",
      units: "120 Exclusive Units",
      highlights: [
        "Only 2 Apartments Per Floor",
        "Exquisite Triple Height Podiums",
        "Pre-certified IGBC Gold Rating"
      ],
      projectType: "Residential Apartments",
      totalFloors: "G+45",
      configurations: ["3 BHK", "4 BHK Sky Villas"],
      possessionDate: "December 2028",
      reraNumber: "P0240000XXXX",
      totalLandArea: "4.5 Acres",
      constructionType: "RCC Mivan Framework",
      bankApprovals: ["SBI", "HDFC", "ICICI", "Axis Bank"],
      specifications: {
        flooring: "Imported Marble in living, dining, and foyer. Premium engineered wooden flooring in bedrooms.",
        doors: "8 feet height Teak wood frame with flush shutters and premium hardware.",
        windows: "Floor-to-ceiling UPVC/Aluminum double glazed windows with DGU glass.",
        kitchen: "Modular European kitchen setup with quartz countertops and built-in premium appliances.",
        bathroom: "Villeroy & Boch / Toto sanitary ware, Hansgrohe CP fittings.",
        electrical: "Concealed FRLS copper wiring, premium modular switches (Legrand/Schneider).",
        painting: "Premium acrylic emulsion paint over smooth putty finish."
      }
    };

    const newProject = new Project(projectData);
    await newProject.save();

    console.log('Project "PVR Serenity Heights" created successfully!');
    console.log(`Project ID: ${newProject._id}`);

  } catch (error) {
    console.error('Error in script execution:', error);
    fs.writeFileSync('error_log.txt', String(error) + '\\n' + String(error.stack));
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB.');
    }
  }
}

run();
