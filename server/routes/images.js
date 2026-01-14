import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Load phones database
let phonesData = JSON.parse(fs.readFileSync('phones_database.json', 'utf8'));

// Helper function to save data
const saveData = () => {
  fs.writeFileSync('phones_database.json', JSON.stringify(phonesData, null, 2));
};

// Ensure uploads directory exists
const uploadsDir = 'uploads/phones';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload single image for a phone
router.post('/upload/:phoneId', upload.single('image'), (req, res) => {
  try {
    const { phoneId } = req.params;
    const { alt, isPrimary } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided'
      });
    }
    
    // Check if phone exists
    if (!phonesData.phones[phoneId]) {
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
      alt: alt || `${phonesData.phones[phoneId].brand} ${phonesData.phones[phoneId].model}`,
      isPrimary: isPrimary === 'true',
      uploadedAt: new Date().toISOString()
    };
    
    // Add image to phone's images array
    if (!phonesData.phones[phoneId].images) {
      phonesData.phones[phoneId].images = [];
    }
    
    // If this is set as primary, make others non-primary
    if (imageData.isPrimary) {
      phonesData.phones[phoneId].images.forEach(img => {
        if (typeof img === 'object') {
          img.isPrimary = false;
        }
      });
    }
    
    phonesData.phones[phoneId].images.push(imageData);
    phonesData.phones[phoneId].updatedAt = new Date().toISOString();
    
    saveData();
    
    res.json({
      message: 'Image uploaded successfully',
      image: imageData,
      phone: phonesData.phones[phoneId],
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
router.post('/upload-multiple/:phoneId', upload.array('images', 5), (req, res) => {
  try {
    const { phoneId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No image files provided'
      });
    }
    
    // Check if phone exists
    if (!phonesData.phones[phoneId]) {
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
      alt: `${phonesData.phones[phoneId].brand} ${phonesData.phones[phoneId].model} - Image ${index + 1}`,
      isPrimary: index === 0, // First image is primary
      uploadedAt: new Date().toISOString()
    }));
    
    // Add images to phone's images array
    if (!phonesData.phones[phoneId].images) {
      phonesData.phones[phoneId].images = [];
    }
    
    // If first image is primary, make existing images non-primary
    if (uploadedImages[0].isPrimary) {
      phonesData.phones[phoneId].images.forEach(img => {
        if (typeof img === 'object') {
          img.isPrimary = false;
        }
      });
    }
    
    phonesData.phones[phoneId].images.push(...uploadedImages);
    phonesData.phones[phoneId].updatedAt = new Date().toISOString();
    
    saveData();
    
    res.json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
      phone: phonesData.phones[phoneId],
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
router.get('/phone/:phoneId', (req, res) => {
  const { phoneId } = req.params;
  
  if (!phonesData.phones[phoneId]) {
    return res.status(404).json({
      error: 'Phone not found'
    });
  }
  
  const phone = phonesData.phones[phoneId];
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
router.get('/all', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  let allImages = [];
  
  // Collect all images from all phones
  Object.values(phonesData.phones).forEach(phone => {
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
router.delete('/:phoneId/:imageId', (req, res) => {
  const { phoneId, imageId } = req.params;
  
  if (!phonesData.phones[phoneId]) {
    return res.status(404).json({
      error: 'Phone not found'
    });
  }
  
  const phone = phonesData.phones[phoneId];
  if (!phone.images) {
    return res.status(404).json({
      error: 'No images found for this phone'
    });
  }
  
  const imageIndex = phone.images.findIndex(img => 
    typeof img === 'object' && img.id === imageId
  );
  
  if (imageIndex === -1) {
    return res.status(404).json({
      error: 'Image not found'
    });
  }
  
  const deletedImage = phone.images[imageIndex];
  
  // Delete physical file
  const filePath = path.join(uploadsDir, deletedImage.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Remove from database
  phone.images.splice(imageIndex, 1);
  phone.updatedAt = new Date().toISOString();
  
  saveData();
  
  res.json({
    message: 'Image deleted successfully',
    deletedImage,
    timestamp: new Date().toISOString()
  });
});

// Update image metadata
router.put('/:phoneId/:imageId', (req, res) => {
  const { phoneId, imageId } = req.params;
  const { alt, isPrimary } = req.body;
  
  if (!phonesData.phones[phoneId]) {
    return res.status(404).json({
      error: 'Phone not found'
    });
  }
  
  const phone = phonesData.phones[phoneId];
  if (!phone.images) {
    return res.status(404).json({
      error: 'No images found for this phone'
    });
  }
  
  const imageIndex = phone.images.findIndex(img => 
    typeof img === 'object' && img.id === imageId
  );
  
  if (imageIndex === -1) {
    return res.status(404).json({
      error: 'Image not found'
    });
  }
  
  const image = phone.images[imageIndex];
  
  // Update metadata
  if (alt !== undefined) {
    image.alt = alt;
  }
  
  if (isPrimary !== undefined) {
    const newIsPrimary = isPrimary === 'true' || isPrimary === true;
    
    if (newIsPrimary) {
      // Make all other images non-primary
      phone.images.forEach(img => {
        if (typeof img === 'object') {
          img.isPrimary = false;
        }
      });
    }
    
    image.isPrimary = newIsPrimary;
  }
  
  image.updatedAt = new Date().toISOString();
  phone.updatedAt = new Date().toISOString();
  
  saveData();
  
  res.json({
    message: 'Image updated successfully',
    image,
    timestamp: new Date().toISOString()
  });
});

// Get image statistics
router.get('/stats', (req, res) => {
  let totalImages = 0;
  let totalSize = 0;
  const phoneImageCounts = {};
  
  Object.values(phonesData.phones).forEach(phone => {
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