import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name slug')
      .populate('children')
      .sort('sortOrder');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getParentCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parent: null, isActive: true })
      .populate('children')
      .sort('sortOrder');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, parent, isActive, sortOrder, image } = req.body;
    const category = await Category.create({ name, slug, description, parent: parent || null, isActive, sortOrder, image });
    res.status(201).json({ message: 'Category created.', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category updated.', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) return res.status(400).json({ message: 'Cannot delete category with products.' });

    await Category.updateMany({ parent: req.params.id }, { parent: null });
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
