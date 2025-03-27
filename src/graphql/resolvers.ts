// Enhanced GraphQL resolvers with improved MongoDB connection handling
import mongoose from 'mongoose';
import { AudioGear, Case, GearCaseMatch } from '../lib/models/gear-models';
import { connectToMongoDB, collectionExists } from '../lib/mongodb';

// Define interface for GearCaseMatch document from MongoDB
interface IGearCaseMatchDocument {
  _id: string;
  gearId: string;
  caseId: string;
  compatibilityScore: number;
  dimensionScore: number;
  featureScore: number;
  userFeedbackScore: number;
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to map MongoDB _id to GraphQL id
const mapIdField = (doc: any) => {
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString()
  };
};

// Define GraphQL resolvers
export const resolvers = {
  Query: {
    // Simple query to check if the API is working
    apiStatus: async () => {
      console.log('API status check - MongoDB connection state:', mongoose.connection.readyState);
      try {
        await connectToMongoDB();
        return 'API is operational and database is connected';
      } catch (error) {
        console.error('API status check - Database connection error:', error);
        return 'API is operational but database connection failed';
      }
    },
    
    // Get all gear with pagination
    allGear: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        console.log('Executing allGear query with pagination:', pagination);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        // Check if collection exists using the safe method
        const exists = await collectionExists(AudioGear.collection.name);
        if (!exists) {
          console.error(`${AudioGear.collection.name} collection does not exist in the database`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
        const count = await AudioGear.countDocuments();
        console.log(`${AudioGear.collection.name} collection has ${count} documents`);
        
        if (count === 0) {
          console.warn(`${AudioGear.collection.name} collection is empty`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Use find instead of aggregate for simpler debugging
        const items = await AudioGear.find()
          .skip(skip)
          .limit(limit)
          .lean()
          .then(docs => docs.map(mapIdField));
        
        console.log(`Retrieved ${items.length} gear items`);
        
        return {
          items,
          pagination: {
            total: count,
            page,
            limit,
            pages: Math.ceil(count / limit)
          }
        };
      } catch (error) {
        console.error('Error in allGear resolver:', error);
        throw new Error(`Failed to fetch gear items: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Get gear by ID
    gear: async (_, { id }) => {
      try {
        console.log(`Executing gear query for ID: ${id}`);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        const item = await AudioGear.findById(id).lean()
          .then(mapIdField);
        console.log('Retrieved gear item:', item ? 'Found' : 'Not found');
        return item;
      } catch (error) {
        console.error(`Error in gear resolver for ID ${id}:`, error);
        throw new Error(`Failed to fetch gear with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Filter gear with pagination
    filterGear: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        console.log('Executing filterGear query with filter:', filter, 'and pagination:', pagination);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        // Check if collection exists using the safe method
        const exists = await collectionExists(AudioGear.collection.name);
        if (!exists) {
          console.error(`${AudioGear.collection.name} collection does not exist in the database`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
        const count = await AudioGear.countDocuments();
        console.log(`${AudioGear.collection.name} collection has ${count} documents`);
        
        if (count === 0) {
          console.warn(`${AudioGear.collection.name} collection is empty`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
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
        
        console.log('Executing query with filter:', query);
        
        // Use find instead of aggregate for simpler debugging
        const queryCount = await AudioGear.countDocuments(query);
        console.log(`Query matched ${queryCount} documents`);
        
        const items = await AudioGear.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .then(docs => docs.map(mapIdField));
        
        console.log(`Retrieved ${items.length} filtered gear items`);
        
        return {
          items,
          pagination: {
            total: queryCount,
            page,
            limit,
            pages: Math.ceil(queryCount / limit)
          }
        };
      } catch (error) {
        console.error('Error in filterGear resolver:', error);
        throw new Error(`Failed to filter gear items: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Get all cases with pagination
    allCases: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        console.log('Executing allCases query with pagination:', pagination);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        // Check if collection exists using the safe method
        const exists = await collectionExists(Case.collection.name);
        if (!exists) {
          console.error(`${Case.collection.name} collection does not exist in the database`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
        const count = await Case.countDocuments();
        console.log(`${Case.collection.name} collection has ${count} documents`);
        
        if (count === 0) {
          console.warn(`${Case.collection.name} collection is empty`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Use find instead of aggregate for simpler debugging
        const items = await Case.find()
          .skip(skip)
          .limit(limit)
          .lean()
          .then(docs => docs.map(mapIdField));
        
        console.log(`Retrieved ${items.length} case items`);
        
        return {
          items,
          pagination: {
            total: count,
            page,
            limit,
            pages: Math.ceil(count / limit)
          }
        };
      } catch (error) {
        console.error('Error in allCases resolver:', error);
        throw new Error(`Failed to fetch case items: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Get case by ID
    case: async (_, { id }) => {
      try {
        console.log(`Executing case query for ID: ${id}`);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        const item = await Case.findById(id).lean()
          .then(mapIdField);
        console.log('Retrieved case item:', item ? 'Found' : 'Not found');
        return item;
      } catch (error) {
        console.error(`Error in case resolver for ID ${id}:`, error);
        throw new Error(`Failed to fetch case with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Filter cases with pagination
    filterCases: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        console.log('Executing filterCases query with filter:', filter, 'and pagination:', pagination);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        // Check if collection exists using the safe method
        const exists = await collectionExists(Case.collection.name);
        if (!exists) {
          console.error(`${Case.collection.name} collection does not exist in the database`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
        const count = await Case.countDocuments();
        console.log(`${Case.collection.name} collection has ${count} documents`);
        
        if (count === 0) {
          console.warn(`${Case.collection.name} collection is empty`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
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
        
        if (filter.waterproof !== undefined) {
          query.waterproof = filter.waterproof;
        }
        
        if (filter.shockproof !== undefined) {
          query.shockproof = filter.shockproof;
        }
        
        if (filter.dustproof !== undefined) {
          query.dustproof = filter.dustproof;
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
        
        console.log('Executing query with filter:', query);
        
        // Use find instead of aggregate for simpler debugging
        const queryCount = await Case.countDocuments(query);
        console.log(`Query matched ${queryCount} documents`);
        
        const items = await Case.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .then(docs => docs.map(mapIdField));
        
        console.log(`Retrieved ${items.length} filtered case items`);
        
        return {
          items,
          pagination: {
            total: queryCount,
            page,
            limit,
            pages: Math.ceil(queryCount / limit)
          }
        };
      } catch (error) {
        console.error('Error in filterCases resolver:', error);
        throw new Error(`Failed to filter case items: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Get matches between gear and cases
    matches: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        console.log('Executing matches query with filter:', filter, 'and pagination:', pagination);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        // Check if collection exists using the safe method
        const exists = await collectionExists(GearCaseMatch.collection.name);
        if (!exists) {
          console.error(`${GearCaseMatch.collection.name} collection does not exist in the database`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
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
        
        // Use find instead of aggregate for simpler debugging
        const queryCount = await GearCaseMatch.countDocuments(query);
        console.log(`Query matched ${queryCount} match documents`);
        
        // Explicitly type the result as IGearCaseMatchDocument[]
        const items = await GearCaseMatch.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .then(docs => docs.map(mapIdField));
        
        console.log(`Retrieved ${items.length} match items`);
        
        // Populate gear and case data
        const populatedItems = await Promise.all(items.map(async (match) => {
          try {
            const gear = await AudioGear.findById(match.gearId).lean().then(mapIdField);
            const caseItem = await Case.findById(match.caseId).lean().then(mapIdField);
            return {
              ...match,
              gear,
              case: caseItem
            };
          } catch (err) {
            console.error(`Error populating match data for match ID ${match._id}:`, err);
            return match;
          }
        }));
        
        return {
          items: populatedItems,
          pagination: {
            total: queryCount,
            page,
            limit,
            pages: Math.ceil(queryCount / limit)
          }
        };
      } catch (error) {
        console.error('Error in matches resolver:', error);
        throw new Error(`Failed to fetch matches: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Get matches for specific gear
    matchesForGear: async (_, { gearId, pagination = { page: 1, limit: 10 } }) => {
      try {
        console.log(`Executing matchesForGear query for gear ID: ${gearId} with pagination:`, pagination);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        // Check if collection exists using the safe method
        const exists = await collectionExists(GearCaseMatch.collection.name);
        if (!exists) {
          console.error(`${GearCaseMatch.collection.name} collection does not exist in the database`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Query for matches with the specified gear ID
        const query = { gearId };
        
        // Use countDocuments for accurate count
        const queryCount = await GearCaseMatch.countDocuments(query);
        console.log(`Query matched ${queryCount} match documents for gear ID ${gearId}`);
        
        // Sort by compatibility score (highest first)
        const items = await GearCaseMatch.find(query)
          .sort({ compatibilityScore: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then(docs => docs.map(mapIdField));
        
        console.log(`Retrieved ${items.length} match items for gear ID ${gearId}`);
        
        // Populate gear and case data
        const populatedItems = await Promise.all(items.map(async (match) => {
          try {
            const gear = await AudioGear.findById(match.gearId).lean().then(mapIdField);
            const caseItem = await Case.findById(match.caseId).lean().then(mapIdField);
            return {
              ...match,
              gear,
              case: caseItem
            };
          } catch (err) {
            console.error(`Error populating match data for match ID ${match._id}:`, err);
            return match;
          }
        }));
        
        return {
          items: populatedItems,
          pagination: {
            total: queryCount,
            page,
            limit,
            pages: Math.ceil(queryCount / limit)
          }
        };
      } catch (error) {
        console.error(`Error in matchesForGear resolver for gear ID ${gearId}:`, error);
        throw new Error(`Failed to fetch matches for gear ID ${gearId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Get matches for specific case
    matchesForCase: async (_, { caseId, pagination = { page: 1, limit: 10 } }) => {
      try {
        console.log(`Executing matchesForCase query for case ID: ${caseId} with pagination:`, pagination);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        // Check if collection exists using the safe method
        const exists = await collectionExists(GearCaseMatch.collection.name);
        if (!exists) {
          console.error(`${GearCaseMatch.collection.name} collection does not exist in the database`);
          return { items: [], pagination: { total: 0, page: pagination.page, limit: pagination.limit, pages: 0 } };
        }
        
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        
        // Query for matches with the specified case ID
        const query = { caseId };
        
        // Use countDocuments for accurate count
        const queryCount = await GearCaseMatch.countDocuments(query);
        console.log(`Query matched ${queryCount} match documents for case ID ${caseId}`);
        
        // Sort by compatibility score (highest first)
        const items = await GearCaseMatch.find(query)
          .sort({ compatibilityScore: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .then(docs => docs.map(mapIdField));
        
        console.log(`Retrieved ${items.length} match items for case ID ${caseId}`);
        
        // Populate gear and case data
        const populatedItems = await Promise.all(items.map(async (match) => {
          try {
            const gear = await AudioGear.findById(match.gearId).lean().then(mapIdField);
            const caseItem = await Case.findById(match.caseId).lean().then(mapIdField);
            return {
              ...match,
              gear,
              case: caseItem
            };
          } catch (err) {
            console.error(`Error populating match data for match ID ${match._id}:`, err);
            return match;
          }
        }));
        
        return {
          items: populatedItems,
          pagination: {
            total: queryCount,
            page,
            limit,
            pages: Math.ceil(queryCount / limit)
          }
        };
      } catch (error) {
        console.error(`Error in matchesForCase resolver for case ID ${caseId}:`, error);
        throw new Error(`Failed to fetch matches for case ID ${caseId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    // Get a specific match
    match: async (_, { id }) => {
      try {
        console.log(`Executing match query for ID: ${id}`);
        
        // Ensure MongoDB is connected with enhanced connection handling
        await connectToMongoDB();
        
        // Check if collection exists using the safe method
        const exists = await collectionExists(GearCaseMatch.collection.name);
        if (!exists) {
          console.error(`${GearCaseMatch.collection.name} collection does not exist in the database`);
          return null;
        }
        
        // Find the match by ID
        const match = await GearCaseMatch.findById(id).lean().then(mapIdField);
        
        if (!match) {
          console.warn(`Match with ID ${id} not found`);
          return null;
        }
        
        console.log(`Retrieved match with ID ${id}`);
        
        // Populate gear and case data
        try {
          const gear = await AudioGear.findById(match.gearId).lean().then(mapIdField);
          const caseItem = await Case.findById(match.caseId).lean().then(mapIdField);
          
          return {
            ...match,
            gear,
            case: caseItem
          };
        } catch (err) {
          console.error(`Error populating match data for match ID ${id}:`, err);
          return match;
        }
      } catch (error) {
        console.error(`Error in match resolver for ID ${id}:`, error);
        throw new Error(`Failed to fetch match with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
};
