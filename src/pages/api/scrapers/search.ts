import { NextApiRequest, NextApiResponse } from 'next';
import { searchProducts, ensureDirectories } from '../../../lib/vercel-compatible-scrapers';

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

    // Search for products
    const results = await searchProducts(query, marketplace);
    
    return res.status(200).json({ 
      success: true, 
      marketplace: marketplace || 'all',
      query,
      page,
      count: results.length,
      results 
    });
  } catch (error: any) {
    console.error('Error in search API:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error?.message || 'Unknown error occurred' 
    });
  }
}
