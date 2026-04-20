import Wishlist from '../models/Wishlist.js';

export const getWishlist = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ user: req.user._id })
      .populate({ path: 'product', populate: { path: 'category', select: 'name slug' } })
      .sort('-createdAt');
    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await Wishlist.findOne({ user: req.user._id, product: productId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ message: 'Removed from wishlist.', added: false });
    }

    await Wishlist.create({ user: req.user._id, product: productId });
    res.json({ message: 'Added to wishlist!', added: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWishlistIds = async (req, res) => {
  try {
    const ids = await Wishlist.find({ user: req.user._id }).select('product');
    res.json(ids.map(w => w.product.toString()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
