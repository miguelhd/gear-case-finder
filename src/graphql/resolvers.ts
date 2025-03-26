import mongoose from 'mongoose';
import { AudioGear, Case, GearCaseMatch } from '../lib/models/gear-models';

// Define GraphQL resolvers
export const resolvers = {
  Query: {
    // Simple query to check if the API is working
    __typename: () => 'Query',
    
    // Get all gear with pagination
    allGear: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        const [result] = await AudioGear.aggregate([
          {
            $facet: {
              items: [
                { $skip: skip },
                { $limit: limit }
              ],
              total: [
                { $count: 'count' }
              ]
            }
          }
        ]);
        
        const total = result.total[0]?.count || 0;
        const pages = Math.ceil(total / limit);
        
        return {
          items: result.items,
          pagination: {
            total,
            page,
            limit,
            pages
          }
        };
      } catch (error) {
        console.error('Error in allGear resolver:', error);
        throw new Error('Failed to fetch gear items');
      }
    },
    
    // Get gear by ID
    gear: async (_, { id }) => {
      try {
        return await AudioGear.findById(id);
      } catch (error) {
        console.error(`Error in gear resolver for ID ${id}:`, error);
        throw new Error(`Failed to fetch gear with ID ${id}`);
      }
    },
    
    // Filter gear with pagination
    filterGear: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Build query based on filter
        const query: any = {};
        
        if (filter.search) {
          query.$or = [
            { name: { $regex: filter.search, $options: 'i' } },
            { brand: { $regex: filter.search, $options: 'i' } },
            { description: { $regex: filter.search, $options: 'i' } }
          ];
        }
        
        if (filter.categories && filter.categories.length > 0) {
          query.category = { $in: filter.categories };
        }
        
        if (filter.brands && filter.brands.length > 0) {
          query.brand = { $in: filter.brands };
        }
        
        if (filter.types && filter.types.length > 0) {
          query.type = { $in: filter.types };
        }
        
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
          query.price = {};
          if (filter.minPrice !== undefined) {
            query.price.$gte = filter.minPrice;
          }
          if (filter.maxPrice !== undefined) {
            query.price.$lte = filter.maxPrice;
          }
        }
        
        if (filter.minRating !== undefined) {
          query.rating = { $gte: filter.minRating };
        }
        
        if (filter.inStock !== undefined) {
          query.inStock = filter.inStock;
        }
        
        // Determine sort order
        let sortField = 'name';
        let sortOrder: 1 | -1 = 1;
        
        if (filter.sortBy) {
          sortField = filter.sortBy;
          sortOrder = filter.sortDirection === 'desc' ? -1 : 1;
        }
        
        const sortOptions: Record<string, 1 | -1> = {};
        sortOptions[sortField] = sortOrder;
        
        // Execute query with aggregation
        const [result] = await AudioGear.aggregate([
          { $match: query },
          {
            $facet: {
              items: [
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: limit }
              ],
              total: [
                { $count: 'count' }
              ]
            }
          }
        ]);
        
        const total = result.total[0]?.count || 0;
        const pages = Math.ceil(total / limit);
        
        return {
          items: result.items,
          pagination: {
            total,
            page,
            limit,
            pages
          }
        };
      } catch (error) {
        console.error('Error in filterGear resolver:', error);
        throw new Error('Failed to filter gear items');
      }
    },
    
    // Get all cases with pagination
    allCases: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        const [result] = await Case.aggregate([
          {
            $facet: {
              items: [
                { $skip: skip },
                { $limit: limit }
              ],
              total: [
                { $count: 'count' }
              ]
            }
          }
        ]);
        
        const total = result.total[0]?.count || 0;
        const pages = Math.ceil(total / limit);
        
        return {
          items: result.items,
          pagination: {
            total,
            page,
            limit,
            pages
          }
        };
      } catch (error) {
        console.error('Error in allCases resolver:', error);
        throw new Error('Failed to fetch case items');
      }
    },
    
    // Get case by ID
    case: async (_, { id }) => {
      try {
        return await Case.findById(id);
      } catch (error) {
        console.error(`Error in case resolver for ID ${id}:`, error);
        throw new Error(`Failed to fetch case with ID ${id}`);
      }
    },
    
    // Filter cases with pagination
    filterCases: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Build query based on filter
        const query: any = {};
        
        if (filter.search) {
          query.$or = [
            { name: { $regex: filter.search, $options: 'i' } },
            { brand: { $regex: filter.search, $options: 'i' } },
            { description: { $regex: filter.search, $options: 'i' } }
          ];
        }
        
        if (filter.brands && filter.brands.length > 0) {
          query.brand = { $in: filter.brands };
        }
        
        if (filter.types && filter.types.length > 0) {
          query.type = { $in: filter.types };
        }
        
        if (filter.protectionLevels && filter.protectionLevels.length > 0) {
          query.protectionLevel = { $in: filter.protectionLevels };
        }
        
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
          query.price = {};
          if (filter.minPrice !== undefined) {
            query.price.$gte = filter.minPrice;
          }
          if (filter.maxPrice !== undefined) {
            query.price.$lte = filter.maxPrice;
          }
        }
        
        if (filter.minRating !== undefined) {
          query.rating = { $gte: filter.minRating };
        }
        
        if (filter.inStock !== undefined) {
          query.inStock = filter.inStock;
        }
        
        // Determine sort order
        let sortField = 'name';
        let sortOrder: 1 | -1 = 1;
        
        if (filter.sortBy) {
          sortField = filter.sortBy;
          sortOrder = filter.sortDirection === 'desc' ? -1 : 1;
        }
        
        const sortOptions: Record<string, 1 | -1> = {};
        sortOptions[sortField] = sortOrder;
        
        // Execute query with aggregation
        const [result] = await Case.aggregate([
          { $match: query },
          {
            $facet: {
              items: [
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: limit }
              ],
              total: [
                { $count: 'count' }
              ]
            }
          }
        ]);
        
        const total = result.total[0]?.count || 0;
        const pages = Math.ceil(total / limit);
        
        return {
          items: result.items,
          pagination: {
            total,
            page,
            limit,
            pages
          }
        };
      } catch (error) {
        console.error('Error in filterCases resolver:', error);
        throw new Error('Failed to filter case items');
      }
    },
    
    // Get matches between gear and cases
    matches: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Build query based on filter
        const query: any = {};
        
        if (filter.gearId) {
          query.gearId = filter.gearId;
        }
        
        if (filter.caseId) {
          query.caseId = filter.caseId;
        }
        
        if (filter.minScore !== undefined) {
          query.compatibilityScore = { $gte: filter.minScore };
        }
        
        // Determine sort order
        let sortField = 'compatibilityScore';
        let sortOrder: 1 | -1 = -1; // Default to highest score first
        
        if (filter.sortBy) {
          sortField = filter.sortBy;
          sortOrder = filter.sortDirection === 'desc' ? -1 : 1;
        }
        
        const sortOptions: Record<string, 1 | -1> = {};
        sortOptions[sortField] = sortOrder;
        
        // Execute query with aggregation
        const [result] = await GearCaseMatch.aggregate([
          { $match: query },
          {
            $facet: {
              items: [
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: limit }
              ],
              total: [
                { $count: 'count' }
              ]
            }
          }
        ]);
        
        const total = result.total[0]?.count || 0;
        const pages = Math.ceil(total / limit);
        
        // Populate gear and case data
        const populatedItems = await GearCaseMatch.populate(result.items, [
          { path: 'gear', model: AudioGear },
          { path: 'case', model: Case }
        ]);
        
        return {
          items: populatedItems,
          pagination: {
            total,
            page,
            limit,
            pages
          }
        };
      } catch (error) {
        console.error('Error in matches resolver:', error);
        throw new Error('Failed to fetch matches');
      }
    },
    
    // Get matches for specific gear
    matchesForGear: async (_, { gearId, pagination = { page: 1, limit: 10 } }) => {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Execute query with aggregation
        const [result] = await GearCaseMatch.aggregate([
          { $match: { gearId } },
          {
            $facet: {
              items: [
                { $sort: { compatibilityScore: -1 } },
                { $skip: skip },
                { $limit: limit }
              ],
              total: [
                { $count: 'count' }
              ]
            }
          }
        ]);
        
        const total = result.total[0]?.count || 0;
        const pages = Math.ceil(total / limit);
        
        // Populate gear and case data
        const populatedItems = await GearCaseMatch.populate(result.items, [
          { path: 'gear', model: AudioGear },
          { path: 'case', model: Case }
        ]);
        
        return {
          items: populatedItems,
          pagination: {
            total,
            page,
            limit,
            pages
          }
        };
      } catch (error) {
        console.error(`Error in matchesForGear resolver for gearId ${gearId}:`, error);
        throw new Error(`Failed to fetch matches for gear with ID ${gearId}`);
      }
    },
    
    // Get matches for specific case
    matchesForCase: async (_, { caseId, pagination = { page: 1, limit: 10 } }) => {
      try {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Execute query with aggregation
        const [result] = await GearCaseMatch.aggregate([
          { $match: { caseId } },
          {
            $facet: {
              items: [
                { $sort: { compatibilityScore: -1 } },
                { $skip: skip },
                { $limit: limit }
              ],
              total: [
                { $count: 'count' }
              ]
            }
          }
        ]);
        
        const total = result.total[0]?.count || 0;
        const pages = Math.ceil(total / limit);
        
        // Populate gear and case data
        const populatedItems = await GearCaseMatch.populate(result.items, [
          { path: 'gear', model: AudioGear },
          { path: 'case', model: Case }
        ]);
        
        return {
          items: populatedItems,
          pagination: {
            total,
            page,
            limit,
            pages
          }
        };
      } catch (error) {
        console.error(`Error in matchesForCase resolver for caseId ${caseId}:`, error);
        throw new Error(`Failed to fetch matches for case with ID ${caseId}`);
      }
    },
    
    // Get a specific match
    match: async (_, { id }) => {
      try {
        const match = await GearCaseMatch.findById(id)
          .populate('gear')
          .populate('case');
        return match;
      } catch (error) {
        console.error(`Error in match resolver for ID ${id}:`, error);
        throw new Error(`Failed to fetch match with ID ${id}`);
      }
    }
  }
};
