import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String, default: null },
  variantLabel: { type: String, default: null },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['stripe', 'cod'], required: true },
  trackingNumber: { type: String, default: null },
  shippingAddress: {
    fullName: String, phone: String, street: String,
    city: String, state: String, zip: String, country: String,
  },
  payment: {
    provider: String,
    transactionId: { type: String, default: null },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paidAt: { type: Date, default: null },
  },
  notes: { type: String, default: null },
}, { timestamps: true });

orderSchema.statics.generateOrderNumber = function () {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VLR-${date}-${rand}`;
};

export default mongoose.model('Order', orderSchema);
