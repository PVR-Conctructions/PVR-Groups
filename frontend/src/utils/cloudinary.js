/**
 * Cloudinary image optimization helper.
 *
 * Inserts Cloudinary transformation parameters right after `/upload/` in a
 * Cloudinary URL so that the CDN delivers the correct format, quality and
 * dimensions automatically – no extra npm packages required.
 *
 * Usage:
 *   import { optimizeCloudinaryUrl, cloudinarySrcSet } from '../utils/cloudinary';
 *
 *   <img
 *     src={optimizeCloudinaryUrl(url, 800)}
 *     srcSet={cloudinarySrcSet(url)}
 *     sizes="(max-width: 768px) 100vw, 800px"
 *     loading="lazy"
 *   />
 *
 * Non-Cloudinary URLs (e.g. Unsplash placeholders) are returned unchanged.
 */

/**
 * @param {string} url    - Raw Cloudinary URL from the API
 * @param {number} width  - Desired width in pixels (default 1200)
 * @returns {string}      - Optimized Cloudinary URL (or original if not Cloudinary)
 */
export function optimizeCloudinaryUrl(url, width = 3840) {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    // Avoid double-inserting transformations if already optimized
    if (url.includes('/upload/f_auto') || url.includes('/upload/q_100')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_100,dpr_auto,w_${width}/`);
}

export const cloudinaryGallery = (url) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    return `${parts[0]}/upload/f_auto,q_auto:good,dpr_auto,w_auto,c_limit/${parts[1]}`;
};

export const cloudinaryThumb = (url) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    return `${parts[0]}/upload/f_auto,q_auto:low,w_300,c_fill/${parts[1]}`;
};

export const cloudinarySrcSet = (url, sizes = [640, 1280, 1920, 2560, 3840]) => {
    if (!url || !url.includes('res.cloudinary.com')) return '';
    const parts = url.split('/upload/');
    if (parts.length !== 2) return '';
    return sizes
        .map(size => `${parts[0]}/upload/f_auto,q_auto,dpr_auto,w_${size}/${parts[1]} ${size}w`)
        .join(', ');
};

export const cloudinaryHero = cloudinaryGallery;
export const cloudinaryLightbox = cloudinaryGallery;
