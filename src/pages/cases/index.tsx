import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Spinner, Pagination, Select, RangeSlider, Checkbox, Button } from '../../components/ui';
import Layout from '../../components/Layout';

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
        rating
        reviewCount
        protectionLevel
        waterproof
        shockproof
        hasHandle
        hasWheels
        internalDimensions {
          length
          width
          height
          unit
        }
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

const CasesPage: React.FC = () => {
  // State for pagination
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(24);
  
  // State for filters
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = React.useState<string[]>([]);
  const [selectedProtectionLevels, setSelectedProtectionLevels] = React.useState<string[]>([]);
  const [minPrice, setMinPrice] = React.useState<number>(0);
  const [maxPrice, setMaxPrice] = React.useState<number>(1000);
  const [hasHandle, setHasHandle] = React.useState<boolean | undefined>(undefined);
  const [hasWheels, setHasWheels] = React.useState<boolean | undefined>(undefined);
  const [waterproof, setWaterproof] = React.useState<boolean | undefined>(undefined);
  const [shockproof, setShockproof] = React.useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState('rating');
  const [sortDirection, setSortDirection] = React.useState('desc');

  // Define interface for the query result
  interface CasesQueryResult {
    paginatedCases: {
      items: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    };
    caseTypes: string[];
    caseBrands: string[];
    caseMarketplaces: string[];
    casePriceRange: number[];
  }

  // Query for cases with filters
  // @ts-ignore - Temporarily ignore TypeScript error for data typing
  const { loading, error, data } = useQuery<CasesQueryResult, { filter: any }>(GET_CASES, {
    variables: {
      filter: {
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        marketplaces: selectedMarketplaces.length > 0 ? selectedMarketplaces : undefined,
        protectionLevels: selectedProtectionLevels.length > 0 ? selectedProtectionLevels : undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        hasWheels,
        hasHandle,
        waterproof,
        shockproof,
        sortBy,
        sortDirection,
        page,
        limit
      }
    },
    fetchPolicy: 'cache-and-network'
  });

  // Reset all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedBrands([]);
    setSelectedMarketplaces([]);
    setSelectedProtectionLevels([]);
    setMinPrice(0);
    setMaxPrice(1000);
    setHasHandle(undefined);
    setHasWheels(undefined);
    setWaterproof(undefined);
    setShockproof(undefined);
    setSortBy('rating');
    setSortDirection('desc');
    setPage(1);
  };

  // Handle checkbox change for multi-select filters
  const handleCheckboxChange = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(item => item !== value));
    } else {
      setSelected([...selected, value]);
    }
    setPage(1);
  };

  // Handle boolean filter change
  const handleBooleanFilterChange = (
    value: boolean | undefined,
    setValue: React.Dispatch<React.SetStateAction<boolean | undefined>>
  ) => {
    if (value === undefined) {
      setValue(true);
    } else if (value === true) {
      setValue(false);
    } else {
      setValue(undefined);
    }
    setPage(1);
  };

  // Format price for display
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h2>
              
              {/* Case types filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Case Types</h3>
                <div className="space-y-2">
                  {data?.caseTypes?.map((type) => (
                    <Checkbox
                      key={type}
                      id={`type-${type}`}
                      label={type}
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleCheckboxChange(type, selectedTypes, setSelectedTypes)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Brands filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brands</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data?.caseBrands?.map((brand) => (
                    <Checkbox
                      key={brand}
                      id={`brand-${brand}`}
                      label={brand || 'Unbranded'}
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleCheckboxChange(brand, selectedBrands, setSelectedBrands)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Marketplaces filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marketplaces</h3>
                <div className="space-y-2">
                  {data?.caseMarketplaces?.map((marketplace) => (
                    <Checkbox
                      key={marketplace}
                      id={`marketplace-${marketplace}`}
                      label={marketplace}
                      checked={selectedMarketplaces.includes(marketplace)}
                      onChange={() => handleCheckboxChange(marketplace, selectedMarketplaces, setSelectedMarketplaces)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Protection level filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Protection Level</h3>
                <div className="space-y-2">
                  {['high', 'medium', 'low'].map((level) => (
                    <Checkbox
                      key={level}
                      id={`protection-${level}`}
                      label={level.charAt(0).toUpperCase() + level.slice(1)}
                      checked={selectedProtectionLevels.includes(level)}
                      onChange={() => handleCheckboxChange(level, selectedProtectionLevels, setSelectedProtectionLevels)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Price range filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range: {formatPrice(minPrice, 'USD')} - {formatPrice(maxPrice, 'USD')}
                </h3>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min={0} 
                    max={1000} 
                    value={minPrice} 
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value <= maxPrice) {
                        setMinPrice(value);
                        setPage(1);
                      }
                    }}
                    className="w-full"
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={1000} 
                    value={maxPrice} 
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= minPrice) {
                        setMaxPrice(value);
                        setPage(1);
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Features filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</h3>
                <div className="space-y-2">
                  <Checkbox
                    id="feature-waterproof"
                    label="Waterproof"
                    checked={waterproof === true}
                    onChange={() => handleBooleanFilterChange(waterproof, setWaterproof)}
                  />
                  <Checkbox
                    id="feature-shockproof"
                    label="Shockproof"
                    checked={shockproof === true}
                    onChange={() => handleBooleanFilterChange(shockproof, setShockproof)}
                  />
                  <Checkbox
                    id="feature-handle"
                    label="Has Handle"
                    checked={hasHandle === true}
                    onChange={() => handleBooleanFilterChange(hasHandle, setHasHandle)}
                  />
                  <Checkbox
                    id="feature-wheels"
                    label="Has Wheels"
                    checked={hasWheels === true}
                    onChange={() => handleBooleanFilterChange(hasWheels, setHasWheels)}
                  />
                </div>
              </div>
              
              {/* Sort options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</h3>
                <Select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'rating', label: 'Rating' },
                    { value: 'price', label: 'Price' },
                    { value: 'reviewCount', label: 'Review Count' }
                  ]}
                  className="mb-2"
                />
                <Select
                  id="sort-direction"
                  value={sortDirection}
                  onChange={(e) => {
                    setSortDirection(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'desc', label: 'Descending' },
                    { value: 'asc', label: 'Ascending' }
                  ]}
                />
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
                {data?.paginatedCases?.items && data.paginatedCases.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.paginatedCases.items.map((caseItem: any) => (
                      <Card
                        key={caseItem.id}
                        link={`/cases/${caseItem.id}`}
                        title={caseItem.name}
                        image={caseItem.imageUrls?.[0]}
                        badges={[
                          caseItem.type,
                          caseItem.marketplace,
                          ...(caseItem.protectionLevel ? [`${caseItem.protectionLevel.charAt(0).toUpperCase() + caseItem.protectionLevel.slice(1)} Protection`] : [])
                        ]}
                        description={`${caseItem.rating ? `★ ${caseItem.rating.toFixed(1)}` : 'Not rated'} · ${formatPrice(caseItem.price, caseItem.currency)}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-300">No cases found matching your criteria.</p>
                    <Button onClick={clearFilters} variant="primary" className="mt-4">
                      Clear Filters
                    </Button>
                  </div>
                )}
                
                {/* Pagination */}
                {data?.paginatedCases?.pagination && data.paginatedCases.pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={data.paginatedCases.pagination.pages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CasesPage;
