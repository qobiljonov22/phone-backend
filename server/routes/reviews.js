// Reviews and ratings functionality
import express from 'express';
const router = express.Router();

// In-memory reviews storage
let reviews = new Map();
let reviewCounter = 1;

// Get reviews for a phone
router.get('/phone/:phoneId', (req, res) => {
  const { phoneId } = req.params;
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  
  let phoneReviews = Array.from(reviews.values()).filter(review => review.phoneId === phoneId);
  
  // Sort reviews
  switch(sort) {
    case 'newest':
      phoneReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      phoneReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'highest':
      phoneReviews.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      phoneReviews.sort((a, b) => a.rating - b.rating);
      break;
  }
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedReviews = phoneReviews.slice(startIndex, endIndex);
  
  // Calculate statistics
  const stats = calculateReviewStats(phoneReviews);
  
  res.json({
    reviews: paginatedReviews,
    stats,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: phoneReviews.length,
      pages: Math.ceil(phoneReviews.length / parseInt(limit))
    }
  });
});

// Add review
router.post('/', (req, res) => {
  const { 
    phoneId, 
    userId, 
    userName,
    rating, 
    title, 
    comment,
    pros = [],
    cons = [],
    verified = false
  } = req.body;
  
  if (!phoneId || !userId || !rating || !title || !comment) {
    return res.status(400).json({ 
      error: 'Phone ID, user ID, rating, title, and comment are required' 
    });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  // Check if user already reviewed this phone
  const existingReview = Array.from(reviews.values()).find(
    review => review.phoneId === phoneId && review.userId === userId
  );
  
  if (existingReview) {
    return res.status(409).json({ error: 'You have already reviewed this phone' });
  }
  
  const reviewId = `review_${reviewCounter++}`;
  const review = {
    reviewId,
    phoneId,
    userId,
    userName: userName || 'Anonymous',
    rating,
    title,
    comment,
    pros,
    cons,
    verified,
    helpful: 0,
    notHelpful: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  reviews.set(reviewId, review);
  
  res.status(201).json({
    review,
    message: 'Review added successfully'
  });
});

// Update review
router.put('/:reviewId', (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment, pros, cons } = req.body;
  
  const review = reviews.get(reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  // Update fields
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    review.rating = rating;
  }
  
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  if (pros !== undefined) review.pros = pros;
  if (cons !== undefined) review.cons = cons;
  
  review.updatedAt = new Date();
  reviews.set(reviewId, review);
  
  res.json({
    review,
    message: 'Review updated successfully'
  });
});

// Mark review as helpful/not helpful
router.post('/:reviewId/helpful', (req, res) => {
  const { reviewId } = req.params;
  const { helpful } = req.body; // true for helpful, false for not helpful
  
  const review = reviews.get(reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  if (helpful === true) {
    review.helpful += 1;
  } else if (helpful === false) {
    review.notHelpful += 1;
  } else {
    return res.status(400).json({ error: 'Helpful must be true or false' });
  }
  
  reviews.set(reviewId, review);
  
  res.json({
    review,
    message: 'Feedback recorded successfully'
  });
});

// Delete review
router.delete('/:reviewId', (req, res) => {
  const { reviewId } = req.params;
  
  const review = reviews.get(reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  reviews.delete(reviewId);
  
  res.json({
    message: 'Review deleted successfully'
  });
});

// Get user's reviews
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  let userReviews = Array.from(reviews.values()).filter(review => review.userId === userId);
  userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedReviews = userReviews.slice(startIndex, endIndex);
  
  res.json({
    reviews: paginatedReviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: userReviews.length,
      pages: Math.ceil(userReviews.length / parseInt(limit))
    }
  });
});

// Get review statistics for a phone
router.get('/phone/:phoneId/stats', (req, res) => {
  const { phoneId } = req.params;
  
  const phoneReviews = Array.from(reviews.values()).filter(review => review.phoneId === phoneId);
  const stats = calculateReviewStats(phoneReviews);
  
  res.json(stats);
});

function calculateReviewStats(reviews) {
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });
  
  // Convert to percentages
  Object.keys(ratingDistribution).forEach(rating => {
    ratingDistribution[rating] = Math.round((ratingDistribution[rating] / totalReviews) * 100);
  });
  
  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
    verifiedReviews: reviews.filter(r => r.verified).length
  };
}

export default router;