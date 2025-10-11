/**
 * Get the full URL for an image stored on the backend
 * @param {string} imagePath - The image path from the database (e.g., "/uploads/image/image-123.jpg")
 * @returns {string} - The full URL to access the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('⚠️ getImageUrl: No image path provided');
    return null;
  }
  
  // If the path is already a full URL (starts with http), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('✅ getImageUrl: Full URL provided:', imagePath);
    return imagePath;
  }
  
  // Get the API base URL
  const getBaseUrl = () => {
    // In development, use the local backend
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    }
    // In production, use the production URL
    return import.meta.env.VITE_API_URL_PROD?.replace('/api', '') || 'https://gurukul-platform-api.onrender.com';
  };
  
  const baseUrl = getBaseUrl();
  
  // Ensure the path starts with a slash
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  const fullUrl = `${baseUrl}${cleanPath}`;
  console.log(`🖼️ getImageUrl: ${imagePath} → ${fullUrl}`);
  
  return fullUrl;
};

/**
 * Get a placeholder image URL for when no image is available
 * @param {string} type - The type of placeholder (course, community, avatar, etc.)
 * @returns {string} - URL to a placeholder image
 */
export const getPlaceholderImage = (type = 'default') => {
  const placeholders = {
    course: 'https://via.placeholder.com/1280x720/4F46E5/FFFFFF?text=Course',
    community: 'https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=Community',
    avatar: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=User',
    default: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Image'
  };
  
  return placeholders[type] || placeholders.default;
};
