const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load env vars
const {
  generateOptimizedUrl,
  downloadOptimizedImage,
  uploadToBunnyStorage,
  generateBunnyCdnUrl
} = require("../utils/imageWorkers.js");

const images = [
  "https://ik.imagekit.io/project/livingroom.jpg",
  "https://ik.imagekit.io/project/kitchen.jpg"
];

async function processImages() {
  for (let imageUrl of images) {
    try {
      const optimizedUrl = generateOptimizedUrl(imageUrl);
      const filename = imageUrl.split("/").pop().split(".")[0] + ".webp";
      const localPath = path.join(__dirname, `../optimized/${filename}`);

      console.log(`Downloading ${optimizedUrl}...`);
      await downloadOptimizedImage(optimizedUrl, localPath);

      console.log(`Uploading ${localPath} to Bunny Storage...`);
      await uploadToBunnyStorage(localPath, `projects/${filename}`);

      console.log(`Uploaded! Final URL:`, generateBunnyCdnUrl(`projects/${filename}`));
    } catch (err) {
      console.error(`Error processing ${imageUrl}:`, err.message);
    }
  }
}

if (require.main === module) {
  processImages();
}

module.exports = { processImages };
