const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');
const fs = require('fs');
const supabase = require('../config/supabase');
const { uploadToBunnyStorage, generateBunnyCdnUrl } = require('../utils/imageWorkers');

const TEST_PROJECT_NAME = "Magnolia Grandeur Estates";
const FOLDER_NAME = TEST_PROJECT_NAME.toLowerCase().replace(/[^a-z0-9]/g, '-');

// Verified working Unsplash 4K image URLs (no auth required)
const categoryImages = [
  {
    category: "Exterior",
    label: "Grand Front Elevation",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=3840"
  },
  {
    category: "Exterior",
    label: "Rear Garden View",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840"
  },
  {
    category: "Interior",
    label: "Living Room",
    url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=3840"
  },
  {
    category: "Interior",
    label: "Dining Area",
    url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=3840"
  },
  {
    category: "Bedroom",
    label: "Master Suite",
    url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=3840"
  },
  {
    category: "Bedroom",
    label: "Guest Bedroom",
    url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=3840"
  },
  {
    category: "Bathroom",
    label: "Spa Bathroom",
    url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=3840"
  },
  {
    category: "Bathroom",
    label: "Master Ensuite",
    url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=3840"
  },
  {
    category: "Kitchen",
    label: "Island Kitchen",
    url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=3840"
  },
  {
    category: "Kitchen",
    label: "Gourmet Chef Kitchen",
    url: "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=3840"
  }
];

async function downloadFile(url, filepath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000,
        headers: { 'Accept': 'image/*' }
      });
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      return; // success
    } catch (err) {
      console.warn(`  ⚠️  Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 2000)); // wait 2s before retry
    }
  }
}

async function uploadWithRetry(localPath, bunnyPath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await uploadToBunnyStorage(localPath, bunnyPath);
      return; // success
    } catch (err) {
      console.warn(`  ⚠️  Upload attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function cleanupOldProject() {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('name', TEST_PROJECT_NAME);
  if (!error) console.log("🗑️  Removed any previous version of this project.");
}

async function seedCategorizedProject() {
  console.log(`🚀 Seeding project: ${TEST_PROJECT_NAME}`);

  if (
    !process.env.BUNNY_ACCESS_KEY ||
    process.env.BUNNY_ACCESS_KEY === "your-bunny-storage-access-key"
  ) {
    console.error("❌ ERROR: Please add your real BUNNY_ACCESS_KEY in backend/.env before running this script.");
    process.exit(1);
  }

  await cleanupOldProject();

  const tempDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const optimizedDir = path.join(__dirname, '../optimized');
  if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir, { recursive: true });

  // Group results by category for categorized_images field
  const categoryMap = {};
  const allImageUrls = [];

  for (let i = 0; i < categoryImages.length; i++) {
    const { category, label, url } = categoryImages[i];
    const filename = `${category.toLowerCase().replace(/\s/g,'-')}_${i + 1}.jpg`;
    const localPath = path.join(tempDir, filename);
    const bunnyPath = `projects/${FOLDER_NAME}/${filename}`;

    try {
      console.log(`\n[${i + 1}/${categoryImages.length}] Downloading 4K: [${category}] ${label}...`);
      await downloadFile(url, localPath);

      console.log(`  ⬆️  Uploading to Bunny: ${bunnyPath}...`);
      await uploadWithRetry(localPath, bunnyPath);

      const cdnUrl = generateBunnyCdnUrl(bunnyPath);
      allImageUrls.push(cdnUrl);

      if (!categoryMap[category]) {
        categoryMap[category] = { category, label, urls: [] };
      }
      categoryMap[category].urls.push(cdnUrl);

      console.log(`  ✅ Done: ${cdnUrl}`);
    } catch (err) {
      console.error(`  ❌ Permanently failed [${category} - ${label}]: ${err.message}`);
    } finally {
      try { if (fs.existsSync(localPath)) fs.unlinkSync(localPath); } catch (e) {}
    }
  }

  const categorizedImages = Object.values(categoryMap);

  console.log(`\n📊 Summary: ${allImageUrls.length}/${categoryImages.length} images uploaded successfully.`);
  console.log("📦 Creating Supabase Database Entry...");

  const projectData = {
    name: TEST_PROJECT_NAME,
    title: TEST_PROJECT_NAME,
    description: "Experience Magnolia Grandeur — an ultra-luxury villa community with stunning interiors, grand exteriors, spa bathrooms, and a state-of-the-art gourmet kitchen.",
    location: { address: "Jubilee Hills, Hyderabad" },
    image_urls: allImageUrls,
    images: allImageUrls,
    categorized_images: categorizedImages,
    status: "ongoing",
    completion_percentage: 45,
    price: "₹ 18 Cr onwards",
    area: "9500 sq.ft",
    units: 8,
    project_type: "Villas",
    total_floors: "4",
    configurations: [
      {
        type: "5 BHK Signature Villa",
        area: "9500",
        price: "18 Cr",
        bedrooms: 5,
        bathrooms: 6,
        parking: 5,
        balconies: 3,
        description: "Ultra-luxury signature villa with private pool and dedicated staff quarters."
      }
    ],
    possession_date: "December 2026",
    rera_number: "P02400004567",
    total_land_area: "3.5 Acres",
    construction_type: "RCC Frame Structure",
    bank_approvals: ["HDFC Bank", "SBI", "Axis Bank"],
    amenities: [
      "Private Pool", "Home Theatre", "Smart Home Automation",
      "Gymnasium", "Clubhouse", "24x7 Security", "Solar Power"
    ],
    specifications: {
      flooring: "Italian Marble throughout",
      doors: "French Oak Wood Doors",
      windows: "UPVC Double Glazed",
      kitchen: "Modular with Quartz Countertops",
      bathroom: "Grohe / American Standard Fittings",
      electrical: "Legrand Modular Switches",
      painting: "Asian Paints Royale"
    }
  };

  const { data, error } = await supabase.from('projects').insert(projectData).select().single();

  if (error) {
    console.error("❌ Database Insert Failed:", error.message);
    console.error(error);
  } else {
    console.log(`\n🎉 SUCCESS! Project Created:`);
    console.log(`  📌 ID    : ${data.id}`);
    console.log(`  📌 Name  : ${data.name}`);
    console.log(`  📌 Images: ${allImageUrls.length}`);
    console.log(`  📌 Categories: ${categorizedImages.map(c => c.category).join(', ')}`);
    console.log(`\n🌐 Bunny CDN prefix: https://${process.env.BUNNY_CDN_DOMAIN}/projects/${FOLDER_NAME}/`);
  }
}

seedCategorizedProject();
