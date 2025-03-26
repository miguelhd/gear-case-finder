import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Spinner, Pagination, Select, RangeSlider, Checkbox, Button } from '../../components/ui';
import Head from 'next/head';

// GraphQL query for fetching cases with pagination and filtering
const GET_CASES = gql`
  query GetCases($filter: CaseFilterInput!, $page: Int, $limit: Int) {
    filterCases(filter: $filter, pagination: { page: $page, limit: $limit }) {
      items {
        id
        name
        brand
        type
        imageUrl
        price
        currency
        rating
        reviewCount
        protectionLevel
        waterproof
        shockproof
        dustproof
        color
        material
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
    caseTypes: allCases(pagination: { limit: 100 }) {
      items {
        type
      }
    }
    caseBrands: allCases(pagination: { limit: 100 }) {
      items {
        brand
      }
    }
  }
`;

const CasesPage: React.FC = () => {
  // State for pagination
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(24);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  // State for filters
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [selectedProtectionLevels, setSelectedProtectionLevels] = React.useState<string[]>([]);
  const [minPrice, setMinPrice] = React.useState<number>(0);
  const [maxPrice, setMaxPrice] = React.useState<number>(1000);
  const [waterproof, setWaterproof] = React.useState<boolean | undefined>(undefined);
  const [shockproof, setShockproof] = React.useState<boolean | undefined>(undefined);
  const [dustproof, setDustproof] = React.useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState('rating');
  const [sortDirection, setSortDirection] = React.useState('desc');

  // Query for cases with filters
  const { loading, error, data } = useQuery(GET_CASES, {
    variables: {
      filter: {
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        protectionLevels: selectedProtectionLevels.length > 0 ? selectedProtectionLevels : undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        waterproof,
        shockproof,
        dustproof
      },
      page,
      limit
    },
    fetchPolicy: 'cache-and-network'
  });

  // Extract unique types and brands from the data
  const types = React.useMemo(() => {
    if (!data?.caseTypes?.items) return [] as string[];
    const allTypes = data.caseTypes.items.map((item: any) => item.type);
    return [...new Set(allTypes)].filter(Boolean) as string[];
  }, [data?.caseTypes]);

  const brands = React.useMemo(() => {
    if (!data?.caseBrands?.items) return [] as string[];
    const allBrands = data.caseBrands.items.map((item: any) => item.brand);
    return [...new Set(allBrands)].filter(Boolean) as string[];
  }, [data?.caseBrands]);

  // Reset all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedBrands([]);
    setSelectedProtectionLevels([]);
    setMinPrice(0);
    setMaxPrice(1000);
    setWaterproof(undefined);
    setShockproof(undefined);
    setDustproof(undefined);
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
    <>
      <Head>
        <title>Protective Cases - Find the Perfect Case for Your Music Gear</title>
      </Head>
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
                  {types.map((type) => (
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
                  {brands.map((brand) => (
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
                    indeterminate={waterproof === undefined}
                    onChange={() => handleBooleanFilterChange(waterproof, setWaterproof)}
                  />
                  <Checkbox
                    id="feature-shockproof"
                    label="Shockproof"
                    checked={shockproof === true}
                    indeterminate={shockproof === undefined}
                    onChange={() => handleBooleanFilterChange(shockproof, setShockproof)}
                  />
                  <Checkbox
                    id="feature-dustproof"
                    label="Dustproof"
                    checked={dustproof === true}
                    indeterminate={dustproof === undefined}
                    onChange={() => handleBooleanFilterChange(dustproof, setDustproof)}
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
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    options={[
                      { value: 'rating', label: 'Rating' },
                      { value: 'price', label: 'Price' },
                      { value: 'name', label: 'Name' }
                    ]}
                    className="flex-grow"
                  />
                  <button
                    onClick={() => {
                      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      setPage(1);
                    }}
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
                <pre className="mt-2 text-xs overflow-auto max-h-40">{JSON.stringify(error, null, 2)}</pre>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {data?.filterCases?.items?.length || 0} of {data?.filterCases?.pagination?.total || 0} items
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
                {data?.filterCases?.items?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.filterCases.items.map((caseItem: any) => (
                      <Card
                        key={caseItem.id}
                        title={caseItem.name}
                        image={caseItem.imageUrl || '/images/placeholder-case.jpg'}
                        description={`${caseItem.brand || 'Unbranded'} • ${caseItem.type}`}
                        link={`/cases/${caseItem.id}`}
                        badges={[
                          caseItem.protectionLevel && caseItem.protectionLevel.charAt(0).toUpperCase() + caseItem.protectionLevel.slice(1),
                          caseItem.waterproof && 'Waterproof',
                          caseItem.shockproof && 'Shockproof'
                        ].filter(Boolean)}
                        price={caseItem.price ? formatPrice(caseItem.price, caseItem.currency) : undefined}
                        rating={caseItem.rating}
                        reviewCount={caseItem.reviewCount}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cases found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters or search criteria.</p>
                    <Button onClick={clearFilters} variant="primary">Clear Filters</Button>
                  </div>
                )}
                
                {/* Pagination */}
                {data?.filterCases?.pagination?.pages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={data.filterCases.pagination.pages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CasesPage;
