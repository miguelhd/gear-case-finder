import { NextApiRequest, NextApiResponse } from 'next';
import { getScraperManager, ensureDirectories } from '../../../lib/vercel-compatible-scrapers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure directories exist
    await ensureDirectories();

    // Get the query parameters
    const { query, marketplace, page = 1 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Get the scraper manager
    const scraperManager = getScraperManager();

    // If marketplace is specified, use that specific scraper
    if (marketplace) {
      const scraper = scraperManager.getScraper(marketplace);
      if (!scraper) {
        return res.status(400).json({ error: `Scraper for marketplace '${marketplace}' not found` });
      }

      // Search for products in the specified marketplace
      const results = await scraper.searchProducts(query, { page: Number(page) });
      
      // Process the results (normalize, download images, save to database)
      const processedResults = await scraperManager.processResults(results);
      
      return res.status(200).json({ 
        success: true, 
        marketplace,
        query,
        page,
        count: processedResults.length,
        results: processedResults 
      });
    } else {
      // Search across all marketplaces
      const results = await scraperManager.searchAllMarketplaces(query, { page: Number(page) });
      
      return res.status(200).json({ 
        success: true, 
        query,
        page,
        count: results.length,
        results 
      });
    }
  } catch (error) {
    console.error('Error in search API:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
