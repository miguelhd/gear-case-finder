import { IAudioGear, ICase, GearCaseMatch } from '../models/gear-models';
import mongoose from 'mongoose';

export interface UserFeedback {
  userId?: string;
  gearId: string;
  caseId: string;
  rating: number; // 1-5 scale
  comments?: string;
  fitAccuracy?: number; // 1-5 scale
  protectionQuality?: number; // 1-5 scale
  valueForMoney?: number; // 1-5 scale
  actuallyPurchased?: boolean;
  createdAt: Date;
}

// Schema for user feedback
const UserFeedbackSchema = new mongoose.Schema({
  userId: { type: String },
  gearId: { type: String, required: true, index: true },
  caseId: { type: String, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String },
  fitAccuracy: { type: Number, min: 1, max: 5 },
  protectionQuality: { type: Number, min: 1, max: 5 },
  valueForMoney: { type: Number, min: 1, max: 5 },
  actuallyPurchased: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create compound index for gear and case
UserFeedbackSchema.index({ gearId: 1, caseId: 1 });

// Create the model
let UserFeedbackModel;
try {
  UserFeedbackModel = mongoose.model<UserFeedback & mongoose.Document>('UserFeedback');
} catch (error) {
  UserFeedbackModel = mongoose.model<UserFeedback & mongoose.Document>('UserFeedback', UserFeedbackSchema);
}

export class FeedbackManager {
  /**
   * Submit user feedback for a gear-case match
   */
  async submitFeedback(feedback: UserFeedback): Promise<UserFeedback> {
    const newFeedback = new UserFeedbackModel({
      ...feedback,
      createdAt: new Date()
    });
    
    await newFeedback.save();
    
    // Update the match confidence based on feedback
    await this.updateMatchConfidence(feedback.gearId, feedback.caseId, feedback.rating);
    
    return newFeedback;
  }
  
  /**
   * Get all feedback for a specific gear-case match
   */
  async getFeedbackForMatch(gearId: string, caseId: string): Promise<UserFeedback[]> {
    return UserFeedbackModel.find({ gearId, caseId }).sort({ createdAt: -1 });
  }
  
  /**
   * Get average rating for a specific gear-case match
   */
  async getAverageRatingForMatch(gearId: string, caseId: string): Promise<number | null> {
    const result = await UserFeedbackModel.aggregate([
      { $match: { gearId, caseId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0].averageRating;
  }
  
  /**
   * Update match confidence based on user feedback
   */
  private async updateMatchConfidence(gearId: string, caseId: string, rating: number): Promise<void> {
    // Find the match in the database
    const match = await GearCaseMatch.findOne({
      gearId: new mongoose.Types.ObjectId(gearId),
      caseId: new mongoose.Types.ObjectId(caseId)
    });
    
    if (!match) {
      // Create a new match if it doesn't exist
      const newMatch = new GearCaseMatch({
        gearId: new mongoose.Types.ObjectId(gearId),
        caseId: new mongoose.Types.ObjectId(caseId),
        compatibilityScore: rating * 20, // Convert 1-5 rating to 20-100 score
        dimensionFit: {
          length: 80, // Default values
          width: 80,
          height: 80,
          overall: 80
        },
        priceCategory: 'mid-range', // Default value
        protectionLevel: 'medium', // Default value
        features: [] as string[]
      });
      
      await newMatch.save();
      return;
    }
    
    // Get all feedback for this match
    const allFeedback = await this.getFeedbackForMatch(gearId, caseId);
    
    if (allFeedback.length === 0) {
      return;
    }
    
    // Calculate average rating
    const totalRating = allFeedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / allFeedback.length;
    
    // Adjust compatibility score based on feedback
    // We'll use a weighted average: 70% algorithm score, 30% user feedback
    const adjustedScore = (match.compatibilityScore * 0.7) + (averageRating * 20 * 0.3);
    
    // Update the match
    await GearCaseMatch.updateOne(
      { _id: match._id },
      { $set: { compatibilityScore: Math.round(adjustedScore) } }
    );
  }
  
  /**
   * Get top-rated matches for a specific gear
   */
  async getTopRatedMatchesForGear(gearId: string, limit: number = 5): Promise<any[]> {
    // Get all feedback for this gear
    const feedback = await UserFeedbackModel.aggregate([
      { $match: { gearId } },
      { $group: { 
        _id: '$caseId', 
        averageRating: { $avg: '$rating' },
        feedbackCount: { $sum: 1 }
      }},
      { $sort: { averageRating: -1, feedbackCount: -1 } },
      { $limit: limit }
    ]);
    
    // Get case details for each match
    const Case = mongoose.model<ICase>('Case');
    const results: Array<{
      case: ICase;
      averageRating: number;
      feedbackCount: number;
    }> = [];
    
    for (const item of feedback) {
      const caseItem = await Case.findById(item._id);
      if (caseItem) {
        results.push({
          case: caseItem,
          averageRating: item.averageRating,
          feedbackCount: item.feedbackCount
        });
      }
    }
    
    return results;
  }
  
  /**
   * Get feedback statistics
   */
  async getFeedbackStatistics(): Promise<any> {
    const totalFeedback = await UserFeedbackModel.countDocuments();
    
    const averageRating = await UserFeedbackModel.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);
    
    const ratingDistribution = await UserFeedbackModel.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const purchaseRate = await UserFeedbackModel.aggregate([
      { $group: { 
        _id: null, 
        purchased: { 
          $sum: { $cond: [{ $eq: ['$actuallyPurchased', true] }, 1, 0] } 
        },
        total: { $sum: 1 }
      }}
    ]);
    
    return {
      totalFeedback,
      averageRating: averageRating.length > 0 ? averageRating[0].average : 0,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item._id,
        count: item.count
      })),
      purchaseRate: purchaseRate.length > 0 ? 
        (purchaseRate[0].purchased / purchaseRate[0].total) * 100 : 0
    };
  }
}
