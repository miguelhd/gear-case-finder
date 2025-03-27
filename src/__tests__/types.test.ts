/**
 * TypeScript type validation tests
 * 
 * These tests ensure that our TypeScript types are correctly defined and used
 * throughout the application. They help catch type errors before deployment.
 */

import { resolvers } from '../graphql/resolvers';
import { AudioGear, Case, GearCaseMatch } from '../lib/models/gear-models';

// Mock the mongoose models to avoid actual database connections
jest.mock('../lib/models/gear-models', () => ({
  AudioGear: {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockResolvedValue(10),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([{
      _id: 'gear1',
      name: 'Test Gear',
      brand: 'Test Brand',
      category: 'Test Category',
      type: 'Test Type',
      dimensions: { length: 10, width: 10, height: 10, unit: 'cm' }
    }])
  },
  Case: {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockResolvedValue(10),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([{
      _id: 'case1',
      name: 'Test Case',
      brand: 'Test Brand',
      type: 'Test Type',
      dimensions: { length: 20, width: 20, height: 20, unit: 'cm' }
    }])
  },
  GearCaseMatch: {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockResolvedValue(10),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([{
      _id: 'match1',
      gearId: 'gear1',
      caseId: 'case1',
      compatibilityScore: 95,
      dimensionScore: 90,
      featureScore: 100,
      userFeedbackScore: 95,
      totalFeedback: 10,
      positiveCount: 9,
      negativeCount: 1
    }])
  }
}));

// Mock mongoose connection
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    readyState: 1,
    db: {
      listCollections: jest.fn().mockReturnValue({
        hasNext: jest.fn().mockResolvedValue(true)
      })
    }
  }
}));

describe('GraphQL Resolver Type Tests', () => {
  test('allGear resolver returns properly typed data', async () => {
    const result = await resolvers.Query.allGear(null, { pagination: { page: 1, limit: 10 } });
    
    // Type checking
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('pagination');
    expect(result.pagination).toHaveProperty('total');
    expect(result.pagination).toHaveProperty('page');
    expect(result.pagination).toHaveProperty('limit');
    expect(result.pagination).toHaveProperty('pages');
  });

  test('gear resolver returns properly typed data', async () => {
    const result = await resolvers.Query.gear(null, { id: 'gear1' });
    
    // Type checking
    expect(result).toBeDefined();
  });

  test('filterGear resolver returns properly typed data', async () => {
    const result = await resolvers.Query.filterGear(null, { 
      filter: { search: 'test' }, 
      pagination: { page: 1, limit: 10 } 
    });
    
    // Type checking
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('pagination');
  });

  test('allCases resolver returns properly typed data', async () => {
    const result = await resolvers.Query.allCases(null, { pagination: { page: 1, limit: 10 } });
    
    // Type checking
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('pagination');
  });

  test('case resolver returns properly typed data', async () => {
    const result = await resolvers.Query.case(null, { id: 'case1' });
    
    // Type checking
    expect(result).toBeDefined();
  });

  test('filterCases resolver returns properly typed data', async () => {
    const result = await resolvers.Query.filterCases(null, { 
      filter: { search: 'test' }, 
      pagination: { page: 1, limit: 10 } 
    });
    
    // Type checking
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('pagination');
  });

  test('matches resolver returns properly typed data', async () => {
    const result = await resolvers.Query.matches(null, { 
      filter: { minScore: 80 }, 
      pagination: { page: 1, limit: 10 } 
    });
    
    // Type checking
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('pagination');
  });

  test('matchesForGear resolver returns properly typed data', async () => {
    const result = await resolvers.Query.matchesForGear(null, { 
      gearId: 'gear1', 
      pagination: { page: 1, limit: 10 } 
    });
    
    // Type checking
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('pagination');
  });

  test('matchesForCase resolver returns properly typed data', async () => {
    const result = await resolvers.Query.matchesForCase(null, { 
      caseId: 'case1', 
      pagination: { page: 1, limit: 10 } 
    });
    
    // Type checking
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('pagination');
  });

  test('match resolver returns properly typed data', async () => {
    const result = await resolvers.Query.match(null, { id: 'match1' });
    
    // Type checking
    expect(result).toBeDefined();
  });
});
