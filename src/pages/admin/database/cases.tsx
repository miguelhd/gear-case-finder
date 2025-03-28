import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { ICase } from '../../../lib/models/gear-models';

// Component for the Case Management page
const CaseManagementPage = () => {
  // State for case data
  const [cases, setCases] = useState<ICase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterProtectionLevel, setFilterProtectionLevel] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for types, brands, and protection levels (for filter dropdowns)
  const [types, setTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [protectionLevels, setProtectionLevels] = useState<string[]>(['low', 'medium', 'high']);
  
  // State for selected case (for edit/delete operations)
  const [selectedCase, setSelectedCase] = useState<ICase | null>(null);
  
  // State for modal visibility
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  
  // Fetch case data
  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', itemsPerPage.toString());
        params.append('sort', sortField);
        params.append('direction', sortDirection);
        
        if (searchTerm) params.append('search', searchTerm);
        if (filterType) params.append('type', filterType);
        if (filterBrand) params.append('brand', filterBrand);
        if (filterProtectionLevel) params.append('protectionLevel', filterProtectionLevel);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        
        // Fetch data from API
        const response = await fetch(`/api/admin/cases?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch case data');
        }
        
        const data = await response.json();
        setCases(data.items);
        setTotalItems(data.total);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    // For now, use mock data until we implement the API endpoint
    const mockData = [
      {
        _id: '1',
        name: 'Pelican 1510 Case',
        brand: 'Pelican',
        type: 'Hard Case',
        dimensions: {
          interior: {
            length: 19.75,
            width: 11.00,
            height: 7.60,
            unit: 'in'
          },
          exterior: {
            length: 22.00,
            width: 13.81,
            height: 9.00,
            unit: 'in'
          }
        },
        internalDimensions: {
          length: 19.75,
          width: 11.00,
          height: 7.60,
          unit: 'in'
        },
        externalDimensions: {
          length: 22.00,
          width: 13.81,
          height: 9.00,
          unit: 'in'
        },
        weight: {
          value: 13.65,
          unit: 'lb'
        },
        features: ['Watertight', 'Crushproof', 'Dustproof'],
        price: 209.95,
        currency: 'USD',
        rating: 4.8,
        reviewCount: 1245,
        imageUrl: 'https://www.pelican.com/media/catalog/product/cache/e6334a4966a1e6c5b889ad49e2b0d69f/1/5/1510-case-black_3.jpg',
        productUrl: 'https://www.pelican.com/us/en/product/cases/carry-on-case/1510',
        description: 'Carry-on hard case with wheels and extendable handle',
        protectionLevel: 'high',
        waterproof: true,
        shockproof: true,
        hasPadding: true,
        hasCompartments: true,
        hasHandle: true,
        hasWheels: true,
        hasLock: true,
        material: 'Polypropylene',
        color: 'Black',
        marketplace: 'Pelican',
        availability: 'In Stock'
      },
      {
        _id: '2',
        name: 'Gator GK-49 Case',
        brand: 'Gator',
        type: 'Soft Case',
        dimensions: {
          interior: {
            length: 49.00,
            width: 18.00,
            height: 6.00,
            unit: 'in'
          },
          exterior: {
            length: 50.00,
            width: 19.00,
            height: 7.00,
            unit: 'in'
          }
        },
        internalDimensions: {
          length: 49.00,
          width: 18.00,
          height: 6.00,
          unit: 'in'
        },
        externalDimensions: {
          length: 50.00,
          width: 19.00,
          height: 7.00,
          unit: 'in'
        },
        weight: {
          value: 8.5,
          unit: 'lb'
        },
        features: ['Padded', 'Backpack Straps', 'Accessory Pocket'],
        price: 119.99,
        currency: 'USD',
        rating: 4.5,
        reviewCount: 324,
        imageUrl: 'https://www.gatorcases.com/wp-content/uploads/2016/04/GK-49-1.jpg',
        productUrl: 'https://www.gatorcases.com/products/keyboard/lightweight-keyboard-cases/gk-lightweight/49-note-keyboard-case-gk-49/',
        description: 'Lightweight keyboard case for 49-key controllers',
        protectionLevel: 'medium',
        waterproof: false,
        shockproof: true,
        hasPadding: true,
        hasCompartments: true,
        hasHandle: true,
        hasWheels: false,
        hasLock: false,
        material: 'Nylon',
        color: 'Black',
        marketplace: 'Gator',
        availability: 'In Stock'
      },
      {
        _id: '3',
        name: 'SKB 3i-2015-7 Case',
        brand: 'SKB',
        type: 'Hard Case',
        dimensions: {
          interior: {
            length: 20.50,
            width: 15.50,
            height: 7.50,
            unit: 'in'
          },
          exterior: {
            length: 22.00,
            width: 17.00,
            height: 8.00,
            unit: 'in'
          }
        },
        internalDimensions: {
          length: 20.50,
          width: 15.50,
          height: 7.50,
          unit: 'in'
        },
        externalDimensions: {
          length: 22.00,
          width: 17.00,
          height: 8.00,
          unit: 'in'
        },
        weight: {
          value: 12.0,
          unit: 'lb'
        },
        features: ['Waterproof', 'Military-grade', 'Customizable Foam'],
        price: 249.99,
        currency: 'USD',
        rating: 4.9,
        reviewCount: 567,
        imageUrl: 'https://skbcases.com/industrial/img/products/3i-2015-7b/3i-2015-7b-front.jpg',
        productUrl: 'https://skbcases.com/industrial/products/3i-2015-7b.html',
        description: 'Waterproof utility case with cubed foam',
        protectionLevel: 'high',
        waterproof: true,
        shockproof: true,
        hasPadding: true,
        hasCompartments: false,
        hasHandle: true,
        hasWheels: false,
        hasLock: true,
        material: 'Polypropylene',
        color: 'Black',
        marketplace: 'SKB',
        availability: 'In Stock'
      }
    ];
    
    // Use mock data for now
    setCases(mockData as any);
    setTotalItems(mockData.length);
    setLoading(false);
    
    // Extract unique types and brands for filters
    const uniqueTypes = [...new Set(mockData.map(item => item.type))];
    const uniqueBrands = [...new Set(mockData.map(item => item.brand))];
    setTypes(uniqueTypes);
    setBrands(uniqueBrands);
    
    // Uncomment this when the API endpoint is implemented
    // fetchCases();
  }, [currentPage, itemsPerPage, searchTerm, filterType, filterBrand, filterProtectionLevel, minPrice, maxPrice, sortField, sortDirection]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle type filter change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle brand filter change
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBrand(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle protection level filter change
  const handleProtectionLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterProtectionLevel(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle min price change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle max price change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle add case
  const handleAddCase = () => {
    setShowAddModal(true);
  };
  
  // Handle edit case
  const handleEditCase = (caseItem: ICase) => {
    setSelectedCase(caseItem);
    setShowEditModal(true);
  };
  
  // Handle delete case
  const handleDeleteCase = (caseItem: ICase) => {
    setSelectedCase(caseItem);
    setShowDeleteModal(true);
  };
  
  // Handle import
  const handleImport = () => {
    setShowImportModal(true);
  };
  
  // Handle export
  const handleExport = async () => {
    try {
      // In a real implementation, this would call an API endpoint to generate the export
      alert('Export functionality will be implemented in a future update.');
    } catch (err) {
      setError('Failed to export data');
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxPageButtons = 5;
  
  if (totalPages <= maxPageButtons) {
    // Show all pages if there are fewer than maxPageButtons
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Show a subset of pages with ellipsis
    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // In the middle
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
  }
  
  return (
    <AdminLayout title="Case Management" subtitle="View, add, edit, and delete case items">
      {/* Filters and Actions */}
      <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="w-full md:w-1/3">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search cases"
                    type="search"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleAddCase}
                >
                  Add Case
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleImport}
                >
                  Import
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleExport}
                >
                  Export
                </button>
              </div>
            </div>
            
            {/* Additional Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Type Filter */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterType}
                  onChange={handleTypeChange}
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Brand Filter */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                <select
                  id="brand"
                  name="brand"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterBrand}
                  onChange={handleBrandChange}
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              {/* Protection Level Filter */}
              <div>
                <label htmlFor="protectionLevel" className="block text-sm font-medium text-gray-700">Protection Level</label>
                <select
                  id="protectionLevel"
                  name="protectionLevel"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterProtectionLevel}
                  onChange={handleProtectionLevelChange}
                >
                  <option value="">All Levels</option>
                  {protectionLevels.map(level => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              {/* Price Range Filters */}
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Min Price</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="Min"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                />
              </div>
              
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">Max Price</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Case Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">Loading case data...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg className="h-8 w-8 text-red-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-2 text-sm text-red-500">{error}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg className="h-8 w-8 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No cases found. Try adjusting your filters or add some cases.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortField === 'name' && (
                        <svg className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('brand')}
                  >
                    <div className="flex items-center">
                      <span>Brand</span>
                      {sortField === 'brand' && (
                        <svg className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('type')}
                  >
                    <div className="flex items-center">
                      <span>Type</span>
                      {sortField === 'type' && (
                        <svg className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Interior Dimensions
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('protectionLevel')}
                  >
                    <div className="flex items-center">
                      <span>Protection</span>
                      {sortField === 'protectionLevel' && (
                        <svg className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('price')}
                  >
                    <div className="flex items-center">
                      <span>Price</span>
                      {sortField === 'price' && (
                        <svg className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((caseItem) => (
                  <tr key={caseItem._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {caseItem.imageUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={caseItem.imageUrl} alt={caseItem.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{caseItem.name}</div>
                          <div className="text-sm text-gray-500">{caseItem.material}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{caseItem.brand}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {caseItem.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.dimensions?.interior ? 
                        `${caseItem.dimensions.interior.length} x ${caseItem.dimensions.interior.width} x ${caseItem.dimensions.interior.height} ${caseItem.dimensions.interior.unit}` :
                        `${caseItem.internalDimensions.length} x ${caseItem.internalDimensions.width} x ${caseItem.internalDimensions.height} ${caseItem.internalDimensions.unit}`
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        caseItem.protectionLevel === 'high' ? 'bg-green-100 text-green-800' :
                        caseItem.protectionLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {caseItem.protectionLevel ? caseItem.protectionLevel.charAt(0).toUpperCase() + caseItem.protectionLevel.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.price ? `$${caseItem.price.toFixed(2)} ${caseItem.currency || 'USD'}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCase(caseItem)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCase(caseItem)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && cases.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {pageNumbers.map((page, index) => (
                    page === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => handlePageChange(page as number)}
                        className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page ? 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add/Edit/Delete/Import Modals will be implemented here */}
      {/* These will be implemented in the next phase */}
    </AdminLayout>
  );
};

export default CaseManagementPage;
