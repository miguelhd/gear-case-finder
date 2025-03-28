import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../../components/admin/StatusComponents';
import CaseModal from '../../../components/admin/modals/CaseModal';
import DeleteConfirmationModal from '../../../components/admin/modals/DeleteConfirmationModal';
import ImportModal from '../../../components/admin/modals/ImportModal';

const CaseManagementPage: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [types, setTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [brands, setBrands] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  
  // Sorting states
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<string>('asc');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Calculate pagination values
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = generatePageNumbers();
  
  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/admin/cases/types-brands');
        if (!response.ok) {
          throw new Error('Failed to fetch filter options');
        }
        const data = await response.json();
        
        setTypes(data.types.map((type: string) => ({ 
          value: type, 
          label: type 
        })));
        
        setBrands(data.brands.map((brand: string) => ({ 
          value: brand, 
          label: brand 
        })));
      } catch (err) {
        console.error('Error fetching filter options:', err);
        // Don't set error state here to avoid blocking the main data fetch
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  // Fetch cases data
  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
          sortField,
          sortDirection
        });
        
        if (selectedType) {
          queryParams.append('type', selectedType);
        }
        
        if (selectedBrand) {
          queryParams.append('brand', selectedBrand);
        }
        
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        
        const response = await fetch(`/api/admin/cases?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cases data');
        }
        
        const data = await response.json();
        setCases(data.items);
        setTotalItems(data.totalItems);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setCases([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCases();
  }, [currentPage, pageSize, sortField, sortDirection, selectedType, selectedBrand, searchQuery]);
  
  // Handle filter changes
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };
  
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrand(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle modal actions
  const handleAddCase = () => {
    setSelectedCase(null);
    setIsAddModalOpen(true);
  };
  
  const handleEditCase = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteCase = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsDeleteModalOpen(true);
  };
  
  const handleImportCase = () => {
    setIsImportModalOpen(true);
  };
  
  // Handle API operations
  const handleSaveCase = async (caseItem: any) => {
    setIsProcessing(true);
    
    try {
      const url = caseItem._id ? `/api/admin/cases?id=${caseItem._id}` : '/api/admin/cases';
      const method = caseItem._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(caseItem)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save case');
      }
      
      // Refresh data
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortField,
        sortDirection
      });
      
      if (selectedType) {
        queryParams.append('type', selectedType);
      }
      
      if (selectedBrand) {
        queryParams.append('brand', selectedBrand);
      }
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const refreshResponse = await fetch(`/api/admin/cases?${queryParams.toString()}`);
      
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh cases data');
      }
      
      const refreshData = await refreshResponse.json();
      setCases(refreshData.items);
      setTotalItems(refreshData.totalItems);
      setTotalPages(refreshData.totalPages);
      
      // Close modals
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error saving case:', err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedCase) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/admin/cases?id=${selectedCase._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete case');
      }
      
      // Refresh data
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortField,
        sortDirection
      });
      
      if (selectedType) {
        queryParams.append('type', selectedType);
      }
      
      if (selectedBrand) {
        queryParams.append('brand', selectedBrand);
      }
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const refreshResponse = await fetch(`/api/admin/cases?${queryParams.toString()}`);
      
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh cases data');
      }
      
      const refreshData = await refreshResponse.json();
      setCases(refreshData.items);
      setTotalItems(refreshData.totalItems);
      setTotalPages(refreshData.totalPages);
      
      // Close modal
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting case:', err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleImport = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/cases/import', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to import cases data');
      }
      
      // Refresh data
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortField,
        sortDirection
      });
      
      if (selectedType) {
        queryParams.append('type', selectedType);
      }
      
      if (selectedBrand) {
        queryParams.append('brand', selectedBrand);
      }
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const refreshResponse = await fetch(`/api/admin/cases?${queryParams.toString()}`);
      
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh cases data');
      }
      
      const refreshData = await refreshResponse.json();
      setCases(refreshData.items);
      setTotalItems(refreshData.totalItems);
      setTotalPages(refreshData.totalPages);
      
      // Close modal
      setIsImportModalOpen(false);
    } catch (err) {
      console.error('Error importing cases:', err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <AdminLayout title="Case Management" subtitle="Manage cases in the database">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Case Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all cases in the database with their details.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            <button
              type="button"
              onClick={handleImportCase}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
            >
              Import
            </button>
            <button
              type="button"
              onClick={handleAddCase}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Case
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mt-4 bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedType}
                onChange={handleTypeChange}
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <select
                id="brand"
                name="brand"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedBrand}
                onChange={handleBrandChange}
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.value} value={brand.value}>
                    {brand.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <form onSubmit={handleSearchSubmit}>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && <LoadingSpinner />}
        
        {/* Error state */}
        {!loading && error && <ErrorMessage message={error} />}
        
        {/* Empty state */}
        {!loading && !error && cases.length === 0 && (
          <EmptyState 
            message="No cases found" 
            actionLabel="Add Case" 
            onAction={handleAddCase} 
          />
        )}
        
        {/* Data table */}
        {!loading && !error && cases.length > 0 && (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          <button
                            className="group inline-flex"
                            onClick={() => handleSort('name')}
                          >
                            Name
                            <span className="ml-2 flex-none rounded text-gray-400">
                              {sortField === 'name' ? (
                                sortDirection === 'asc' ? (
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )
                              ) : (
                                <svg className="h-5 w-5 opacity-0 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          <button
                            className="group inline-flex"
                            onClick={() => handleSort('brand')}
                          >
                            Brand
                            <span className="ml-2 flex-none rounded text-gray-400">
                              {sortField === 'brand' ? (
                                sortDirection === 'asc' ? (
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )
                              ) : (
                                <svg className="h-5 w-5 opacity-0 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          <button
                            className="group inline-flex"
                            onClick={() => handleSort('type')}
                          >
                            Type
                            <span className="ml-2 flex-none rounded text-gray-400">
                              {sortField === 'type' ? (
                                sortDirection === 'asc' ? (
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )
                              ) : (
                                <svg className="h-5 w-5 opacity-0 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Dimensions (mm)
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          <button
                            className="group inline-flex"
                            onClick={() => handleSort('weight')}
                          >
                            Weight (g)
                            <span className="ml-2 flex-none rounded text-gray-400">
                              {sortField === 'weight' ? (
                                sortDirection === 'asc' ? (
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )
                              ) : (
                                <svg className="h-5 w-5 opacity-0 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {cases.map((caseItem) => (
                        <tr key={caseItem._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {caseItem.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{caseItem.brand}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{caseItem.type}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {caseItem.dimensions.width} × {caseItem.dimensions.height} × {caseItem.dimensions.depth}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{caseItem.weight}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
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
              </div>
            </div>
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
      
      {/* Add/Edit/Delete/Import Modals */}
      <CaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCase}
        types={types}
        brands={brands}
        isProcessing={isProcessing}
        mode="add"
      />
      
      <CaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCase}
        caseItem={selectedCase}
        types={types}
        brands={brands}
        isProcessing={isProcessing}
        mode="edit"
      />
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedCase?.name || ''}
        itemType="Case"
        isDeleting={isProcessing}
      />
      
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        itemType="Case"
        isProcessing={isProcessing}
        acceptedFileTypes=".json,.csv"
      />
    </AdminLayout>
  );
};

export default CaseManagementPage;
