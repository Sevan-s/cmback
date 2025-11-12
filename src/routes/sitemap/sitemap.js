const express = require('express');
const { SitemapStream, streamToPromise } = require('sitemap');
const Product = require('../../models/product');

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const SITE_URL = 'https://www.cousumouche.fr';

    const staticRoutes = [
      '/',
      '/boutique',
      '/a-propos',
      '/contact',
      '/mentions-legales',
      '/conditions-generales',
    ];

    const products = await Product.find({}, 'slug updatedAt').lean();
    const productUrls = products.map((p) => ({
      url: `/produit/${p.slug}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmodISO: p.updatedAt?.toISOString?.(),
    }));

    const urls = [
      ...staticRoutes.map((u) => ({
        url: u,
        changefreq: 'weekly',
        priority: u === '/' ? 1.0 : 0.7,
      })),
      ...productUrls,
    ];

    const smStream = new SitemapStream({ hostname: SITE_URL });
    urls.forEach((u) => smStream.write(u));
    smStream.end();

    const xml = await streamToPromise(smStream).then((d) => d.toString());
    res.header('Content-Type', 'application/xml').status(200).send(xml);
  } catch (e) {
    console.error('Erreur génération sitemap:', e);
    res.status(500).send('Erreur génération sitemap');
  }
});

module.exports = router;