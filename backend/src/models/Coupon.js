import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent', 'flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, default: null },
  usesLeft: { type: Number, default: null },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

couponSchema.methods.isValid = function () {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.usesLeft !== null && this.usesLeft <= 0) return false;
  return true;
};

couponSchema.methods.calculateDiscount = function (subtotal) {
  if (this.minOrder && subtotal < this.minOrder) return 0;
  if (this.type === 'percent') return Math.round(subtotal * (this.value / 100) * 100) / 100;
  return Math.min(this.value, subtotal);
};

export default mongoose.model('Coupon', couponSchema);
