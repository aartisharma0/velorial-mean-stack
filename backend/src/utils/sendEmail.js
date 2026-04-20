import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.MAIL_USER) return; // Skip if not configured
    await transporter.sendMail({
      from: `"Veloria" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to, subject, html,
    });
  } catch (error) {
    console.error('Email error:', error.message);
  }
};

export const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Veloria!',
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;"><h1 style="color:#d63384;">Welcome, ${name}!</h1><p>Thank you for joining Veloria. Start exploring our curated fashion collections.</p><p>Use code <strong>WELCOME20</strong> for 20% off your first order.</p><a href="${process.env.CLIENT_URL}/shop" style="display:inline-block;padding:12px 30px;background:#d63384;color:white;text-decoration:none;border-radius:8px;">Start Shopping</a><br><br><small>Team Veloria</small></div>`,
  }),

  orderConfirmation: (order) => ({
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;"><h1 style="color:#d63384;">Order Confirmed!</h1><p>Order <strong>${order.orderNumber}</strong> has been placed.</p><p><strong>Total:</strong> ₹${order.total.toLocaleString()}</p><p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p><a href="${process.env.CLIENT_URL}/account/orders/${order._id}" style="display:inline-block;padding:12px 30px;background:#d63384;color:white;text-decoration:none;border-radius:8px;">Track Order</a><br><br><small>Team Veloria</small></div>`,
  }),

  orderStatus: (order, oldStatus) => ({
    subject: `Order Update - ${order.orderNumber}`,
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;"><h1 style="color:#d63384;">Order Update</h1><p>Your order <strong>${order.orderNumber}</strong> status changed from <strong>${oldStatus}</strong> to <strong>${order.status}</strong>.</p>${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}<a href="${process.env.CLIENT_URL}/account/orders/${order._id}" style="display:inline-block;padding:12px 30px;background:#d63384;color:white;text-decoration:none;border-radius:8px;">View Order</a><br><br><small>Team Veloria</small></div>`,
  }),

  subscriptionThanks: (email) => ({
    subject: 'Welcome to Veloria Newsletter!',
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;"><h1 style="color:#d63384;">You are In!</h1><p>Welcome to the Veloria newsletter. Get exclusive deals and new arrivals first.</p><p>Use code <strong>VELORIA10</strong> for 10% off.</p><a href="${process.env.CLIENT_URL}/shop" style="display:inline-block;padding:12px 30px;background:#d63384;color:white;text-decoration:none;border-radius:8px;">Shop Now</a><br><br><small>Team Veloria</small></div>`,
  }),

  reviewThanks: (userName, productName) => ({
    subject: 'Thanks for your review!',
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;"><h1 style="color:#d63384;">Thank You!</h1><p>Hi ${userName}, thanks for reviewing <strong>${productName}</strong>. Your feedback helps other shoppers.</p><a href="${process.env.CLIENT_URL}/shop" style="display:inline-block;padding:12px 30px;background:#d63384;color:white;text-decoration:none;border-radius:8px;">Continue Shopping</a><br><br><small>Team Veloria</small></div>`,
  }),
};
