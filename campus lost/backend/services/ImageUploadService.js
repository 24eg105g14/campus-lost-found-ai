const cloudinary = require('cloudinary').v2;

class ImageUploadService {
  static configureCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : '';
    const apiKey = process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : '';

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });
      return true;
    }
    return false;
  }

  static isCloudinaryConfigured() {
    return this.configureCloudinary();
  }

  /**
   * Upload buffer or file to Cloudinary
   */
  static async uploadImage(fileBuffer, folder = 'lostlink_items', fallbackUrl = '') {
    const isConfigured = this.configureCloudinary();

    if (isConfigured && fileBuffer) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: folder, resource_type: 'image' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

        console.log(`✅ Successfully uploaded image to Cloudinary: ${result.secure_url}`);
        return {
          imageUrl: result.secure_url,
          imagePublicId: result.public_id
        };
      } catch (uploadErr) {
        console.error('❌ Cloudinary Upload Failed:', uploadErr.message || uploadErr);
      }
    }

    // If Cloudinary is not configured, or if fileBuffer was not passed, or if Cloudinary failed:
    const defaultPlaceholder = fallbackUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
    console.log(`⚠️ Using fallback image URL: ${defaultPlaceholder}`);
    return {
      imageUrl: defaultPlaceholder,
      imagePublicId: `placeholder_${Date.now()}`
    };
  }

  /**
   * Delete asset from Cloudinary when item is deleted
   */
  static async deleteImage(publicId) {
    if (this.configureCloudinary() && publicId && !publicId.startsWith('placeholder_')) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting Cloudinary asset:', err);
      }
    }
  }
}

module.exports = ImageUploadService;
