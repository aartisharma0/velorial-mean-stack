import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getInvoice } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, getInvoice);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
