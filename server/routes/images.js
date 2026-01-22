import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage } from '../utils/storage.js';

const router = express.Router();

// Ensure uploads directory exists (only in non-serverless)
const isVercelEnv = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const uploadsDir = isVercelEnv ? '/tmp/uploads/phones' : 'uploads/phones';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const phoneId = req.params.phoneId;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${phoneId}-${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storageConfig,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload single image for a phone
router.post('/upload/:phoneId', upload.single('image'), async (req, res) => {
  try {
    const { phoneId } = req.params;
    const { alt, isPrimary } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided'
      });
    }
    
    // Check if phone exists
    const phone = await storage.findOne('phones', { id: phoneId });
    if (!phone) {
      // Delete uploaded file if phone doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        error: 'Phone not found'
      });
    }
    
    const imageData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/phones/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      alt: alt || `${phone.brand} ${phone.model}`,
      isPrimary: isPrimary === 'true',
      uploadedAt: new Date().toISOString()
    };
    
    // Get existing images
    const images = phone.images || [];
    
    // If this is set as primary, make others non-primary
    if (imageData.isPrimary) {
      images.forEach(img => {
        if (typeof img === 'object') {
          img.isPrimary = false;
        }
      });
    }
    
    images.push(imageData);
    
    // Update phone with new images
    await storage.update('phones', { id: phoneId }, {
      images,
      updatedAt: new Date().toISOString()
    });
    
    const updatedPhone = await storage.findOne('phones', { id: phoneId });
    
    res.json({
      message: 'Image uploaded successfully',
      image: imageData,
      phone: updatedPhone,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Upload multiple images for a phone
router.post('/upload-multiple/:phoneId', upload.array('images', 5), async (req, res) => {
  try {
    const { phoneId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No image files provided'
      });
    }
    
    // Check if phone exists
    const phone = await storage.findOne('phones', { id: phoneId });
    if (!phone) {
      // Delete uploaded files if phone doesn't exist
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({
        error: 'Phone not found'
      });
    }
    
    const uploadedImages = req.files.map((file, index) => ({
      id: (Date.now() + index).toString(),
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/phones/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      alt: `${phone.brand} ${phone.model} - Image ${index + 1}`,
      isPrimary: index === 0, // First image is primary
      uploadedAt: new Date().toISOString()
    }));
    
    // Get existing images
    const images = phone.images || [];
    
    // If first image is primary, make existing images non-primary
    if (uploadedImages[0].isPrimary) {
      images.forEach(img => {
        if (typeof img === 'object') {
          img.isPrimary = false;
        }
      });
    }
    
    images.push(...uploadedImages);
    
    // Update phone with new images
    await storage.update('phones', { id: phoneId }, {
      images,
      updatedAt: new Date().toISOString()
    });
    
    const updatedPhone = await storage.findOne('phones', { id: phoneId });
    
    res.json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
      phone: updatedPhone,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Get all images for a specific phone
router.get('/phone/:phoneId', async (req, res) => {
  const { phoneId } = req.params;
  
  const phone = await storage.findOne('phones', { id: phoneId });
  if (!phone) {
    return res.status(404).json({
      error: 'Phone not found'
    });
  }
  
  const images = phone.images || [];
  
  // Filter out string URLs and only return uploaded image objects
  const uploadedImages = images.filter(img => typeof img === 'object');
  
  res.json({
    phoneId,
    phoneName: `${phone.brand} ${phone.model}`,
    images: uploadedImages,
    total: uploadedImages.length,
    timestamp: new Date().toISOString()
  });
});

// Get all uploaded images
router.get('/all', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  let allImages = [];
  
  // Collect all images from all phones
  const phones = await storage.find('phones');
  phones.forEach(phone => {
    if (phone.images) {
      const uploadedImages = phone.images
        .filter(img => typeof img === 'object')
        .map(img => ({
          ...img,
          phoneId: phone.id,
          phoneName: `${phone.brand} ${phone.model}`
        }));
      allImages.push(...uploadedImages);
    }
  });
  
  // Sort by upload date (newest first)
  allImages.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedImages = allImages.slice(startIndex, endIndex);
  
  res.json({
    images: paginatedImages,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(allImages.length / limit),
      totalItems: allImages.length,
      itemsPerPage: parseInt(limit)
    },
    timestamp: new Date().toISOString()
  });
});

// Delete an image
router.delete('/:phoneId/:imageId', async (req, res) => {
  const { phoneId, imageId } = req.params;
  
  const phone = await storage.findOne('phones', { id: phoneId });
  if (!phone) {
    return res.status(404).json({
      error: 'Phone not found'
    });
  }
  
  const images = phone.images || [];
  if (images.length === 0) {
    return res.status(404).json({
      error: 'No images found for this phone'
    });
  }
  
  const imageIndex = images.findIndex(img => 
    typeof img === 'object' && img.id === imageId
  );
  
  if (imageIndex === -1) {
    return res.status(404).json({
      error: 'Image not found'
    });
  }
  
  const deletedImage = images[imageIndex];
  
  // Delete physical file
  const filePath = path.join(uploadsDir, deletedImage.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Remove from images array
  images.splice(imageIndex, 1);
  
  // Update phone
  await storage.update('phones', { id: phoneId }, {
    images,
    updatedAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Image deleted successfully',
    deletedImage,
    timestamp: new Date().toISOString()
  });
});

// Update image metadata
router.put('/:phoneId/:imageId', async (req, res) => {
  const { phoneId, imageId } = req.params;
  const { alt, isPrimary } = req.body;
  
  const phone = await storage.findOne('phones', { id: phoneId });
  if (!phone) {
    return res.status(404).json({
      error: 'Phone not found'
    });
  }
  
  const images = phone.images || [];
  if (images.length === 0) {
    return res.status(404).json({
      error: 'No images found for this phone'
    });
  }
  
  const imageIndex = images.findIndex(img => 
    typeof img === 'object' && img.id === imageId
  );
  
  if (imageIndex === -1) {
    return res.status(404).json({
      error: 'Image not found'
    });
  }
  
  const image = images[imageIndex];
  
  // Update metadata
  if (alt !== undefined) {
    image.alt = alt;
  }
  
  if (isPrimary !== undefined) {
    const newIsPrimary = isPrimary === 'true' || isPrimary === true;
    
    if (newIsPrimary) {
      // Make all other images non-primary
      images.forEach(img => {
        if (typeof img === 'object') {
          img.isPrimary = false;
        }
      });
    }
    
    image.isPrimary = newIsPrimary;
  }
  
  image.updatedAt = new Date().toISOString();
  
  // Update phone
  await storage.update('phones', { id: phoneId }, {
    images,
    updatedAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Image updated successfully',
    image,
    timestamp: new Date().toISOString()
  });
});

// Get image statistics
router.get('/stats', async (req, res) => {
  let totalImages = 0;
  let totalSize = 0;
  const phoneImageCounts = {};
  
  const phones = await storage.find('phones');
  phones.forEach(phone => {
    if (phone.images) {
      const uploadedImages = phone.images.filter(img => typeof img === 'object');
      phoneImageCounts[phone.id] = {
        phoneName: `${phone.brand} ${phone.model}`,
        imageCount: uploadedImages.length
      };
      
      totalImages += uploadedImages.length;
      totalSize += uploadedImages.reduce((sum, img) => sum + (img.size || 0), 0);
    }
  });
  
  res.json({
    totalImages,
    totalSize,
    totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
    phoneImageCounts,
    timestamp: new Date().toISOString()
  });
});

export default router;
