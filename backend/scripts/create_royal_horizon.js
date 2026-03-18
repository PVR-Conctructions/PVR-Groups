const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const Project = require('../models/Project');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGE_PATHS = {
  exterior: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\1676dc59-61af-4138-a6fd-a2bb4e04a67c\\royal_exterior_1773844157520.png',
  interior: 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\1676dc59-61af-4138-a6fd-a2bb4e04a67c\\royal_interior_1773844188115.png',
  // Placeholders that will be updated if generation successful
  pool: '',
  bedroom: ''
};

async function uploadImage(filePath, folder) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
       console.log(`Skipping missing image: ${filePath}`);
       return null;
    }
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

    // Look for pool/bedroom dynamically in case filenames change
    const brainDir = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\1676dc59-61af-4138-a6fd-a2bb4e04a67c';
    const files = fs.readdirSync(brainDir);
    const poolFile = files.find(f => f.startsWith('royal_pool_'));
    const bedFile = files.find(f => f.startsWith('royal_bedroom_'));
    if (poolFile) IMAGE_PATHS.pool = path.join(brainDir, poolFile);
    if (bedFile) IMAGE_PATHS.bedroom = path.join(brainDir, bedFile);

    console.log('Uploading images to Cloudinary (4K Optimized)...');
    
    // Upload all found images
    const [exteriorUrl, interiorUrl, poolUrl, bedroomUrl] = await Promise.all([
      uploadImage(IMAGE_PATHS.exterior, 'projects/royal_horizon/exterior'),
      uploadImage(IMAGE_PATHS.interior, 'projects/royal_horizon/interior'),
      uploadImage(IMAGE_PATHS.pool, 'projects/royal_horizon/amenities'),
      uploadImage(IMAGE_PATHS.bedroom, 'projects/royal_horizon/bedroom'),
    ]);

    // Use placeholder if an image is missing
    const finalPoolUrl = poolUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=3840';
    const finalBedUrl = bedroomUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840';

    const projectData = {
      name: "PVR Royal Horizon",
      title: "PVR Royal Horizon - The Pinnacle of Luxury",
      description: "Welcome to PVR Royal Horizon, an exclusive 40-story ultra-luxury residential skyscraper that redefines the skyline. Featuring bespoke 4 and 5 BHK sky villas, each residence boasts a private plunge pool, wrap-around balconies with uninterrupted full-city vistas, and imported Italian marble finishes. Elevate your lifestyle with a private helipad, a residents-only 5-star spa, and an Olympic-grade rooftop infinity pool. Experience cutting-edge smart home technology combined with timeless architectural grandeur. Royal Horizon is not just a residence; it is a legacy.",
      status: "ongoing",
      completionPercentage: 15,
      imageUrls: [exteriorUrl, interiorUrl, finalPoolUrl, finalBedUrl],
      images: [exteriorUrl, interiorUrl, finalPoolUrl, finalBedUrl],
      categorizedImages: [
        { category: "Exterior", label: "Tower View", urls: [exteriorUrl] },
        { category: "Interior", label: "Living & Dining", urls: [interiorUrl] },
        { category: "Amenities", label: "Sky Pool", urls: [finalPoolUrl] },
        { category: "Interior", label: "Master Suite", urls: [finalBedUrl] }
      ],
      amenities: [
        "Rooftop Infinity Pool",
        "Private Helipad",
        "5-Star Resident Spa",
        "Automated Valet Parking",
        "Private Screening Theatre",
        "Sky Lounge & Bar",
        "Gourmet Resident Restaurant",
        "Advanced Biometric Security"
      ],
      bestFeatures: [
        "Private Plunge Pools",
        "Wrap-around Balconies",
        "Smart Glass Windows",
        "12-foot High Ceilings"
      ],
      location: {
        address: "Banjara Hills, Hyderabad",
        mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.5!2d78.43!3d17.41!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDI0JzM1LjkiTiA3OMKwMjYnMDAuM^{\prime\prime}E!5e0!3m2!1sen!2sin!4v1" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
      },
      floorPlans: [interiorUrl],
      brochureUrl: "",
      price: "₹ 8.5 Cr Onwards",
      area: "5200 - 8500 Sq.Ft.",
      units: "80 Sky Villas",
      highlights: [
        "1 Residence Per Floor",
        "Private Elevator Lobbies",
        "Unobstructed 360-Degree Views"
      ],
      projectType: "Ultra Luxury Sky Villas",
      totalFloors: "G+40",
      configurations: [
        { type: "4 BHK Sky Villa", price: "₹ 8.5 Cr", area: "5200 Sq.Ft.", bedrooms: "4", bathrooms: "5", balconies: "3", parking: "3", description: "Expansive layout with private cinema room" },
        { type: "5 BHK Penthouse", price: "₹ 14.5 Cr", area: "8500 Sq.Ft.", bedrooms: "5", bathrooms: "6", balconies: "4", parking: "4", description: "Duplex penthouse with private rooftop plunge pool" }
      ],
      possessionDate: "March 2029",
      reraNumber: "P0250000ROYAL",
      totalLandArea: "3.2 Acres",
      constructionType: "Steel Frame & High-Strength Concrete",
      bankApprovals: ["SBI", "HDFC", "ICICI Private Wealth"],
      specifications: {
        flooring: "Statuario Italian Marble in common areas, premium engineered hardwood in all bedrooms.",
        doors: "10-foot solid Teak wood main doors with smart biometric locks.",
        windows: "Floor-to-ceiling ultra-clear tempered glass with thermal break.",
        kitchen: "Custom Poggenpohl modular kitchens with Gaggenau built-in appliances.",
        bathroom: "Gessi fixtures, Toto Neorest smart toilets, and freestanding soaking tubs.",
        electrical: "Crestron complete home automation system.",
        painting: "Zero-VOC premium washable finishes."
      }
    };

    const newProject = new Project(projectData);
    await newProject.save();

    console.log('Project "PVR Royal Horizon" created successfully!');
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
