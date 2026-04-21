/**
 * Resolve media URLs and fix legacy hardcoded localhost links in production
 */

// Extract the base URL from the API base (removing /api if present)
const getBaseUrl = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return apiBase.replace(/\/api$/, '');
};

/**
 * Ensures a URL is correct for the current environment.
 * Handles relative paths and fixes legacy localhost URLs.
 */
export const resolveMediaUrl = (path) => {
    if (!path) return '';

    // If it's a full URL and contains localhost (legacy data), fix it
    if (path.includes('localhost:5000')) {
        return path.replace('http://localhost:5000', getBaseUrl());
    }

    // If it's a relative path (starts with /), prepend the base URL
    if (path.startsWith('/')) {
        return `${getBaseUrl()}${path}`;
    }

    // If it's already a correct full URL (https://...), return as is
    return path;
};

/**
 * Scans HTML content (like Quills output) and replaces legacy localhost links
 * with the correct production backend URL.
 */
export const fixLegacyContent = (html) => {
    if (!html) return '';
    const baseUrl = getBaseUrl();
    
    // Replace hardcoded localhost images with the production base URL
    // This fixes the "Mixed Content" and "Connection Refused" errors for old posts
    return html.replace(/http:\/\/localhost:5000/g, baseUrl);
};
