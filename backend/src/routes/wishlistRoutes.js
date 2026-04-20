import { Router } from 'express';
import { getWishlist, toggleWishlist, getWishlistIds } from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getWishlist);
router.get('/ids', protect, getWishlistIds);
router.post('/toggle', protect, toggleWishlist);

export default router;
