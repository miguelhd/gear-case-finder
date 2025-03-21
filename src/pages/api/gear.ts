import { NextApiRequest, NextApiResponse } from 'next';
import { clientPromise, mongoose } from '../../lib/mongodb';
import { AudioGear } from '../../lib/models/gear-models';
import { ProductMatcher } from '../../lib/matching/product-matcher';
import { FeatureMatcher } from '../../lib/matching/feature-matcher';
import { RecommendationEngine } from '../../lib/matching/recommendation-engine';

// Initialize the product matcher
const productMatcher = new ProductMatcher();
const featureMatcher = new FeatureMatcher();
const recommendationEngine = new RecommendationEngine();

/**
 * API handler for gear-related endpoints
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Database connection is already established in the mongodb.ts file
    // No need to explicitly connect here
    
    // Route based on HTTP method
    switch (req.method) {
      case 'GET':
        return handleGetRequest(req, res);
      case 'POST':
        return handlePostRequest(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle GET requests
 */
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { action, id, query, category, brand, limit = '20' } = req.query;
  
  switch (action) {
    case 'all':
      // Get all gear with optional filtering
      const allGear = await AudioGear.find({
        ...(category ? { category } : {}),
        ...(brand ? { brand } : {})
      }).limit(parseInt(limit as string));
      
      return res.status(200).json(allGear);
      
    case 'search':
      // Search for gear by name, brand, or type
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const searchResults = await AudioGear.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { type: { $regex: query, $options: 'i' } }
        ]
      }).limit(parseInt(limit as string));
      
      return res.status(200).json(searchResults);
      
    case 'detail':
      // Get details for a specific gear item
      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
      }
      
      const gearDetail = await AudioGear.findById(id);
      
      if (!gearDetail) {
        return res.status(404).json({ error: 'Gear not found' });
      }
      
      return res.status(200).json(gearDetail);
      
    case 'categories':
      // Get all unique categories
      const categories = await AudioGear.distinct('category');
      return res.status(200).json(categories);
      
    case 'brands':
      // Get all unique brands
      const brands = await AudioGear.distinct('brand');
      return res.status(200).json(brands);
      
    case 'popular':
      // Get popular gear items
      const popularGear = await AudioGear.find()
        .sort({ popularity: -1 })
        .limit(parseInt(limit as string));
      
      return res.status(200).json(popularGear);
      
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

/**
 * Handle POST requests
 */
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;
  
  switch (action) {
    case 'find-cases':
      // Find compatible cases for a gear item
      const { gearId, options } = req.body;
      
      if (!gearId) {
        return res.status(400).json({ error: 'gearId is required' });
      }
      
      try {
        const compatibleCases = await productMatcher.findCompatibleCases(gearId, options);
        return res.status(200).json(compatibleCases);
      } catch (error) {
        console.error('Error finding compatible cases:', error);
        return res.status(500).json({ error: 'Error finding compatible cases' });
      }
      
    case 'recommend-alternatives':
      // Recommend alternative cases
      const { gearId: gId, caseId, recommendationOptions } = req.body;
      
      if (!gId || !caseId) {
        return res.status(400).json({ error: 'gearId and caseId are required' });
      }
      
      try {
        const gear = await AudioGear.findById(gId);
        if (!gear) {
          return res.status(404).json({ error: 'Gear not found' });
        }
        
        const Case = require('../../lib/models/gear-models').Case;
        const caseItem = await Case.findById(caseId);
        if (!caseItem) {
          return res.status(404).json({ error: 'Case not found' });
        }
        
        const alternatives = await recommendationEngine.generateAlternativeRecommendations(
          gear,
          caseItem,
          recommendationOptions
        );
        
        return res.status(200).json(alternatives);
      } catch (error) {
        console.error('Error recommending alternatives:', error);
        return res.status(500).json({ error: 'Error recommending alternatives' });
      }
      
    case 'add-gear':
      // Add a new gear item (admin only)
      // In a real app, this would have authentication
      const newGear = req.body;
      
      try {
        const createdGear = await AudioGear.create(newGear);
        return res.status(201).json(createdGear);
      } catch (error) {
        console.error('Error adding gear:', error);
        return res.status(500).json({ error: 'Error adding gear' });
      }
      
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}
