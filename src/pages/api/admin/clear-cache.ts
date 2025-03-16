import { NextApiRequest, NextApiResponse } from 'next';
import { clearCache } from '../../../lib/cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    clearCache();
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ message: 'Failed to clear cache' });
  }
}
