import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, q, sort, minPrice, maxPrice, status, featured } = req.query;
    const filter = {};

    if (status) filter.status = status;
    else if (!req.user?.role || req.user.role !== 'admin') filter.status = 'active';

    if (q) filter.name = { $regex: q, $options: 'i' };
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (featured === 'true') filter.featured = true;

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        const children = await Category.find({ parent: cat._id }).select('_id');
        const catIds = [cat._id, ...children.map(c => c._id)];
        filter.category = { $in: catIds };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    else if (sort === 'price_high') sortOption = { price: -1 };
    else if (sort === 'name') sortOption = { name: 1 };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
      .populate('category', 'name slug parent');
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created.', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product updated.', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchAutocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const products = await Product.find({ status: 'active', name: { $regex: q, $options: 'i' } })
      .populate('category', 'name')
      .select('name slug price images category')
      .limit(6);

    res.json(products.map(p => ({
      name: p.name, slug: p.slug, price: `₹${p.price.toLocaleString()}`,
      category: p.category?.name || '', image: p.primaryImage,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.json([]);

    let related = await Product.find({
      category: product.category, _id: { $ne: product._id }, status: 'active'
    }).limit(4);

    if (related.length < 4) {
      const more = await Product.find({
        _id: { $nin: [...related.map(r => r._id), product._id] }, status: 'active'
      }).limit(4 - related.length);
      related = [...related, ...more];
    }

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
