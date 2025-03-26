/**
 * Database Indexing Utility
 * 
 * This module creates indexes on frequently queried fields
 * to improve database query performance.
 */

import { mongoose } from '../mongodb';
import { AudioGear, Case } from '../models/gear-models';

/**
 * Create indexes on frequently queried fields
 * to improve database query performance
 */
export const createIndexes = async (): Promise<void> => {
  try {
    console.log('Creating database indexes for performance optimization...');
    
    // AudioGear indexes
    await AudioGear.collection.createIndex({ brand: 1 });
    await AudioGear.collection.createIndex({ category: 1 });
    await AudioGear.collection.createIndex({ type: 1 });
    await AudioGear.collection.createIndex({ price: 1 });
    await AudioGear.collection.createIndex({ rating: 1 });
    await AudioGear.collection.createIndex({ name: 'text', description: 'text' });
    
    // Compound indexes for common filter combinations
    await AudioGear.collection.createIndex({ brand: 1, category: 1 });
    await AudioGear.collection.createIndex({ category: 1, type: 1 });
    
    // Case indexes
    await Case.collection.createIndex({ brand: 1 });
    await Case.collection.createIndex({ type: 1 });
    await Case.collection.createIndex({ protectionLevel: 1 });
    await Case.collection.createIndex({ price: 1 });
    await Case.collection.createIndex({ rating: 1 });
    await Case.collection.createIndex({ name: 'text', description: 'text' });
    
    // Compound indexes for common filter combinations
    await Case.collection.createIndex({ brand: 1, type: 1 });
    await Case.collection.createIndex({ waterproof: 1, shockproof: 1, dustproof: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
  }
};

export default { createIndexes };
