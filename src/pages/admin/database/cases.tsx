import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { ICase } from '../../../lib/models/gear-models';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../../components/ui/StatusComponents';

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
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    // Fetch case data from the API
    fetchCases();
    
    // Extract unique types, brands, and protection levels for filters
    const fetchTypesAndBrands = async () => {
      try {
        const response = await fetch('/api/admin/cases/types-brands');
        if (!response.ok) {
          throw new Error('Failed to fetch types and brands');
        }
        const data = await response.json();
        setTypes(data.types);
        setBrands(data.brands);
      } catch (err) {
        console.error('Error fetching types and brands:', err);
        // Fallback to extracting from current items if API fails
        const uniqueTypes = [...new Set(cases.map(item => item.type))];
        const uniqueBrands = [...new Set(cases.map(item => item.brand))];
        setTypes(uniqueTypes);
        setBrands(uniqueBrands);
      }
    };

    // Fetch case data
    fetchCases();
    
    // Fetch types and brands for filters
    fetchTypesAndBrands();
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
  const pageNumbers: (number | string)[] = [];
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
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search cases..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="type"
              value={filterType}
              onChange={handleTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              id="brand"
              value={filterBrand}
              onChange={handleBrandChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="protectionLevel" className="block text-sm font-medium text-gray-700 mb-1">Protection Level</label>
            <select
              id="protectionLevel"
              value={filterProtectionLevel}
              onChange={handleProtectionLevelChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Protection Levels</option>
              {protectionLevels.map(level => (
                <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={handleMinPriceChange}
              placeholder="Min Price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              placeholder="Max Price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <div className="flex space-x-2 mb-2 sm:mb-0">
            <button
              onClick={handleAddCase}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Case
            </button>
            <button
              onClick={handleImport}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Import
            </button>
            <button
              onClick={handleExport}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Export
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>
        
        {/* Status Components */}
        {loading ? (
          <LoadingSpinner message="Loading cases..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : cases.length === 0 ? (
          <EmptyState 
            message="No cases found" 
            description="Try adjusting your filters or add some cases to get started."
            action={{
              label: "Add Case",
              onClick: handleAddCase
            }}
          />
        ) : (
          <>
            {/* Cases Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('name')}
                    >
                      Name
                      {sortField === 'name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('brand')}
                    >
                      Brand
                      {sortField === 'brand' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('type')}
                    >
                      Type
                      {sortField === 'type' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('dimensions.interior.length')}
                    >
                      Dimensions (L×W×H)
                      {sortField === 'dimensions.interior.length' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('price')}
                    >
                      Price
                      {sortField === 'price' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('protectionLevel')}
                    >
                      Protection
                      {sortField === 'protectionLevel' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
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
                          {caseItem.imageUrl && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img className="h-10 w-10 rounded-md object-cover" src={caseItem.imageUrl} alt={caseItem.name} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{caseItem.name}</div>
                            {caseItem.productUrl && (
                              <a href={caseItem.productUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-900">
                                View Product
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.dimensions?.interior ? (
                          <div>
                            <div>
                              {caseItem.dimensions.interior.length} × {caseItem.dimensions.interior.width} × {caseItem.dimensions.interior.height} {caseItem.dimensions.interior.unit}
                            </div>
                            <div className="text-xs text-gray-400">
                              (Interior)
                            </div>
                          </div>
                        ) : caseItem.internalDimensions ? (
                          <div>
                            {caseItem.internalDimensions.length} × {caseItem.internalDimensions.width} × {caseItem.internalDimensions.height} {caseItem.internalDimensions.unit}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.price ? `${caseItem.price} ${caseItem.currency || 'USD'}` : 'N/A'}
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
            
            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                {pageNumbers.map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        page === currentPage ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={index}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      {page}
                    </span>
                  )
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
      
      {/* Modals would be implemented here */}
      {/* Add Case Modal */}
      {/* Edit Case Modal */}
      {/* Delete Case Modal */}
      {/* Import Modal */}
    </AdminLayout>
  );
};

export default CaseManagementPage;
