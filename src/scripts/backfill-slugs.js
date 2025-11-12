require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product'); // <-- bon chemin

function slugify(str) {
  return str.toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Product.find({}, 'slug').lean();
    const used = new Set(existing.filter(p => p.slug).map(p => p.slug));

    const toFix = await Product.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }]
    }, 'name').lean();

    for (const p of toFix) {
      const base = slugify(p.name || `prod-${String(p._id).slice(-6)}`);
      let candidate = base;
      let i = 2;
      while (used.has(candidate)) {
        candidate = `${base}-${i++}`;
      }
      await Product.updateOne({ _id: p._id }, { $set: { slug: candidate } });
      used.add(candidate);
      console.log(`✅ ${p.name} → ${candidate}`);
    }

    await mongoose.disconnect();
    console.log('Terminé.');
  } catch (e) {
    console.error('Backfill error:', e);
    process.exit(1);
  }
})();