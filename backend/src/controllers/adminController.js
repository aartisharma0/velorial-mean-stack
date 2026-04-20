import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Subscriber from '../models/Subscriber.js';
import Enquiry from '../models/Enquiry.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

export const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, pendingOrders, revenue, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().populate('user', 'name email').sort('-createdAt').limit(10),
    ]);

    res.json({
      stats: { totalUsers, totalProducts, totalOrders, pendingOrders, revenue: revenue[0]?.total || 0 },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { role: 'user' };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const total = await User.countDocuments(filter);
    const customers = await User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ customers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleCustomerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `Customer ${user.isActive ? 'activated' : 'blocked'}.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort('-createdAt');
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscriber removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await Subscriber.findOne({ email });
    if (exists) return res.json({ message: 'Already subscribed!' });
    await Subscriber.create({ email });
    const tpl = emailTemplates.subscriptionThanks(email);
    sendEmail(email, tpl.subject, tpl.html);
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEnquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const enquiries = await Enquiry.find(filter).sort('-createdAt');
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    if (enquiry.status === 'new') { enquiry.status = 'read'; await enquiry.save(); }
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json({ message: 'Enquiry submitted! We will get back within 24 hours.', enquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ message: 'Status updated.', enquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enquiry deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
