import { NextApiRequest, NextApiResponse } from 'next';
import { getScraperManager, ensureDirectories, getMongoDBIntegration } from '../../../lib/vercel-compatible-scrapers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure directories exist
    await ensureDirectories();

    // Get the query parameters
    const { marketplace, productId } = req.body;

    if (!marketplace || !productId) {
      return res.status(400).json({ error: 'Marketplace and productId parameters are required' });
    }

    // Get the scraper manager
    const scraperManager = getScraperManager();

    // Get the specific scraper
    const scraper = scraperManager.getScraper(marketplace);
    if (!scraper) {
      return res.status(400).json({ error: `Scraper for marketplace '${marketplace}' not found` });
    }

    // Get product details
    const productDetails = await scraperManager.getProductDetails(marketplace, productId);
    
    if (!productDetails) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      marketplace,
      productId,
      product: productDetails 
    });
  } catch (error) {
    console.error('Error in product details API:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
