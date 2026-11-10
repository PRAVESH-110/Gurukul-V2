/**
 * Get the full URL for an image stored on the backend
 * @param {string | null | undefined} imagePath - The image path from the database (e.g., "/uploads/image/image-123.jpg")
 * @returns {string | undefined} - The full URL to access the image or undefined if none
 */
export declare function getImageUrl(imagePath?: string | null): string | undefined;

/**
 * Get a placeholder image URL for when no image is available
 * @param {string} [type] - The type of placeholder (course, community, avatar, etc.)
 * @returns {string} - URL to a placeholder image
 */
export declare function getPlaceholderImage(type?: string): string;
