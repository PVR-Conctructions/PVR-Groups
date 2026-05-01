const axios = require('axios');
const fs = require('fs');
const path = require('path');
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.warn('[imageWorkers] sharp not installed. Run: npm install sharp');
    sharp = null;
}

const STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com';
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY;
const CDN_DOMAIN = process.env.BUNNY_CDN_DOMAIN;

// ─── Upload a Buffer directly to Bunny Storage ──────────────────────────────
async function uploadBufferToBunny(buffer, destinationPath) {
    await axios.put(
        `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE}/${destinationPath}`,
        buffer,
        {
            headers: {
                AccessKey: ACCESS_KEY,
                'Content-Type': 'application/octet-stream',
                'Content-Length': buffer.length,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
            maxBodyLength: Infinity,
        }
    );
}

// ─── Upload a file path to Bunny Storage ─────────────────────────────────────
async function uploadToBunnyStorage(filePath, destinationPath) {
    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;
    await axios.put(
        `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE}/${destinationPath}`,
        fileStream,
        {
            headers: {
                AccessKey: ACCESS_KEY,
                'Content-Type': 'application/octet-stream',
                'Content-Length': fileSize,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
            maxBodyLength: Infinity,
        }
    );
}

// ─── Process image with Sharp and upload directly to Bunny ───────────────────
// Returns the final Bunny CDN URL. No temp file, no round-trip.
async function processAndUploadImage(inputPath, destinationPath, options = {}) {
    const { width = 1920, quality = 82 } = options;

    let buffer;

    if (sharp) {
        buffer = await sharp(inputPath)
            .resize(width, null, { withoutEnlargement: true, fit: 'inside' })
            .webp({ quality })
            .toBuffer();
    } else {
        // Fallback: upload original if sharp is unavailable
        buffer = fs.readFileSync(inputPath);
    }

    // The destination path should always end in .webp when sharp is used
    const finalPath = sharp ? destinationPath.replace(/\.[^.]+$/, '.webp') : destinationPath;
    await uploadBufferToBunny(buffer, finalPath);
    return generateBunnyCdnUrl(finalPath);
}

// ─── Delete a file from Bunny Storage ────────────────────────────────────────
async function deleteFromBunnyStorage(destinationPath) {
    try {
        await axios.delete(
            `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE}/${destinationPath}`,
            { headers: { AccessKey: ACCESS_KEY } }
        );
    } catch (err) {
        console.error(`[Bunny] Failed to delete ${destinationPath}:`, err.message);
    }
}

// ─── Generate a Bunny CDN public URL ─────────────────────────────────────────
function generateBunnyCdnUrl(filePath) {
    return `https://${CDN_DOMAIN}/${filePath}`;
}

// ─── Legacy helpers (kept for backwards compatibility) ───────────────────────
function generateOptimizedUrl(imageUrl, width = null) {
    let transforms = 'tr=f-auto,q-70';
    if (width) transforms += `,w-${width}`;
    return `${imageUrl}?${transforms}`;
}

async function downloadOptimizedImage(url, filePath) {
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

module.exports = {
    processAndUploadImage,
    uploadToBunnyStorage,
    uploadBufferToBunny,
    deleteFromBunnyStorage,
    generateBunnyCdnUrl,
    // Legacy
    generateOptimizedUrl,
    downloadOptimizedImage,
};
