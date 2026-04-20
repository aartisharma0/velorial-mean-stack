import { Router } from 'express';
import { getProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct, searchAutocomplete, getRelatedProducts } from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getProducts);
router.get('/search', searchAutocomplete);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);

// Admin
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
