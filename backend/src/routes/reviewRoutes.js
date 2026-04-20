import { Router } from 'express';
import { getProductReviews, createReview, getAllReviews, toggleReviewApproval, deleteReview } from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.get('/all', protect, adminOnly, getAllReviews);
router.patch('/:id/toggle', protect, adminOnly, toggleReviewApproval);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
