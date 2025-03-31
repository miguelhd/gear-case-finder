import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { IGearCaseMatch } from '../../../lib/models/gear-models';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../../components/ui/StatusComponents';

// Component for the Match Management page
const MatchManagementPage = () => {
  // State for match data
  const [matches, setMatches] = useState<IGearCaseMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGearType, setFilterGearType] = useState<string>('');
  const [filterCaseType, setFilterCaseType] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');
  const [sortField, setSortField] = useState<string>('compatibilityScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for gear and case types (for filter dropdowns)
  const [gearTypes, setGearTypes] = useState<string[]>([]);
  const [caseTypes, setCaseTypes] = useState<string[]>([]);
  
  // State for selected match (for edit/delete operations)
  const [selectedMatch, setSelectedMatch] = useState<IGearCaseMatch | null>(null);
  
  // State for modal visibility
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  
  // Fetch match data
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', itemsPerPage.toString());
        params.append('sort', sortField);
        params.append('direction', sortDirection);
        
        if (searchTerm) params.append('search', searchTerm);
        if (filterGearType) params.append('gearType', filterGearType);
        if (filterCaseType) params.append('caseType', filterCaseType);
        if (minScore) params.append('minScore', minScore);
        if (maxScore) params.append('maxScore', maxScore);
        
        // Fetch data from API
        const response = await fetch(`/api/admin/matches?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch match data');
        }
        
        const data = await response.json();
        setMatches(data.items);
        setTotalItems(data.total);
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    // Fetch match data from the API
    fetchMatches();
    
    // Extract unique gear and case types for filters
    const fetchGearAndCaseTypes = async () => {
      try {
        const response = await fetch('/api/admin/matches/gear-case-types');
        if (!response.ok) {
          throw new Error('Failed to fetch gear and case types');
        }
        const data = await response.json();
        setGearTypes(data.gearTypes);
        setCaseTypes(data.caseTypes);
      } catch (err) {
        console.error('Error fetching gear and case types:', err);
        // Fallback to extracting from current items if API fails
        const uniqueGearTypes = [...new Set(matches.map(match => match.gear?.type).filter(Boolean))] as string[];
        const uniqueCaseTypes = [...new Set(matches.map(match => match.case?.type).filter(Boolean))] as string[];
        setGearTypes(uniqueGearTypes);
        setCaseTypes(uniqueCaseTypes);
      }
    };

    // Fetch gear and case types for filters
    fetchGearAndCaseTypes();
  }, [currentPage, itemsPerPage, searchTerm, filterGearType, filterCaseType, minScore, maxScore, sortField, sortDirection]);
  
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
  
  // Handle gear type filter change
  const handleGearTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterGearType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle case type filter change
  const handleCaseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCaseType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle min score change
  const handleMinScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinScore(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle max score change
  const handleMaxScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxScore(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending for score fields, ascending for others
      setSortField(field);
      setSortDirection(field.includes('Score') ? 'desc' : 'asc');
    }
  };
  
  // Handle add match
  const handleAddMatch = () => {
    setShowAddModal(true);
  };
  
  // Handle edit match
  const handleEditMatch = (match: IGearCaseMatch) => {
    setSelectedMatch(match);
    setShowEditModal(true);
  };
  
  // Handle delete match
  const handleDeleteMatch = (match: IGearCaseMatch) => {
    setSelectedMatch(match);
    setShowDeleteModal(true);
  };
  
  // Handle view details
  const handleViewDetails = (match: IGearCaseMatch) => {
    setSelectedMatch(match);
    setShowDetailsModal(true);
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
  
  // Handle run matching algorithm
  const handleRunMatching = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/matches?action=run-matching', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to run matching algorithm');
      }
      
      const data = await response.json();
      alert(`Matching algorithm executed successfully. ${data.matchesCreated} new matches created.`);
      
      // Refresh the data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run matching algorithm');
      setLoading(false);
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
    <AdminLayout title="Match Management" subtitle="View, add, edit, and delete gear-case matches">
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
              placeholder="Search matches..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="gearType" className="block text-sm font-medium text-gray-700 mb-1">Gear Type</label>
            <select
              id="gearType"
              value={filterGearType}
              onChange={handleGearTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Gear Types</option>
              {gearTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
            <select
              id="caseType"
              value={filterCaseType}
              onChange={handleCaseTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Case Types</option>
              {caseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minScore" className="block text-sm font-medium text-gray-700 mb-1">Min Compatibility Score</label>
            <input
              type="number"
              id="minScore"
              value={minScore}
              onChange={handleMinScoreChange}
              placeholder="Min Score"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-1">Max Compatibility Score</label>
            <input
              type="number"
              id="maxScore"
              value={maxScore}
              onChange={handleMaxScoreChange}
              placeholder="Max Score"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <div className="flex space-x-2 mb-2 sm:mb-0">
            <button
              onClick={handleAddMatch}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Match
            </button>
            <button
              onClick={handleRunMatching}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Run Matching
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
          <LoadingSpinner message="Loading matches..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : matches.length === 0 ? (
          <EmptyState 
            message="No matches found" 
            description="Try adjusting your filters or run the matching algorithm to generate matches."
            action={{
              label: "Run Matching",
              onClick: handleRunMatching
            }}
          />
        ) : (
          <>
            {/* Matches Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('gear.name')}
                    >
                      Gear
                      {sortField === 'gear.name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('case.name')}
                    >
                      Case
                      {sortField === 'case.name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('compatibilityScore')}
                    >
                      Compatibility
                      {sortField === 'compatibilityScore' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('dimensionScore')}
                    >
                      Dimension Fit
                      {sortField === 'dimensionScore' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('userFeedbackScore')}
                    >
                      User Feedback
                      {sortField === 'userFeedbackScore' && (
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
                  {matches.map((match) => (
                    <tr key={match._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {match.gear?.imageUrl && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img className="h-10 w-10 rounded-md object-cover" src={match.gear.imageUrl} alt={match.gear.name} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{match.gear?.name || 'Unknown Gear'}</div>
                            <div className="text-xs text-gray-500">{match.gear?.brand || 'Unknown Brand'}</div>
                            <div className="text-xs text-gray-500">{match.gear?.type || 'Unknown Type'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {match.case?.imageUrl && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img className="h-10 w-10 rounded-md object-cover" src={match.case.imageUrl} alt={match.case.name} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{match.case?.name || 'Unknown Case'}</div>
                            <div className="text-xs text-gray-500">{match.case?.brand || 'Unknown Brand'}</div>
                            <div className="text-xs text-gray-500">{match.case?.type || 'Unknown Type'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                match.compatibilityScore >= 80 ? 'bg-green-600' :
                                match.compatibilityScore >= 60 ? 'bg-yellow-400' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${match.compatibilityScore}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-700">{match.compatibilityScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                match.dimensionScore >= 80 ? 'bg-green-600' :
                                match.dimensionScore >= 60 ? 'bg-yellow-400' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${match.dimensionScore}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-700">{match.dimensionScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700">
                            {match.positiveFeedbackCount} 👍 / {match.negativeFeedbackCount} 👎
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(match)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleEditMatch(match)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMatch(match)}
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
      {/* Add Match Modal */}
      {/* Edit Match Modal */}
      {/* Delete Match Modal */}
      {/* Details Modal */}
      {/* Import Modal */}
    </AdminLayout>
  );
};

export default MatchManagementPage;
