import { Router } from 'express';
import { getDashboard, getCustomers, toggleCustomerStatus, getSubscribers, deleteSubscriber, subscribe, getEnquiries, getEnquiry, createEnquiry, updateEnquiryStatus, deleteEnquiry } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public
router.post('/subscribe', subscribe);
router.post('/enquiries', createEnquiry);

// Admin
router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/customers', protect, adminOnly, getCustomers);
router.patch('/customers/:id/toggle', protect, adminOnly, toggleCustomerStatus);
router.get('/subscribers', protect, adminOnly, getSubscribers);
router.delete('/subscribers/:id', protect, adminOnly, deleteSubscriber);
router.get('/enquiries', protect, adminOnly, getEnquiries);
router.get('/enquiries/:id', protect, adminOnly, getEnquiry);
router.patch('/enquiries/:id/status', protect, adminOnly, updateEnquiryStatus);
router.delete('/enquiries/:id', protect, adminOnly, deleteEnquiry);

export default router;
