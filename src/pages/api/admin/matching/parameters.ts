import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../../lib/mongodb';
import { GearCaseMatch } from '../../../../lib/models/gear-models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Route based on HTTP method
    switch (req.method) {
      case 'GET':
        return handleGetRequest(req, res);
      case 'POST':
        return handlePostRequest(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in matching parameters API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Handle GET requests to retrieve current algorithm parameters
 */
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real implementation, these would be stored in the database
    // For now, we'll return default values
    const parameters = [
      {
        id: 'dimensionWeight',
        name: 'Dimension Weight',
        description: 'Weight given to dimensional fit in the matching algorithm',
        value: 0.4
      },
      {
        id: 'protectionWeight',
        name: 'Protection Weight',
        description: 'Weight given to protection level in the matching algorithm',
        value: 0.25
      },
      {
        id: 'featureWeight',
        name: 'Feature Weight',
        description: 'Weight given to feature compatibility in the matching algorithm',
        value: 0.2
      },
      {
        id: 'ratingWeight',
        name: 'Rating Weight',
        description: 'Weight given to user ratings in the matching algorithm',
        value: 0.15
      },
      {
        id: 'dimensionThreshold',
        name: 'Dimension Threshold',
        description: 'Minimum percentage of space that gear should occupy in a case',
        value: 70
      },
      {
        id: 'confidenceThreshold',
        name: 'Confidence Threshold',
        description: 'Minimum confidence score required for a match to be considered valid',
        value: 60
      }
    ];
    
    return res.status(200).json({ parameters });
  } catch (error) {
    console.error('Error retrieving algorithm parameters:', error);
    return res.status(500).json({ message: 'Failed to retrieve algorithm parameters' });
  }
}

/**
 * Handle POST requests to update algorithm parameters
 */
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const { parameters } = req.body;
  
  if (!parameters || !Array.isArray(parameters)) {
    return res.status(400).json({ message: 'Invalid parameters format' });
  }
  
  try {
    // In a real implementation, these would be stored in the database
    // For now, we'll just log them and return success
    console.log('Updating algorithm parameters:', parameters);
    
    // Validate that weights sum to 1.0
    const weights = parameters.filter(p => 
      ['dimensionWeight', 'protectionWeight', 'featureWeight', 'ratingWeight'].includes(p.id)
    );
    
    const totalWeight = weights.reduce((sum, param) => sum + param.value, 0);
    
    if (Math.abs(totalWeight - 1) > 0.001) {
      return res.status(400).json({ 
        message: 'Weight parameters must sum to 1.0',
        totalWeight
      });
    }
    
    return res.status(200).json({ 
      message: 'Algorithm parameters updated successfully',
      parameters
    });
  } catch (error) {
    console.error('Error updating algorithm parameters:', error);
    return res.status(500).json({ message: 'Failed to update algorithm parameters' });
  }
}
