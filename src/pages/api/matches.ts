import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../lib/mongodb';
import { GearCaseMatch } from '../../lib/models/gear-models';
import { FeedbackManager } from '../../lib/matching/feedback-manager';

// Initialize the feedback manager
const feedbackManager = new FeedbackManager();

/**
 * API handler for match-related endpoints
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to the database
    await connectToMongoDB();
    
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
  const { action, gearId, caseId, limit = '10' } = req.query;
  
  switch (action) {
    case 'popular-matches':
      // Get popular matches
      const popularMatches = await GearCaseMatch.find()
        .sort({ compatibilityScore: -1 })
        .limit(parseInt(limit as string))
        .populate('gearId')
        .populate('caseId');
      
      return res.status(200).json(popularMatches);
      
    case 'gear-matches':
      // Get matches for a specific gear
      if (!gearId) {
        return res.status(400).json({ error: 'gearId parameter is required' });
      }
      
      const gearMatches = await GearCaseMatch.find({ gearId })
        .sort({ compatibilityScore: -1 })
        .limit(parseInt(limit as string))
        .populate('gearId')
        .populate('caseId');
      
      return res.status(200).json(gearMatches);
      
    case 'case-matches':
      // Get matches for a specific case
      if (!caseId) {
        return res.status(400).json({ error: 'caseId parameter is required' });
      }
      
      const caseMatches = await GearCaseMatch.find({ caseId })
        .sort({ compatibilityScore: -1 })
        .limit(parseInt(limit as string))
        .populate('gearId')
        .populate('caseId');
      
      return res.status(200).json(caseMatches);
      
    case 'match-detail':
      // Get details for a specific match
      if (!gearId || !caseId) {
        return res.status(400).json({ error: 'gearId and caseId parameters are required' });
      }
      
      const matchDetail = await GearCaseMatch.findOne({ gearId, caseId })
        .populate('gearId')
        .populate('caseId');
      
      if (!matchDetail) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      return res.status(200).json(matchDetail);
      
    case 'feedback':
      // Get feedback for a specific match
      if (!gearId || !caseId) {
        return res.status(400).json({ error: 'gearId and caseId parameters are required' });
      }
      
      const feedback = await feedbackManager.getFeedbackForMatch(gearId as string, caseId as string);
      const averageRating = await feedbackManager.getAverageRatingForMatch(gearId as string, caseId as string);
      
      return res.status(200).json({ feedback, averageRating });
      
    case 'top-rated':
      // Get top-rated matches for a gear
      if (!gearId) {
        return res.status(400).json({ error: 'gearId parameter is required' });
      }
      
      const topRated = await feedbackManager.getTopRatedMatchesForGear(gearId as string, parseInt(limit as string));
      
      return res.status(200).json(topRated);
      
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
    case 'submit-feedback':
      // Submit feedback for a match
      const feedbackData = req.body;
      
      if (!feedbackData.gearId || !feedbackData.caseId || !feedbackData.rating) {
        return res.status(400).json({ error: 'gearId, caseId, and rating are required' });
      }
      
      try {
        const feedback = await feedbackManager.submitFeedback(feedbackData);
        return res.status(201).json(feedback);
      } catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({ error: 'Error submitting feedback' });
      }
      
    case 'create-match':
      // Create a new match (usually done automatically by the algorithm)
      const matchData = req.body;
      
      if (!matchData.gearId || !matchData.caseId) {
        return res.status(400).json({ error: 'gearId and caseId are required' });
      }
      
      try {
        // Check if match already exists
        const existingMatch = await GearCaseMatch.findOne({
          gearId: matchData.gearId,
          caseId: matchData.caseId
        });
        
        if (existingMatch) {
          return res.status(409).json({ error: 'Match already exists', match: existingMatch });
        }
        
        // Create new match
        const newMatch = await GearCaseMatch.create(matchData);
        return res.status(201).json(newMatch);
      } catch (error) {
        console.error('Error creating match:', error);
        return res.status(500).json({ error: 'Error creating match' });
      }
      
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}