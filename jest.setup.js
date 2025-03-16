// Jest setup file
import '@testing-library/jest-dom';

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    }
  })
}));

// Mock MongoDB connection
jest.mock('../src/lib/mongodb', () => {
  const mongoose = {
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      db: {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
          }),
          findOne: jest.fn().mockResolvedValue(null),
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
          insertMany: jest.fn().mockResolvedValue({ insertedCount: 1 }),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
          countDocuments: jest.fn().mockResolvedValue(0),
          distinct: jest.fn().mockResolvedValue([]),
        })
      }
    },
    Schema: jest.fn().mockImplementation(() => ({
      index: jest.fn().mockReturnThis(),
    })),
    model: jest.fn().mockReturnValue({
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      countDocuments: jest.fn().mockResolvedValue(0),
      distinct: jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      })),
    }),
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => id),
    },
  };
  
  return {
    mongoose,
    clientPromise: Promise.resolve({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
          findOne: jest.fn().mockResolvedValue(null),
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
        })
      })
    }),
  };
});

// Mock cache implementation
jest.mock('../src/lib/cache', () => {
  const cache = new Map();
  return {
    getCache: jest.fn().mockReturnValue(cache),
    getCacheItem: jest.fn().mockImplementation((key) => cache.get(key)),
    setCacheItem: jest.fn().mockImplementation((key, value) => cache.set(key, value)),
    removeCacheItem: jest.fn().mockImplementation((key) => cache.delete(key)),
    clearCache: jest.fn().mockImplementation(() => cache.clear()),
    getCacheStats: jest.fn().mockReturnValue({
      size: 0,
      maxSize: 5000,
      itemCount: 0,
      maxItems: 500,
      hitRate: 0,
    }),
    withCache: jest.fn().mockImplementation((fn) => fn),
  };
});

// Global fetch mock
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
  })
);

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
