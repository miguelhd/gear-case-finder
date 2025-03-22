import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Spinner, Pagination, Select, RangeSlider, Checkbox, Button } from '../components/ui';
import Layout from '../components/Layout';

// GraphQL query for fetching cases with pagination and filtering
const GET_CASES = gql`
  query GetCases($filter: FilterInput) {
    paginatedCases(filter: $filter) {
      items {
        id
        name
        brand
        type
        marketplace
        price
        currency
        imageUrls
        protectionLevel
        rating
        reviewCount
      }
      pagination {
        total
        page
        limit
        pages
      }
    }
    caseTypes
    caseBrands
    caseMarketplaces
    casePriceRange
  }
`;

const CasesListingPage: React.FC = () => {
  // State for filters
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(12);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = React.useState<string[]>([]);
  const [selectedProtectionLevels, setSelectedProtectionLevels] = React.useState<string[]>([]);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 1000]);
  const [hasWheels, setHasWheels] = React.useState<boolean | undefined>(undefined);
  const [hasHandle, setHasHandle] = React.useState<boolean | undefined>(undefined);
  const [waterproof, setWaterproof] = React.useState<boolean | undefined>(undefined);
  const [shockproof, setShockproof] = React.useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState('rating');
  const [sortDirection, setSortDirection] = React.useState('desc');

  // Query for cases with filters
  const { loading, error, data } = useQuery(GET_CASES, {
    variables: {
      filter: {
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        marketplaces: selectedMarketplaces.length > 0 ? selectedMarketplaces : undefined,
        protectionLevels: selectedProtectionLevels.length > 0 ? selectedProtectionLevels : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < (data?.casePriceRange?.[1] || 1000) ? priceRange[1] : undefined,
        hasWheels,
        hasHandle,
        waterproof,
        shockproof,
        page,
        limit,
        sortBy,
        sortDirection
      }
    },
    onCompleted: (data) => {
      // Initialize price range from API if not already set
      if (data.casePriceRange && priceRange[0] === 0 && priceRange[1] === 1000) {
        setPriceRange([data.casePriceRange[0], data.casePriceRange[1]]);
      }
    }
  });

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // Handle type selection
  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
    setPage(1);
  };

  // Handle brand selection
  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
    setPage(1);
  };

  // Handle marketplace selection
  const handleMarketplaceChange = (marketplace: string) => {
    setSelectedMarketplaces(prev => 
      prev.includes(marketplace) 
        ? prev.filter(m => m !== marketplace) 
        : [...prev, marketplace]
    );
    setPage(1);
  };

  // Handle protection level selection
  const handleProtectionLevelChange = (level: string) => {
    setSelectedProtectionLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
    setPage(1);
  };

  // Handle price range change
  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Handle sort direction change
  const handleSortDirectionChange = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedBrands([]);
    setSelectedMarketplaces([]);
    setSelectedProtectionLevels([]);
    setPriceRange(data?.casePriceRange ? [data.casePriceRange[0], data.casePriceRange[1]] : [0, 1000]);
    setHasWheels(undefined);
    setHasHandle(undefined);
    setWaterproof(undefined);
    setShockproof(undefined);
    setSortBy('rating');
    setSortDirection('desc');
    setPage(1);
  };

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <Layout title="Protective Cases - Find the Perfect Case for Your Music Gear">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Protective Cases</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
              
              {/* Types filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Case Types</h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-red-500">Error loading types</p>
                ) : (
                  <div className="space-y-2">
                    {data?.caseTypes?.map((type: string) => (
                      <Checkbox
                        key={type}
                        id={`type-${type}`}
                        label={type}
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeChange(type)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Marketplaces filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marketplaces</h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-red-500">Error loading marketplaces</p>
                ) : (
                  <div className="space-y-2">
                    {data?.caseMarketplaces?.map((marketplace: string) => (
                      <Checkbox
                        key={marketplace}
                        id={`marketplace-${marketplace}`}
                        label={marketplace}
                        checked={selectedMarketplaces.includes(marketplace)}
                        onChange={() => handleMarketplaceChange(marketplace)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Brands filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brands</h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-red-500">Error loading brands</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data?.caseBrands?.map((brand: string) => (
                      <Checkbox
                        key={brand}
                        id={`brand-${brand}`}
                        label={brand}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Protection Level filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Protection Level</h3>
                <div className="space-y-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <Checkbox
                      key={level}
                      id={`protection-${level}`}
                      label={level.charAt(0).toUpperCase() + level.slice(1)}
                      checked={selectedProtectionLevels.includes(level)}
                      onChange={() => handleProtectionLevelChange(level)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Price Range filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range: {formatPrice(priceRange[0], 'USD')} - {formatPrice(priceRange[1], 'USD')}
                </h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-red-500">Error loading price range</p>
                ) : (
                  <RangeSlider
                    id="price-range"
                    min={data?.casePriceRange?.[0] || 0}
                    max={data?.casePriceRange?.[1] || 1000}
                    step={5}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                    showValue={false}
                  />
                )}
              </div>
              
              {/* Features filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</h3>
                <div className="space-y-2">
                  <Checkbox
                    id="has-wheels"
                    label="Has Wheels"
                    checked={hasWheels === true}
                    onChange={() => {
                      setHasWheels(prev => prev === true ? undefined : true);
                      setPage(1);
                    }}
                  />
                  <Checkbox
                    id="has-handle"
                    label="Has Handle"
                    checked={hasHandle === true}
                    onChange={() => {
                      setHasHandle(prev => prev === true ? undefined : true);
                      setPage(1);
                    }}
                  />
                  <Checkbox
                    id="waterproof"
                    label="Waterproof"
                    checked={waterproof === true}
                    onChange={() => {
                      setWaterproof(prev => prev === true ? undefined : true);
                      setPage(1);
                    }}
                  />
                  <Checkbox
                    id="shockproof"
                    label="Shockproof"
                    checked={shockproof === true}
                    onChange={() => {
                      setShockproof(prev => prev === true ? undefined : true);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              
              {/* Sort options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</h3>
                <div className="flex items-center space-x-2">
                  <Select
                    id="sort-by"
                    value={sortBy}
                    onChange={handleSortChange}
                    options={[
                      { value: 'rating', label: 'Rating' },
                      { value: 'price', label: 'Price' },
                      { value: 'reviewCount', label: 'Review Count' }
                    ]}
                    className="flex-grow"
                  />
                  <button
                    onClick={handleSortDirectionChange}
                    className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {sortDirection === 'asc' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Clear filters button */}
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                fullWidth
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                <p className="text-red-800 dark:text-red-200">Error loading cases. Please try again later.</p>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {data?.paginatedCases?.items?.length || 0} of {data?.paginatedCases?.pagination?.total || 0} items
                  </p>
                  <Select
                    id="items-per-page"
                    value={limit.toString()}
                    onChange={(e) => {
                      setLimit(parseInt(e.target.value));
                      setPage(1);
                    }}
                    options={[
                      { value: '12', label: '12 per page' },
                      { value: '24', label: '24 per page' },
                      { value: '48', label: '48 per page' }
                    ]}
                    className="w-40"
                  />
                </div>
                
                {/* Grid of cases */}
                {data?.paginatedCases?.items?.length > 0 ? (