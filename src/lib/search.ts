// Search and filtering functionality for the Gear Case Finder application
import { AudioGear, Case } from './models/gear-models';
import { withCache } from './cache';
import { mongoose } from './mongodb';

// Interface for search parameters
export interface SearchParams {
  query?: string;
  category?: string;
  brand?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minDimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  maxDimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  features?: string[];
  sortBy?: 'price' | 'rating' | 'popularity' | 'releaseYear';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

/**
 * Search for audio gear based on various parameters
 */
export const searchGear = withCache(
  async (params: SearchParams = {}) => {
    const {
      query,
      category,
      brand,
      type,
      minDimensions,
      maxDimensions,
      sortBy = 'popularity',
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = params;

    // Build the query
    let queryBuilder: any = {};

    // Text search
    if (query) {
      queryBuilder.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      queryBuilder.category = { $regex: category, $options: 'i' };
    }

    // Brand filter
    if (brand) {
      queryBuilder.brand = { $regex: brand, $options: 'i' };
    }

    // Type filter
    if (type) {
      queryBuilder.type = { $regex: type, $options: 'i' };
    }

    // Dimension filters
    if (minDimensions || maxDimensions) {
      queryBuilder.dimensions = {};

      if (minDimensions) {
        if (minDimensions.length) queryBuilder.dimensions['length'] = { $gte: minDimensions.length };
        if (minDimensions.width) queryBuilder.dimensions['width'] = { $gte: minDimensions.width };
        if (minDimensions.height) queryBuilder.dimensions['height'] = { $gte: minDimensions.height };
      }

      if (maxDimensions) {
        if (maxDimensions.length) {
          queryBuilder.dimensions['length'] = { 
            ...queryBuilder.dimensions?.['length'] || {}, 
            $lte: maxDimensions.length 
          };
        }
        if (maxDimensions.width) {
          queryBuilder.dimensions['width'] = { 
            ...queryBuilder.dimensions?.['width'] || {}, 
            $lte: maxDimensions.width 
          };
        }
        if (maxDimensions.height) {
          queryBuilder.dimensions['height'] = { 
            ...queryBuilder.dimensions?.['height'] || {}, 
            $lte: maxDimensions.height 
          };
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination and sorting
    const results = await AudioGear.find(queryBuilder)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await AudioGear.countDocuments(queryBuilder);

    return {
      results,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  },
  'search:gear',
  1000 * 60 * 5 // 5 minute cache
);

/**
 * Search for cases based on various parameters
 */
export const searchCases = withCache(
  async (params: SearchParams = {}) => {
    const {
      query,
      brand,
      type,
      minPrice,
      maxPrice,
      minDimensions,
      maxDimensions,
      features,
      sortBy = 'price',
      sortOrder = 'asc',
      limit = 20,
      page = 1
    } = params;

    // Build the query
    let queryBuilder: any = {};

    // Text search
    if (query) {
      queryBuilder.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Brand filter
    if (brand) {
      queryBuilder.brand = { $regex: brand, $options: 'i' };
    }

    // Type filter
    if (type) {
      queryBuilder.type = { $regex: type, $options: 'i' };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      queryBuilder.price = {};
      if (minPrice !== undefined) queryBuilder.price.$gte = minPrice;
      if (maxPrice !== undefined) queryBuilder.price.$lte = maxPrice;
    }

    // Internal dimension filters (for fitting gear)
    if (minDimensions || maxDimensions) {
      queryBuilder.internalDimensions = {};

      if (minDimensions) {
        if (minDimensions.length) queryBuilder.internalDimensions['length'] = { $gte: minDimensions.length };
        if (minDimensions.width) queryBuilder.internalDimensions['width'] = { $gte: minDimensions.width };
        if (minDimensions.height) queryBuilder.internalDimensions['height'] = { $gte: minDimensions.height };
      }

      if (maxDimensions) {
        if (maxDimensions.length) {
          queryBuilder.internalDimensions['length'] = { 
            ...queryBuilder.internalDimensions?.['length'] || {}, 
            $lte: maxDimensions.length 
          };
        }
        if (maxDimensions.width) {
          queryBuilder.internalDimensions['width'] = { 
            ...queryBuilder.internalDimensions?.['width'] || {}, 
            $lte: maxDimensions.width 
          };
        }
        if (maxDimensions.height) {
          queryBuilder.internalDimensions['height'] = { 
            ...queryBuilder.internalDimensions?.['height'] || {}, 
            $lte: maxDimensions.height 
          };
        }
      }
    }

    // Features filter
    if (features && features.length > 0) {
      queryBuilder.features = { $all: features };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination and sorting
    const results = await Case.find(queryBuilder)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Case.countDocuments(queryBuilder);

    return {
      results,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  },
  'search:cases',
  1000 * 60 * 5 // 5 minute cache
);

/**
 * Find compatible cases for a specific gear item
 */
export const findCompatibleCases = withCache(
  async (gearId: string, params: SearchParams = {}) => {
    const {
      minPrice,
      maxPrice,
      features,
      sortBy = 'compatibilityScore',
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = params;

    // First, get the gear item
    const gear = await AudioGear.findById(gearId).lean();
    if (!gear) {
      throw new Error('Gear not found');
    }

    // Build the query for compatible cases
    let queryBuilder: any = {
      // Ensure internal dimensions are larger than gear dimensions
      // with some tolerance (e.g., 0.5 inches)
      'internalDimensions.length': { $gte: (gear as any).dimensions?.length + 0.5 },
      'internalDimensions.width': { $gte: (gear as any).dimensions?.width + 0.5 },
      'internalDimensions.height': { $gte: (gear as any).dimensions?.height + 0.5 }
    };

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      queryBuilder.price = {};
      if (minPrice !== undefined) queryBuilder.price.$gte = minPrice;
      if (maxPrice !== undefined) queryBuilder.price.$lte = maxPrice;
    }

    // Features filter
    if (features && features.length > 0) {
      queryBuilder.features = { $all: features };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const cases = await Case.find(queryBuilder).lean();

    // Calculate compatibility score for each case
    const scoredCases = cases.map(caseItem => {
      // Calculate dimension fit (how well the gear fits in the case)
      const lengthFit = Math.min(100, ((gear as any).dimensions.length / caseItem.internalDimensions.length) * 100);
      const widthFit = Math.min(100, ((gear as any).dimensions.width / caseItem.internalDimensions.width) * 100);
      const heightFit = Math.min(100, ((gear as any).dimensions.height / caseItem.internalDimensions.height) * 100);
      
      // Overall fit (average of all dimensions)
      const overallFit = (lengthFit + widthFit + heightFit) / 3;
      
      // Protection level score (0-100)
      const protectionScore = 
        caseItem.protectionLevel === 'high' ? 100 :
        caseItem.protectionLevel === 'medium' ? 70 :
        caseItem.protectionLevel === 'low' ? 40 : 0;
      
      // Feature score (more features = higher score)
      const featureScore = (caseItem.features?.length || 0) * 5;
      
      // Calculate overall compatibility score (weighted average)
      const compatibilityScore = (
        (overallFit * 0.5) +
        (protectionScore * 0.3) +
        (featureScore * 0.2)
      );
      
      return {
        ...caseItem,
        compatibilityScore,
        dimensionFit: {
          length: lengthFit,
          width: widthFit,
          height: heightFit,
          overall: overallFit
        }
      };
    });

    // Sort by compatibility score
    const sortedCases = scoredCases.sort((a, b) => {
      if (sortBy === 'compatibilityScore') {
        return sortOrder === 'desc' 
          ? b.compatibilityScore - a.compatibilityScore
          : a.compatibilityScore - b.compatibilityScore;
      } else if (sortBy === 'price') {
        return sortOrder === 'desc' 
          ? (b as any).price - (a as any).price
          : (a as any).price - (b as any).price;
      } else if (sortBy === 'rating') {
        return sortOrder === 'desc' 
          ? ((b as any).rating || 0) - ((a as any).rating || 0)
          : ((a as any).rating || 0) - ((b as any).rating || 0);
      }
      return 0;
    });

    // Apply pagination
    const paginatedCases = sortedCases.slice(skip, skip + limit);

    return {
      results: paginatedCases,
      gear,
      pagination: {
        total: sortedCases.length,
        page,
        limit,
        pages: Math.ceil(sortedCases.length / limit)
      }
    };
  },
  'search:compatible-cases',
  1000 * 60 * 5 // 5 minute cache
);

/**
 * Get available filter options (for UI dropdowns)
 */
export const getFilterOptions = withCache(
  async () => {
    // Get distinct values for various fields
    const [
      gearCategories,
      gearBrands,
      gearTypes,
      caseTypes,
      caseBrands,
      caseFeatures
    ] = await Promise.all([
      AudioGear.distinct('category').exec(),
      AudioGear.distinct('brand').exec(),
      AudioGear.distinct('type').exec(),
      Case.distinct('type').exec(),
      Case.distinct('brand').exec(),
      Case.distinct('features').exec()
    ]);

    return {
      gear: {
        categories: gearCategories,
        brands: gearBrands,
        types: gearTypes
      },
      cases: {
        types: caseTypes,
        brands: caseBrands,
        features: caseFeatures
      }
    };
  },
  'filter:options',
  1000 * 60 * 60 // 1 hour cache
);
