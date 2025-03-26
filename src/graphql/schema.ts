import { gql } from 'graphql-tag';

// Define GraphQL schema
export const typeDefs = gql`
  # Types
  type AudioGear {
    id: ID!
    name: String!
    brand: String
    category: String
    type: String
    imageUrl: String
    popularity: Int
    inStock: Boolean
    releaseYear: Int
    dimensions: Dimensions
    description: String
    features: [String]
    price: Float
    rating: Float
    reviews: Int
  }

  type Case {
    id: ID!
    name: String!
    brand: String
    type: String
    imageUrl: String
    inStock: Boolean
    dimensions: Dimensions
    description: String
    features: [String]
    price: Float
    rating: Float
    reviews: Int
    protectionLevel: String
    compatibleWith: [String]
  }

  type GearCaseMatch {
    id: ID!
    gearId: ID!
    caseId: ID!
    gear: AudioGear
    case: Case
    compatibilityScore: Float!
    notes: String
  }

  type Dimensions {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  # Pagination
  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
  }

  type AudioGearResult {
    items: [AudioGear!]!
    pagination: PaginationInfo!
  }

  type CaseResult {
    items: [Case!]!
    pagination: PaginationInfo!
  }

  type MatchResult {
    items: [GearCaseMatch!]!
    pagination: PaginationInfo!
  }

  # Input types
  input PaginationInput {
    page: Int
    limit: Int
  }

  input DimensionsInput {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  input GearFilterInput {
    search: String
    categories: [String]
    brands: [String]
    types: [String]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    inStock: Boolean
    sortBy: String
    sortDirection: String
  }

  input CaseFilterInput {
    search: String
    brands: [String]
    types: [String]
    protectionLevels: [String]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    inStock: Boolean
    sortBy: String
    sortDirection: String
  }

  input MatchFilterInput {
    gearId: ID
    caseId: ID
    minScore: Float
    sortBy: String
    sortDirection: String
  }

  # Queries
  type Query {
    # Get all gear with pagination and filtering
    allGear(pagination: PaginationInput): AudioGearResult!
    
    # Get gear by ID
    gear(id: ID!): AudioGear
    
    # Filter gear
    filterGear(filter: GearFilterInput!, pagination: PaginationInput): AudioGearResult!
    
    # Get all cases with pagination and filtering
    allCases(pagination: PaginationInput): CaseResult!
    
    # Get case by ID
    case(id: ID!): Case
    
    # Filter cases
    filterCases(filter: CaseFilterInput!, pagination: PaginationInput): CaseResult!
    
    # Get matches between gear and cases
    matches(filter: MatchFilterInput!, pagination: PaginationInput): MatchResult!
    
    # Get matches for specific gear
    matchesForGear(gearId: ID!, pagination: PaginationInput): MatchResult!
    
    # Get matches for specific case
    matchesForCase(caseId: ID!, pagination: PaginationInput): MatchResult!
    
    # Get a specific match
    match(id: ID!): GearCaseMatch
    
    # Query to check if the API is working
    __typename: String!
  }
`;
