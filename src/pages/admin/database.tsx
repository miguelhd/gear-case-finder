import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// API handler for database operations
const performDatabaseOperation = async (operation, data = {}) => {
  try {
    const response = await fetch(`/api/admin/database/${operation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to perform database operation ${operation}:`, error);
    throw error;
  }
};

// API handler for fetching collection stats
const fetchCollectionStats = async () => {
  try {
    const response = await fetch('/api/admin/database/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch collection stats:', error);
    throw error;
  }
};

// Collection card component
const CollectionCard = ({ name, count, lastUpdated, onView, onManage }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{name}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {count} documents • Last updated: {lastUpdated}
        </p>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => onView(name)}
          >
            View
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => onManage(name)}
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

const DatabasePage = () => {
  // Collection data state
  const [collections, setCollections] = useState([
    {
      id: 'audioGear',
      name: 'AudioGear',
      count: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'case',
      name: 'Case',
      count: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'gearCaseMatch',
      name: 'GearCaseMatch',
      count: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'user',
      name: 'User',
      count: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'content',
      name: 'Content',
      count: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      count: 0,
      lastUpdated: 'Never'
    },
    {
      id: 'affiliate',
      name: 'Affiliate',
      count: 0,
      lastUpdated: 'Never'
    }
  ]);

  // Import state
  const [importSource, setImportSource] = useState('files');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: null,
    collection: ''
  });
  
  // Log messages
  const [logMessages, setLogMessages] = useState([]);

  // Fetch collection stats on load
  useEffect(() => {
    const loadCollectionStats = async () => {
      try {
        addLogMessage('Fetching collection statistics...');
        const stats = await fetchCollectionStats();
        
        if (stats && stats.collections) {
          // Update collections with actual data
          setCollections(prev => 
            prev.map(collection => {
              const collectionStats = stats.collections.find(
                c => c.name.toLowerCase() === collection.id.toLowerCase()
              );
              
              if (collectionStats) {
                return {
                  ...collection,
                  count: collectionStats.count,
                  lastUpdated: collectionStats.lastUpdated || 'Never'
                };
              }
              return collection;
            })
          );
          addLogMessage('Collection statistics loaded successfully');
        }
      } catch (error) {
        addLogMessage(`Error fetching collection stats: ${error.message}`, 'error');
      }
    };
    
    loadCollectionStats();
  }, []);

  const addLogMessage = (message, type = 'info') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogMessages(prev => [newLog, ...prev]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files.map(file => file.name));
    addLogMessage(`Selected ${files.length} files for import`);
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportStatus('Importing data...');
    addLogMessage('Starting data import process...');
    
    try {
      if (importSource === 'files') {
        // In a real implementation, this would upload files and process them
        addLogMessage('Uploading files to server...');
        
        // Simulate file upload and processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addLogMessage('Processing imported data...');
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        addLogMessage('Import completed successfully', 'success');
        setImportStatus('Import completed');
        
        // Refresh collection stats
        const stats = await fetchCollectionStats();
        if (stats && stats.collections) {
          setCollections(prev => 
            prev.map(collection => {
              const collectionStats = stats.collections.find(
                c => c.name.toLowerCase() === collection.id.toLowerCase()
              );
              
              if (collectionStats) {
                return {
                  ...collection,
                  count: collectionStats.count,
                  lastUpdated: 'Just now'
                };
              }
              return collection;
            })
          );
        }
      } else {
        // API import
        addLogMessage('Connecting to external API...');
        
        // Simulate API connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addLogMessage('Fetching data from API...');
        
        // Simulate data fetching
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        addLogMessage('Processing API data...');
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addLogMessage('Import from API completed successfully', 'success');
        setImportStatus('Import completed');
      }
    } catch (error) {
      addLogMessage(`Import failed: ${error.message}`, 'error');
      setImportStatus('Import failed');
    } finally {
      setIsImporting(false);
      setSelectedFiles([]);
    }
  };

  const handleViewCollection = (collectionName) => {
    addLogMessage(`Viewing collection: ${collectionName}`);
    
    // In a real implementation, this would fetch and display collection data
    setModalContent({
      title: `${collectionName} Collection`,
      content: (
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            Viewing the first 10 documents in the {collectionName} collection.
          </p>
          <div className="bg-gray-50 p-4 rounded overflow-x-auto">
            <pre className="text-xs">
              {JSON.stringify({ message: "Sample document data would appear here" }, null, 2)}
            </pre>
          </div>
        </div>
      ),
      collection: collectionName
    });
    
    setShowModal(true);
  };

  const handleManageCollection = (collectionName) => {
    addLogMessage(`Managing collection: ${collectionName}`);
    
    // In a real implementation, this would provide collection management options
    setModalContent({
      title: `Manage ${collectionName}`,
      content: (
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Actions
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => {
                    addLogMessage(`Exporting ${collectionName} collection...`);
                    setShowModal(false);
                  }}
                >
                  Export
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  onClick={() => {
                    addLogMessage(`Validating ${collectionName} collection...`);
                    setShowModal(false);
                  }}
                >
                  Validate
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => {
                    addLogMessage(`Rebuilding indexes for ${collectionName} collection...`);
                    setShowModal(false);
                  }}
                >
                  Rebuild Indexes
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    if (confirm(`Are you sure you want to clear the ${collectionName} collection? This action cannot be undone.`)) {
                      addLogMessage(`Clearing ${collectionName} collection...`, 'warning');
                      setShowModal(false);
                    }
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      collection: collectionName
    });
    
    setShowModal(true);
  };

  const performDatabaseOperation = async (operation) => {
    addLogMessage(`Performing database operation: ${operation}...`);
    
    try {
      // In a real implementation, this would call the API
      switch (operation) {
        case 'rebuildIndexes':
          await new Promise(resolve => setTimeout(resolve, 3000));
          addLogMessage('Indexes rebuilt successfully', 'success');
          break;
        case 'validateData':
          await new Promise(resolve => setTimeout(resolve, 2000));
          addLogMessage('Data validation completed: All collections are valid', 'success');
          break;
        case 'exportData':
          await new Promise(resolve => setTimeout(resolve, 4000));
          addLogMessage('Data exported successfully. Download link: #', 'success');
          break;
        case 'clearDatabase':
          if (confirm('Are you sure you want to clear ALL collections? This action cannot be undone.')) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            addLogMessage('Database cleared successfully', 'warning');
            
            // Update collection counts
            setCollections(prev => 
              prev.map(collection => ({
                ...collection,
                count: 0,
                lastUpdated: 'Just now'
              }))
            );
          }
          break;
        default:
          addLogMessage(`Unknown operation: ${operation}`, 'error');
      }
    } catch (error) {
      addLogMessage(`Operation failed: ${error.message}`, 'error');
    }
  };

  return (
    <AdminLayout title="Database" subtitle="Manage database collections and data">
      <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Import Data</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Import scraped data into the database.</p>
          </div>
          <div className="mt-5">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <input
                  id="import-files"
                  name="import-source"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={importSource === 'files'}
                  onChange={() => setImportSource('files')}
                  disabled={isImporting}
                />
                <label htmlFor="import-files" className="ml-2 block text-sm text-gray-700">
                  From Files
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="import-api"
                  name="import-source"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  checked={importSource === 'api'}
                  onChange={() => setImportSource('api')}
                  disabled={isImporting}
                />
                <label htmlFor="import-api" className="ml-2 block text-sm text-gray-700">
                  From API
                </label>
              </div>
            </div>
            
            {importSource === 'files' ? (
              <div>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload files</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          multiple 
                          onChange={handleFileChange}
                          disabled={isImporting}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">JSON files up to 10MB</p>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                    <ul className="mt-1 text-sm text-gray-500">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="api-url" className="block text-sm font-medium text-gray-700">
                    API URL
                  </label>
                  <input
                    type="text"
                    name="api-url"
                    id="api-url"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://api.example.com/data"
                    disabled={isImporting}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <input
                    type="password"
                    name="api-key"
                    id="api-key"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    disabled={isImporting}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="data-type" className="block text-sm font-medium text-gray-700">
                    Data Type
                  </label>
                  <select
                    id="data-type"
                    name="data-type"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    disabled={isImporting}
                  >
                    <option>Audio Gear</option>
                    <option>Cases</option>
                    <option>All Data</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleImport}
                disabled={isImporting || (importSource === 'files' && selectedFiles.length === 0)}
              >
                {isImporting ? importStatus : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Log output */}
      {logMessages.length > 0 && (
        <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Database Logs</h3>
            <button
              type="button"
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setLogMessages([])}
            >
              Clear
            </button>
          </div>
          <div className="border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 max-h-40 overflow-y-auto">
              {logMessages.map((log) => (
                <div key={log.id} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-600' : 
                  log.type === 'warning' ? 'text-yellow-600' : 
                  log.type === 'success' ? 'text-green-600' : ''
                }`}>
                  <span className="font-mono">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard 
            key={collection.id} 
            {...collection} 
            onView={handleViewCollection}
            onManage={handleManageCollection}
          />
        ))}
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Database Operations</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Perform maintenance operations on the database</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => performDatabaseOperation('rebuildIndexes')}
              >
                Rebuild Indexes
              </button>
            </div>
            <div>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                onClick={() => performDatabaseOperation('validateData')}
              >
                Validate Data
              </button>
            </div>
            <div>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => performDatabaseOperation('exportData')}
              >
                Export Data
              </button>
            </div>
            <div>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => performDatabaseOperation('clearDatabase')}
              >
                Clear Database
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {modalContent.title}
                    </h3>
                    <div className="mt-2">
                      {modalContent.content}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DatabasePage;
