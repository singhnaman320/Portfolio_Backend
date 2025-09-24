/**
 * URL Helper utilities for generating full URLs
 */

/**
 * Get the base URL for the current environment
 * @param {Object} req - Express request object
 * @returns {string} - Base URL
 */
const getBaseUrl = (req) => {
  // Always prefer environment variable if set
  if (process.env.BASE_URL) {
    return process.env.BASE_URL
  }
  
  // For production without BASE_URL, try to detect from request
  if (process.env.NODE_ENV === 'production') {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https'
    const host = req.get('x-forwarded-host') || req.get('host')
    
    // Handle Render.com specific headers
    if (req.get('x-render-origin-host')) {
      return `https://${req.get('x-render-origin-host')}`
    }
    
    return `${protocol}://${host}`
  }
  
  // For development, construct from request
  const protocol = req.protocol || 'http'
  const host = req.get('host') || 'localhost:5000'
  return `${protocol}://${host}`
}

/**
 * Convert relative image path to full URL
 * @param {string} imagePath - Relative image path
 * @param {Object} req - Express request object
 * @returns {string} - Full image URL
 */
const getFullImageUrl = (imagePath, req) => {
  if (!imagePath) return null
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Convert relative path to full URL
  const baseUrl = getBaseUrl(req)
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Transform an object's image fields to full URLs
 * @param {Object} obj - Object containing image fields
 * @param {Array} imageFields - Array of field names that contain image paths
 * @param {Object} req - Express request object
 * @returns {Object} - Object with transformed image URLs
 */
const transformImageUrls = (obj, imageFields, req) => {
  if (!obj) return obj
  
  const transformed = { ...obj }
  
  // Handle both plain objects and Mongoose documents
  const objData = obj.toObject ? obj.toObject() : obj
  
  imageFields.forEach(field => {
    if (objData[field]) {
      transformed[field] = getFullImageUrl(objData[field], req)
    }
  })
  
  return transformed
}

module.exports = {
  getBaseUrl,
  getFullImageUrl,
  transformImageUrls
}
