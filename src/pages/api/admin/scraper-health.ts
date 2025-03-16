import { NextApiRequest, NextApiResponse } from 'next';
import { getScraperHealth } from '../../../lib/monitoring';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const health = getScraperHealth();
    res.status(200).json(health);
  } catch (error) {
    console.error('Error fetching scraper health:', error);
    res.status(500).json({ message: 'Failed to fetch scraper health' });
  }
}
