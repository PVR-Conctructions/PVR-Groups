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
export function optimizeCloudinaryUrl(url, width = 1200) {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    // Avoid double-inserting transformations if already optimized
    if (url.includes('/upload/f_auto')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_auto,dpr_auto,w_${width}/`);
}

/**
 * Generates a responsive srcSet string for <img srcSet="...">
 * Returns '' for non-Cloudinary URLs so the browser ignores the attribute.
 *
 * @param {string} url - Raw Cloudinary URL
 * @param {number[]} widths - Widths to include (default: [300, 600, 1200])
 * @returns {string}
 */
export function cloudinarySrcSet(url, widths = [300, 600, 1200]) {
    if (!url || !url.includes('res.cloudinary.com')) return '';
    return widths
        .map(w => `${optimizeCloudinaryUrl(url, w)} ${w}w`)
        .join(', ');
}

/** Pre-bound convenience helpers for each visual context */
export const cloudinaryHero    = (url) => optimizeCloudinaryUrl(url, 1200);
export const cloudinaryGallery = (url) => optimizeCloudinaryUrl(url, 800);
export const cloudinaryThumb   = (url) => optimizeCloudinaryUrl(url, 300);
