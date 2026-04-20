import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  size: { type: String, default: null },
  color: { type: String, default: null },
  priceModifier: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: null },
  stock: { type: Number, default: 0, min: 0 },
  images: [{ type: String }],
  sku: { type: String, default: null },
  weight: { type: Number, default: null },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' },
  featured: { type: Boolean, default: false },
  variants: [variantSchema],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('primaryImage').get(function () {
  if (this.images && this.images.length > 0) return this.images[0];
  const colors = { 0: 'E8B4B8', 1: 'F5CCD3', 2: 'D5C4A1', 3: 'C3B1E1', 4: 'B5EAD7', 5: 'FFD6A5' };
  const color = colors[Math.abs(this.name?.length || 0) % 6];
  return `https://placehold.co/400x500/${color}/555?text=${encodeURIComponent(this.name || 'Product')}&font=playfair-display`;
});

productSchema.virtual('reviewCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  count: true,
});

productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
