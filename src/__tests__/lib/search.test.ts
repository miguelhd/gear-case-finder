// Unit tests for search functionality
import { searchGear, searchCases, findCompatibleCases } from '../../lib/search';
import { AudioGear, Case } from '../../lib/models/gear-models';
import { mongoose } from '../../lib/mongodb';

// Mock data
const mockGearData = [
  {
    _id: '1',
    name: 'SM58',
    brand: 'Shure',
    category: 'Microphone',
    type: 'Dynamic',
    dimensions: {
      length: 6.3,
      width: 2.0,
      height: 2.0,
      unit: 'in'
    },
    popularity: 95
  },
  {
    _id: '2',
    name: 'Scarlett 2i2',
    brand: 'Focusrite',
    category: 'Audio Interface',
    type: 'USB',
    dimensions: {
      length: 7.17,
      width: 3.03,
      height: 1.71,
      unit: 'in'
    },
    popularity: 90
  }
];

const mockCaseData = [
  {
    _id: '101',
    name: 'Professional Microphone Case',
    brand: 'GatorCases',
    type: 'Hard Case',
    internalDimensions: {
      length: 7.5,
      width: 3.5,
      height: 2.5,
      unit: 'in'
    },
    price: 29.99
  },
  {
    _id: '102',
    name: 'Audio Interface Protective Case',
    brand: 'SKB',
    type: 'Soft Case',
    internalDimensions: {
      length: 8.0,
      width: 4.0,
      height: 2.0,
      unit: 'in'
    },
    price: 24.99
  }
];

// Mock the mongoose models
jest.mock('../../lib/models/gear-models', () => ({
  AudioGear: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockGearData)
    }),
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockGearData[0])
    }),
    countDocuments: jest.fn().mockResolvedValue(2),
    distinct: jest.fn().mockImplementation((field) => ({
      exec: jest.fn().mockResolvedValue(['Microphone', 'Audio Interface'])
    }))
  },
  Case: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCaseData)
    }),
    countDocuments: jest.fn().mockResolvedValue(2),
    distinct: jest.fn().mockImplementation((field) => ({
      exec: jest.fn().mockResolvedValue(['Hard Case', 'Soft Case'])
    }))
  }
}));

describe('Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchGear', () => {
    it('should return gear items with pagination', async () => {
      const result = await searchGear({});
      
      expect(AudioGear.find).toHaveBeenCalled();
      expect(AudioGear.countDocuments).toHaveBeenCalled();
      expect(result.results).toEqual(mockGearData);
      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 20,
        pages: 1
      });
    });

    it('should apply search filters correctly', async () => {
      await searchGear({
        query: 'Shure',
        category: 'Microphone',
        brand: 'Shure',
        type: 'Dynamic'
      });
      
      expect(AudioGear.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'Shure', $options: 'i' } },
          { brand: { $regex: 'Shure', $options: 'i' } },
          { description: { $regex: 'Shure', $options: 'i' } }
        ],
        category: { $regex: 'Microphone', $options: 'i' },
        brand: { $regex: 'Shure', $options: 'i' },
        type: { $regex: 'Dynamic', $options: 'i' }
      });
    });

    it('should apply pagination correctly', async () => {
      await searchGear({
        page: 2,
        limit: 10
      });
      
      const findMock = AudioGear.find().skip;
      expect(findMock).toHaveBeenCalledWith(10);
      
      const limitMock = AudioGear.find().skip().limit;
      expect(limitMock).toHaveBeenCalledWith(10);
    });

    it('should apply sorting correctly', async () => {
      await searchGear({
        sortBy: 'popularity',
        sortOrder: 'desc'
      });
      
      const sortMock = AudioGear.find().sort;
      expect(sortMock).toHaveBeenCalledWith({ popularity: -1 });
    });
  });

  describe('searchCases', () => {
    it('should return case items with pagination', async () => {
      const result = await searchCases({});
      
      expect(Case.find).toHaveBeenCalled();
      expect(Case.countDocuments).toHaveBeenCalled();
      expect(result.results).toEqual(mockCaseData);
      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 20,
        pages: 1
      });
    });

    it('should apply price filters correctly', async () => {
      await searchCases({
        minPrice: 20,
        maxPrice: 50
      });
      
      expect(Case.find).toHaveBeenCalledWith({
        price: {
          $gte: 20,
          $lte: 50
        }
      });
    });
  });

  describe('findCompatibleCases', () => {
    it('should find compatible cases for a gear item', async () => {
      const result = await findCompatibleCases('1', {});
      
      expect(AudioGear.findById).toHaveBeenCalledWith('1');
      expect(Case.find).toHaveBeenCalled();
      expect(result.gear).toEqual(mockGearData[0]);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0]).toHaveProperty('compatibilityScore');
      expect(result.results[0]).toHaveProperty('dimensionFit');
    });

    it('should throw an error if gear is not found', async () => {
      AudioGear.findById.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(null)
      });
      
      await expect(findCompatibleCases('999', {})).rejects.toThrow('Gear not found');
    });
  });
});
