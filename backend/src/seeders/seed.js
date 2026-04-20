import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const rand = () => Math.random().toString(36).substring(2, 6);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear
    await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Coupon.deleteMany()]);
    console.log('Cleared old data');

    // Users
    const admin = await User.create({ name: 'Admin', email: 'admin@veloria.com', password: 'Admin@123', role: 'admin', isActive: true });
    const user = await User.create({ name: 'Test User', email: 'user@veloria.com', password: 'User@123', role: 'user', isActive: true });
    console.log('Users seeded');

    // Categories
    const catData = {
      Women: ['Dresses', 'Tops', 'Jeans', 'Ethnic Wear', 'Western Wear'],
      Men: ['Shirts', 'T-Shirts', 'Jeans', 'Formal Wear', 'Casual Wear'],
      Kids: ['Boys', 'Girls', 'Infants'],
      Footwear: ['Sneakers', 'Heels', 'Flats', 'Boots', 'Sandals'],
      Accessories: ['Bags', 'Watches', 'Jewellery', 'Sunglasses', 'Belts'],
      Beauty: ['Skincare', 'Makeup', 'Fragrances', 'Hair Care'],
    };

    const catColors = { Women: 'FFB6C1', Men: '4682B4', Kids: '66BB6A', Footwear: '8B4513', Accessories: 'DAA520', Beauty: 'DDA0DD' };
    const catMap = {};

    let order = 1;
    for (const [parent, children] of Object.entries(catData)) {
      const parentCat = await Category.create({
        name: parent, slug: slugify(parent),
        image: `https://placehold.co/400x400/${catColors[parent]}/fff?text=${parent}&font=playfair-display`,
        isActive: true, sortOrder: order++,
      });
      catMap[slugify(parent)] = parentCat._id;

      let childOrder = 1;
      for (const child of children) {
        const slug = slugify(`${parent}-${child}`);
        const cat = await Category.create({ name: child, slug, parent: parentCat._id, isActive: true, sortOrder: childOrder++ });
        catMap[slug] = cat._id;
      }
    }
    console.log('Categories seeded');

    // Products
    const products = [
      { name: 'Floral Maxi Dress', cat: 'women-dresses', price: 2499, compare: 3999, stock: 25, featured: true, color: 'FFB6C1', desc: 'Elegant floral print maxi dress perfect for summer outings.' },
      { name: 'Black Bodycon Dress', cat: 'women-dresses', price: 1899, compare: 2499, stock: 18, featured: true, color: '2C2C2C', desc: 'Sophisticated black bodycon dress for evening events.' },
      { name: 'Embroidered Anarkali Suit', cat: 'women-ethnic-wear', price: 3499, compare: 5999, stock: 12, featured: true, color: 'DAA520', desc: 'Beautiful embroidered Anarkali suit with dupatta.' },
      { name: 'Silk Saree - Royal Blue', cat: 'women-ethnic-wear', price: 4999, compare: 7999, stock: 8, featured: true, color: '4169E1', desc: 'Pure silk saree in royal blue with gold zari border.' },
      { name: 'Casual Striped Top', cat: 'women-tops', price: 799, compare: 1299, stock: 40, featured: false, color: 'F0E68C', desc: 'Comfortable striped casual top.' },
      { name: 'Ruffled Blouse', cat: 'women-tops', price: 1199, compare: 1799, stock: 30, featured: false, color: 'DDA0DD', desc: 'Trendy ruffled blouse with elegant neckline.' },
      { name: 'High Waist Skinny Jeans', cat: 'women-jeans', price: 1599, compare: 2199, stock: 35, featured: false, color: '4682B4', desc: 'Classic high waist skinny jeans.' },
      { name: 'Slim Fit Oxford Shirt', cat: 'men-shirts', price: 1299, compare: 1999, stock: 30, featured: true, color: 'F5F5DC', desc: 'Premium cotton Oxford shirt with a slim fit cut.' },
      { name: 'Linen Casual Shirt', cat: 'men-shirts', price: 1499, compare: 2299, stock: 22, featured: false, color: 'D2B48C', desc: 'Breathable linen shirt for summer.' },
      { name: 'Graphic Print T-Shirt', cat: 'men-t-shirts', price: 699, compare: 999, stock: 50, featured: false, color: '20B2AA', desc: 'Cool graphic print t-shirt.' },
      { name: 'Polo T-Shirt - Navy', cat: 'men-t-shirts', price: 899, compare: 1399, stock: 45, featured: true, color: '000080', desc: 'Classic polo t-shirt in navy blue.' },
      { name: 'Blazer - Charcoal Grey', cat: 'men-formal-wear', price: 4999, compare: 7999, stock: 10, featured: true, color: '36454F', desc: 'Tailored charcoal grey blazer.' },
      { name: 'White Leather Sneakers', cat: 'footwear-sneakers', price: 2999, compare: 4499, stock: 15, featured: true, color: 'F5F5F5', desc: 'Classic white leather sneakers.' },
      { name: 'Chelsea Boots - Brown', cat: 'footwear-boots', price: 3999, compare: 5999, stock: 12, featured: true, color: '8B4513', desc: 'Classic brown Chelsea boots.' },
      { name: 'Leather Tote Bag', cat: 'accessories-bags', price: 2499, compare: 3999, stock: 15, featured: true, color: 'A0522D', desc: 'Spacious leather tote bag.' },
      { name: 'Matte Lipstick Set', cat: 'beauty-makeup', price: 1299, compare: 1999, stock: 35, featured: true, color: 'C62828', desc: 'Set of 6 matte lipsticks.' },
    ];

    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['Black', 'White', 'Navy'];

    for (const p of products) {
      const isClothing = p.cat.startsWith('women-') || p.cat.startsWith('men-');
      const isFootwear = p.cat.startsWith('footwear-');
      const fg = ['2C2C2C', '000080', '36454F', '8B4513', 'A0522D', 'C62828', '4169E1', '4682B4'].includes(p.color) ? 'fff' : '333';

      const variants = [];
      if (isClothing) {
        sizes.forEach(size => {
          variants.push({ sku: `VLR-${rand()}-${size}`, size, color: colors[Math.floor(Math.random() * 3)], priceModifier: 0, stock: Math.floor(Math.random() * 12) + 3 });
        });
      } else if (isFootwear) {
        ['UK 7', 'UK 8', 'UK 9', 'UK 10'].forEach(size => {
          variants.push({ sku: `VLR-${rand()}-${size.replace(' ', '')}`, size, priceModifier: 0, stock: Math.floor(Math.random() * 8) + 2 });
        });
      }

      await Product.create({
        name: p.name,
        slug: slugify(p.name) + '-' + rand(),
        description: p.desc,
        category: catMap[p.cat],
        price: p.price,
        comparePrice: p.compare,
        stock: p.stock,
        images: [`https://placehold.co/600x700/${p.color}/${fg}?text=${encodeURIComponent(p.name)}&font=playfair-display`],
        sku: 'VLR-' + rand().toUpperCase(),
        status: 'active',
        featured: p.featured,
        variants,
      });
    }
    console.log('Products seeded (16 products)');

    // Coupons
    const now = new Date();
    await Coupon.create([
      { code: 'VELORIA10', type: 'percent', value: 10, minOrder: 999, usesLeft: 100, expiresAt: new Date(now.setMonth(now.getMonth() + 3)), isActive: true },
      { code: 'FLAT200', type: 'flat', value: 200, minOrder: 1499, usesLeft: 50, expiresAt: new Date(now.setMonth(now.getMonth() + 2)), isActive: true },
      { code: 'WELCOME20', type: 'percent', value: 20, minOrder: 500, usesLeft: 200, expiresAt: new Date(now.setMonth(now.getMonth() + 6)), isActive: true },
    ]);
    console.log('Coupons seeded');

    console.log('\n=== SEED COMPLETE ===');
    console.log('Admin: admin@veloria.com / Admin@123');
    console.log('User:  user@veloria.com / User@123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
