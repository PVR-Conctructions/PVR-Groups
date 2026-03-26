const axios = require("axios");
const fs = require("fs");
const path = require("path");

const IMAGEKIT_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY;
const CDN_DOMAIN = process.env.BUNNY_CDN_DOMAIN;

function generateOptimizedUrl(imageUrl, width = null) {
  let transforms = 'tr=f-auto,q-70';
  if (width) transforms += `,w-${width}`;
  return `${imageUrl}?${transforms}`;
}

async function downloadOptimizedImage(url, filePath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function uploadToBunnyStorage(filePath, destinationPath) {
  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  await axios.put(
    `https://storage.bunnycdn.com/${STORAGE_ZONE}/${destinationPath}`,
    fileStream,
    {
      headers: {
        AccessKey: ACCESS_KEY,
        "Content-Type": "application/octet-stream",
        "Content-Length": fileSize,
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      maxBodyLength: Infinity
    }
  );
}

async function deleteFromBunnyStorage(destinationPath) {
  try {
    await axios.delete(
      `https://storage.bunnycdn.com/${STORAGE_ZONE}/${destinationPath}`,
      {
        headers: { AccessKey: ACCESS_KEY }
      }
    );
  } catch (err) {
    console.error(`Failed to delete ${destinationPath} from Bunny:`, err.message);
  }
}

function generateBunnyCdnUrl(filePath) {
  return `https://${CDN_DOMAIN}/${filePath}`;
}

module.exports = {
  generateOptimizedUrl,
  downloadOptimizedImage,
  uploadToBunnyStorage,
  deleteFromBunnyStorage,
  generateBunnyCdnUrl
};
