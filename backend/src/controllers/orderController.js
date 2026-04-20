import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Stripe from 'stripe';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, stripeToken } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty.' });

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'active') {
        return res.status(400).json({ message: `Product "${item.name || 'Unknown'}" is unavailable.` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Only ${product.stock} units of "${product.name}" available.` });
      }

      const price = item.variantId
        ? product.price + (product.variants.id(item.variantId)?.priceModifier || 0)
        : product.price;

      const itemTotal = price * item.qty;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        variantId: item.variantId || null,
        variantLabel: item.variantLabel || null,
        qty: item.qty,
        unitPrice: price,
        total: itemTotal,
      });
    }

    // Coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid()) {
        discount = coupon.calculateDiscount(subtotal);
        if (coupon.usesLeft !== null) {
          coupon.usesLeft -= 1;
          await coupon.save();
        }
      }
    }

    const tax = Math.round((subtotal - discount) * 0.18 * 100) / 100;
    const shippingCost = subtotal >= 999 ? 0 : 99;
    const total = subtotal - discount + tax + shippingCost;

    // COD limit
    if (paymentMethod === 'cod' && total > 10000) {
      return res.status(400).json({ message: 'COD not available for orders above ₹10,000. Use card payment.' });
    }

    // Stripe payment
    let paymentData = { provider: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'pending' };

    if (paymentMethod === 'stripe') {
      if (!stripeToken) return res.status(400).json({ message: 'Payment token required.' });

      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const charge = await stripe.charges.create({
          amount: Math.round(total * 100),
          currency: 'inr',
          source: stripeToken,
          description: `Veloria Order by ${req.user.email}`,
        });
        paymentData = { provider: 'stripe', transactionId: charge.id, status: 'completed', paidAt: new Date() };
      } catch (stripeError) {
        return res.status(400).json({ message: `Payment failed: ${stripeError.message}` });
      }
    }

    // Create order
    const order = await Order.create({
      orderNumber: Order.generateOrderNumber(),
      user: req.user._id,
      items: orderItems,
      status: paymentData.status === 'completed' ? 'processing' : 'pending',
      subtotal, discount, tax, shippingCost, total,
      paymentMethod, shippingAddress, payment: paymentData,
    });

    // Reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    // Send order confirmation email
    const tpl = emailTemplates.orderConfirmation(order);
    sendEmail(req.user.email, tpl.subject, tpl.html);

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name slug images price')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.user = req.user._id;

    const order = await Order.findOne(filter).populate('items.product', 'name slug images price').populate('user', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.orderNumber = { $regex: search, $options: 'i' };

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.user = req.user._id;

    const order = await Order.findOne(filter)
      .populate('items.product', 'name slug images price')
      .populate('user', 'name email phone');

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const statusBadge = { pending: '#ffc107', processing: '#17a2b8', shipped: '#007bff', delivered: '#28a745', cancelled: '#dc3545' };

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice - ${order.orderNumber}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;color:#333;font-size:14px;padding:40px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;border-bottom:3px solid #d63384;padding-bottom:20px}
    .brand{font-size:28px;font-weight:700;letter-spacing:3px;color:#d63384}
    .brand small{display:block;font-size:11px;color:#888;letter-spacing:1px;font-weight:400;font-style:italic}
    table{width:100%;border-collapse:collapse;margin-bottom:30px}
    thead th{background:#f8f8f8;padding:12px 15px;text-align:left;font-size:12px;text-transform:uppercase;border-bottom:2px solid #eee}
    tbody td{padding:12px 15px;border-bottom:1px solid #f0f0f0}
    .text-right{text-align:right}
    .totals{margin-left:auto;width:280px}
    .totals tr td{padding:6px 0;font-size:13px}
    .total-row{font-size:18px;font-weight:700;color:#d63384;border-top:2px solid #d63384;padding-top:10px}
    .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;color:white}
    .footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee;color:#aaa;font-size:11px}
    .no-print{text-align:center;margin-bottom:20px}
    @media print{.no-print{display:none}body{padding:20px}}</style></head><body>
    <div class="no-print">
      <button onclick="window.print()" style="background:#d63384;color:white;border:none;padding:10px 30px;border-radius:8px;cursor:pointer;font-weight:600;">Print / Download PDF</button>
      <button onclick="window.close()" style="background:#6c757d;color:white;border:none;padding:10px 30px;border-radius:8px;cursor:pointer;font-weight:600;margin-left:10px;">Close</button>
    </div>
    <div class="header">
      <div class="brand">VELORIA<small>Where every piece tells your story</small></div>
      <div style="text-align:right">
        <h2 style="font-size:22px;margin-bottom:5px;">INVOICE</h2>
        <p><strong>${order.orderNumber}</strong></p>
        <p>Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        <p><span class="badge" style="background:${statusBadge[order.status] || '#6c757d'}">${order.status.toUpperCase()}</span>
        ${order.payment?.status === 'completed' ? '<span class="badge" style="background:#28a745;margin-left:4px;">PAID</span>' : ''}</p>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:30px;">
      <div><h4 style="font-size:12px;color:#d63384;text-transform:uppercase;margin-bottom:8px;">Bill To</h4>
        <p style="font-size:13px;line-height:1.6;color:#555"><strong>${order.user?.name}</strong><br>${order.user?.email}${order.user?.phone ? '<br>' + order.user.phone : ''}</p></div>
      ${order.shippingAddress ? `<div><h4 style="font-size:12px;color:#d63384;text-transform:uppercase;margin-bottom:8px;">Ship To</h4>
        <p style="font-size:13px;line-height:1.6;color:#555"><strong>${order.shippingAddress.fullName}</strong><br>${order.shippingAddress.street}<br>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>${order.shippingAddress.country}</p></div>` : ''}
      <div><h4 style="font-size:12px;color:#d63384;text-transform:uppercase;margin-bottom:8px;">Payment</h4>
        <p style="font-size:13px;line-height:1.6;color:#555">Method: ${order.paymentMethod.toUpperCase()}${order.payment?.transactionId ? '<br>Txn: ' + order.payment.transactionId : ''}${order.payment?.paidAt ? '<br>Paid: ' + new Date(order.payment.paidAt).toLocaleDateString() : ''}</p></div>
    </div>
    <table><thead><tr><th>#</th><th>Product</th><th class="text-right">Price</th><th class="text-right">Qty</th><th class="text-right">Total</th></tr></thead>
    <tbody>${order.items.map((item, i) => `<tr><td>${i + 1}</td><td><strong>${item.product?.name || 'Product'}</strong>${item.variantLabel ? '<br><small>' + item.variantLabel + '</small>' : ''}</td><td class="text-right">₹${item.unitPrice.toLocaleString()}</td><td class="text-right">${item.qty}</td><td class="text-right"><strong>₹${item.total.toLocaleString()}</strong></td></tr>`).join('')}</tbody></table>
    <table class="totals">
      <tr><td>Subtotal</td><td class="text-right">₹${order.subtotal.toLocaleString()}</td></tr>
      ${order.discount > 0 ? `<tr style="color:#28a745"><td>Discount</td><td class="text-right">-₹${order.discount.toLocaleString()}</td></tr>` : ''}
      <tr><td>Tax (GST 18%)</td><td class="text-right">₹${order.tax.toLocaleString()}</td></tr>
      <tr><td>Shipping</td><td class="text-right">${order.shippingCost > 0 ? '₹' + order.shippingCost : 'FREE'}</td></tr>
      <tr class="total-row"><td><strong>Grand Total</strong></td><td class="text-right"><strong>₹${order.total.toLocaleString()}</strong></td></tr>
    </table>
    <div class="footer"><p><strong>VELORIA</strong> — Where every piece tells your story</p><p>Thank you for shopping with us!</p></div>
    </body></html>`;

    res.json({ html });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(trackingNumber && { trackingNumber }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Send status update email
    const populatedOrder = await Order.findById(order._id).populate('user', 'email name');
    if (populatedOrder?.user?.email) {
      const tpl = emailTemplates.orderStatus(populatedOrder, req.body.oldStatus || 'pending');
      sendEmail(populatedOrder.user.email, tpl.subject, tpl.html);
    }

    res.json({ message: `Order status updated to ${status}.`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
