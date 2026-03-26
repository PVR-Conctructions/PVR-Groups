require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');
const { uploadToBunnyStorage, generateBunnyCdnUrl } = require('../utils/imageWorkers');

const TEST_PROJECT_NAME = "Magnolia Grandeur Categorized Estates";
const FOLDER_NAME = TEST_PROJECT_NAME.toLowerCase().replace(/[^a-z0-9]/g, '-');

// Categorized 4K Unsplash High-res Image URLs
const categoryImages = [
  { category: "Exterior", label: "Front Elevation", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=3840&q=100" },
  { category: "Interior", label: "Living Room", url: "https://images.unsplash.com/photo-1600607687930-cebc5a7abaal?w=3840&q=100" },
  { category: "Bedroom", label: "Master Suite", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=3840&q=100" },
  { category: "Bathroom", label: "Spa-like Bathroom", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=3840&q=100" },
  { category: "Kitchen", label: "Modern Island Kitchen", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=3840&q=100" }
];

async function downloadFile(url, filepath) {
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function seedCategorizedProject() {
  console.log(`🚀 Seeding project: ${TEST_PROJECT_NAME}`);
  if (process.env.BUNNY_ACCESS_KEY === "your-bunny-storage-access-key") {
    console.error("❌ ERROR: Please add your real BUNNY_ACCESS_KEY in backend/.env before running this script.");
    process.exit(1);
  }

  const tempDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const categorizedData = [];
  const allImageUrls = []; // Flat list for 'images'

  for (let i = 0; i < categoryImages.length; i++) {
    const { category, label, url } = categoryImages[i];
    const filename = `${category.toLowerCase()}_${i + 1}.jpg`;
    const localPath = path.join(tempDir, filename);
    const bunnyPath = `projects/${FOLDER_NAME}/${filename}`;

    try {
      console.log(`[${i + 1}/${categoryImages.length}] Downloading 4K image for ${category}...`);
      await downloadFile(url, localPath);

      console.log(`[${i + 1}/${categoryImages.length}] Uploading to Bunny Storage (${bunnyPath})...`);
      await uploadToBunnyStorage(localPath, bunnyPath);

      const cdnUrl = generateBunnyCdnUrl(bunnyPath);
      allImageUrls.push(cdnUrl);
      
      // Push category object exactly as frontend and DB expects
      categorizedData.push({
        category: category,
        label: label,
        urls: [cdnUrl]
      });
      
      console.log(`✅ Uploaded [${category}]: ${cdnUrl}`);

      // clean up local temp image
      fs.unlinkSync(localPath);
    } catch (err) {
      console.error(`❌ Failed on image [${category}]:`, err.message);
    }
  }

  console.log("\n📦 Creating Supabase Database Entry (with categories)...");
  
  const projectData = {
    name: TEST_PROJECT_NAME,
    title: TEST_PROJECT_NAME,
    description: "Experience categorized spaces of Magnolia Grandeur in glorious 4K resolution.",
    location: { address: "Jubilee Hills, Hyderabad" },
    image_urls: allImageUrls,
    images: allImageUrls,
    categorized_images: categorizedData, // Important payload for separated frontend tabs
    status: "ongoing",
    completion_percentage: 45,
    price: "₹ 18 Cr",
    area: "9500 sq.ft",
    units: 8,
    project_type: "Villas",
    total_floors: "4",
    configurations: [
      { type: "5 BHK Signature Villa", area: "9500", price: "18 Cr", bedrooms: 5, bathrooms: 6, parking: 5 }
    ]
  };

  const { data, error } = await supabase.from('projects').insert(projectData).select();
  
  if (error) {
    console.error("❌ Database Insert Failed:", error.message);
  } else {
    console.log("✅ Success! Project inserted with categorized images, ID:", data[0].id);
  }
}

seedCategorizedProject();
