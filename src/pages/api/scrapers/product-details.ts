import { NextApiRequest, NextApiResponse } from 'next';
import { getProductDetails, ensureDirectories } from '../../../lib/vercel-compatible-scrapers';

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

    // Get product details
    const productDetails = await getProductDetails(marketplace, productId);
    
    if (!productDetails) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      marketplace,
      productId,
      product: productDetails 
    });
  } catch (error: any) {
    console.error('Error in product details API:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error?.message || 'Unknown error occurred' 
    });
  }
}
