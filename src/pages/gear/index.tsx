import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Spinner, Pagination, Select, RangeSlider, Checkbox, Button } from '../../components/ui';
import Head from 'next/head';

// GraphQL query for fetching gear items with pagination and filtering
const GET_GEAR_ITEMS = gql`
  query GetGearItems($filter: GearFilterInput!, $page: Int, $limit: Int) {
    filterGear(filter: $filter, pagination: { page: $page, limit: $limit }) {
      items {
        id
        name
        brand
        category
        type
        imageUrl
        dimensions {
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
    gearCategories: allGear(pagination: { limit: 100 }) {
      items {
        category
      }
    }
    gearBrands: allGear(pagination: { limit: 100 }) {
      items {
        brand
      }
    }
  }
`;

const GearListingPage: React.FC = () => {
  // State for filters
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(12);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState('popularity');
  const [sortDirection, setSortDirection] = React.useState('desc');

  // Query for gear items with filters
  const { loading, error, data } = useQuery(GET_GEAR_ITEMS, {
    variables: {
      filter: {
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined
      },
      page,
      limit
    }
  });

  // Extract unique categories and brands from the data
  const categories = React.useMemo(() => {
    if (!data?.gearCategories?.items) return [] as string[];
    const allCategories = data.gearCategories.items.map((item: any) => item.category);
    return [...new Set(allCategories)].filter(Boolean) as string[];
  }, [data?.gearCategories]);

  const brands = React.useMemo(() => {
    if (!data?.gearBrands?.items) return [] as string[];
    const allBrands = data.gearBrands.items.map((item: any) => item.brand);
    return [...new Set(allBrands)].filter(Boolean) as string[];
  }, [data?.gearBrands]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
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
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSortBy('popularity');
    setSortDirection('desc');
    setPage(1);
  };

  return (
    <>
      <Head>
        <title>Music Gear - Find the Perfect Case for Your Equipment</title>
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Music Gear</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
              
              {/* Categories filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-red-500">Error loading categories</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Checkbox
                        key={category}
                        id={`category-${category}`}
                        label={category}
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
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
                    {brands.map((brand) => (
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
              
              {/* Sort options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</h3>
                <div className="flex items-center space-x-2">
                  <Select
                    id="sort-by"
                    value={sortBy}
                    onChange={handleSortChange}
                    options={[
                      { value: 'popularity', label: 'Popularity' },
                      { value: 'name', label: 'Name' },
                      { value: 'releaseYear', label: 'Release Year' }
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
                <p className="text-red-800 dark:text-red-200">Error loading gear items. Please try again later.</p>
                <pre className="mt-2 text-xs overflow-auto max-h-40">{JSON.stringify(error, null, 2)}</pre>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {data?.filterGear?.items?.length || 0} of {data?.filterGear?.pagination?.total || 0} items
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
                
                {/* Grid of gear items */}
                {data?.filterGear?.items?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.filterGear.items.map((gear: any) => (
                      <Card
                        key={gear.id}
                        title={gear.name}
                        image={gear.imageUrl || '/images/placeholder-gear.jpg'}
                        description={`${gear.brand} • ${gear.category}`}
                        link={`/gear/${gear.id}`}
                        badges={[gear.type]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No gear items found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters or search criteria.</p>
                    <Button onClick={clearFilters} variant="primary">Clear Filters</Button>
                  </div>
                )}
                
                {/* Pagination */}
                {data?.filterGear?.pagination?.pages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={data.filterGear.pagination.pages}
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

export default GearListingPage;
