/**
 * Database Query Optimization Utility
 * 
 * This module provides optimized database query functions
 * to improve performance and prevent timeouts.
 */

import { mongoose } from '../mongodb';
import { AudioGear, Case } from '../models/gear-models';
import { Document, FilterQuery, Model } from 'mongoose';

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Interface for pagination result
 */
export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Interface for search result with pagination
 */
export interface SearchResult<T> {
  items: T[];
  pagination: PaginationResult;
}

/**
 * Type for MongoDB sort values
 */
type MongoSortValue = 1 | -1;

/**
 * Interface for MongoDB sort object
 */
interface MongoSort {
  [key: string]: MongoSortValue;
}

/**
 * Optimized function to find documents with pagination and count in a single operation
 * This reduces database round trips by using MongoDB's facet aggregation
 * 
 * @param model Mongoose model
 * @param query Filter query
 * @param sort Sort options
 * @param pagination Pagination parameters
 * @param projection Fields to include/exclude
 * @returns Search result with items and pagination info
 */
export const findWithPagination = async <T extends Document>(
  model: Model<T>,
  query: FilterQuery<T> = {},
  sort: MongoSort = { _id: 1 },
  pagination: PaginationParams = { page: 1, limit: 10 },
  projection: any = {}
): Promise<SearchResult<T>> => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  
  // Set a reasonable maximum limit to prevent excessive memory usage
  const safeLimit = Math.min(limit, 100);
  
  try {
    // Use aggregation with facet to get items and count in a single query
    const result = await model.aggregate([
      { $match: query },
      {
        $facet: {
          // Get paginated items
          items: [
            { $sort: sort },
            { $skip: skip },
            { $limit: safeLimit },
            // If projection is not empty, add a project stage
            ...(Object.keys(projection).length > 0 ? [{ $project: projection }] : [])
          ],
          // Get total count
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]).exec();
    
    // Extract results
    const items = result[0].items;
    const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
    const totalPages = Math.ceil(totalCount / safeLimit);
    
    return {
      items,
      pagination: {
        total: totalCount,
        page,
        limit: safeLimit,
        pages: totalPages
      }
    };
  } catch (error) {
    console.error('Error in findWithPagination:', error);
    
    // Return empty result on error
    return {
      items: [],
      pagination: {
        total: 0,
        page,
        limit: safeLimit,
        pages: 0
      }
    };
  }
};

/**
 * Optimized function to find AudioGear with pagination
 */
export const findGearWithPagination = async (
  query: FilterQuery<any> = {},
  sort: MongoSort = { name: 1 },
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<SearchResult<any>> => {
  return findWithPagination(AudioGear, query, sort, pagination);
};

/**
 * Optimized function to find Cases with pagination
 */
export const findCasesWithPagination = async (
  query: FilterQuery<any> = {},
  sort: MongoSort = { name: 1 },
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<SearchResult<any>> => {
  return findWithPagination(Case, query, sort, pagination);
};

/**
 * Convert SortOrder string to MongoDB sort value
 */
export const convertSortOrder = (field: string, direction: 'asc' | 'desc' | string = 'asc'): MongoSort => {
  const sort: MongoSort = {};
  sort[field] = direction === 'desc' ? -1 : 1;
  return sort;
};

export default {
  findWithPagination,
  findGearWithPagination,
  findCasesWithPagination,
  convertSortOrder
};
