import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);

    // Send welcome email
    const tpl = emailTemplates.welcome(user.name);
    sendEmail(user.email, tpl.subject, tpl.html);

    res.status(201).json({ message: 'Account created successfully.', token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact support.' });
    }

    const token = generateToken(user._id);
    res.json({ message: `Welcome back, ${user.name}!`, token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true });
    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = password;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
