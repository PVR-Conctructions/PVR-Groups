require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');
const { uploadToBunnyStorage, generateBunnyCdnUrl } = require('../utils/imageWorkers');

const TEST_PROJECT_NAME = "The Crown 4K Luxury Estates";
const FOLDER_NAME = TEST_PROJECT_NAME.toLowerCase().replace(/[^a-z0-9]/g, '-');

// 4K Unsplash Image URLs (Architecture & Luxury Interiors)
const images4k = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=3840&q=100", // Mansion exterior
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840&q=100", // Luxury pool
  "https://images.unsplash.com/photo-1600607687930-cebc5a7abaal?w=3840&q=100", // Living room
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=3840&q=100", // Modern Kitchen
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=3840&q=100"  // Bedroom
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

async function seed4KProject() {
  console.log(`🚀 Seeding project: ${TEST_PROJECT_NAME}`);
  if (process.env.BUNNY_ACCESS_KEY === "your-bunny-storage-access-key") {
    console.error("❌ ERROR: Please add your real BUNNY_ACCESS_KEY in backend/.env before running this script.");
    process.exit(1);
  }

  const tempDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const finalUrls = [];

  for (let i = 0; i < images4k.length; i++) {
    const filename = `luxury-4k-${i + 1}.jpg`;
    const localPath = path.join(tempDir, filename);
    const bunnyPath = `projects/${FOLDER_NAME}/${filename}`;

    try {
      console.log(`[${i + 1}/${images4k.length}] Downloading 4K image...`);
      await downloadFile(images4k[i], localPath);

      console.log(`[${i + 1}/${images4k.length}] Uploading to Bunny Storage (${bunnyPath})...`);
      await uploadToBunnyStorage(localPath, bunnyPath);

      const cdnUrl = generateBunnyCdnUrl(bunnyPath);
      finalUrls.push(cdnUrl);
      console.log(`✅ Uploaded: ${cdnUrl}`);

      // clean up local
      fs.unlinkSync(localPath);
    } catch (err) {
      console.error(`❌ Failed on image ${i + 1}:`, err.message);
    }
  }

  console.log("\n📦 Creating Supabase Database Entry...");
  
  const projectData = {
    name: TEST_PROJECT_NAME,
    title: TEST_PROJECT_NAME,
    description: "An exclusive look at ultra-luxury 4K estates with unparalleled design and architecture.",
    location: { address: "Banjara Hills, Hyderabad" },
    image_urls: finalUrls,
    images: finalUrls,
    status: "ongoing",
    completion_percentage: 25,
    price: "₹ 15.5 Cr",
    area: "8500 sq.ft",
    units: 12,
    project_type: "Villas",
    total_floors: "3",
    configurations: [
      { type: "5 BHK Ultra Luxury Villa", area: "8500", price: "15.5 Cr", bedrooms: 5, bathrooms: 6, parking: 4 }
    ],
  };

  const { data, error } = await supabase.from('projects').insert(projectData).select();
  
  if (error) {
    console.error("❌ Database Insert Failed:", error.message);
  } else {
    console.log("✅ Success! Project inserted with ID:", data[0].id);
  }
}

seed4KProject();
