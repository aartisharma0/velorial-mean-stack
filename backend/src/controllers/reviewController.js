import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, approved: true })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, rating, body } = req.body;

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product.' });

    // Verified purchase check
    const hasPurchased = await Order.exists({
      user: req.user._id, status: { $ne: 'cancelled' },
      'items.product': productId,
    });

    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'You can only review products you have purchased.' });
    }

    const autoApprove = req.user.role === 'admin';
    const review = await Review.create({
      user: req.user._id, product: productId, rating, body, approved: autoApprove,
    });

    // Send review thanks email
    const product = await Product.findById(productId);
    if (product) {
      const tpl = emailTemplates.reviewThanks(req.user.name, product.name);
      sendEmail(req.user.email, tpl.subject, tpl.html);
    }

    res.status(201).json({
      message: autoApprove ? 'Review published!' : 'Review submitted for approval.',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin
export const getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status === 'approved') filter.approved = true;
    if (status === 'pending') filter.approved = false;

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleReviewApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    review.approved = !review.approved;
    await review.save();
    res.json({ message: `Review ${review.approved ? 'approved' : 'unapproved'}.`, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
