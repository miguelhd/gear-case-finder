import { NextApiRequest, NextApiResponse } from 'next';
import { getCacheStats } from '../../../lib/cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const stats = getCacheStats();
    
    // Add some mock data for the admin dashboard
    const enhancedStats = {
      ...stats,
      totalRequests: 1250,
      hits: 875,
      misses: 375,
      avgCachedResponseTime: 12,
      avgUncachedResponseTime: 187,
      entriesByType: [
        { type: 'search:gear', count: 125, hitRate: 0.82, avgTtl: 300000 },
        { type: 'search:cases', count: 98, hitRate: 0.79, avgTtl: 300000 },
        { type: 'search:compatible-cases', count: 156, hitRate: 0.88, avgTtl: 300000 },
        { type: 'filter:options', count: 12, hitRate: 0.95, avgTtl: 3600000 }
      ]
    };
    
    res.status(200).json(enhancedStats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({ message: 'Failed to fetch cache statistics' });
  }
}
