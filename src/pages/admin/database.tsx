import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// Define the log message type
interface LogMessage {
  id: number;
  timestamp: string;
  message: string;
  type: string;
}

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
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: null as React.ReactNode,
    collection: ''
  });
  
  // Log messages
  const [logMessages, setLogMessages] = useState<LogMessage[]>([]);

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        addLogMessage(`Error fetching collection stats: ${errorMessage}`, 'error');
      }
    };
    
    loadCollectionStats();
  }, []);

  const addLogMessage = (message: string, type = 'info') => {
    const newLog: LogMessage = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogMessages(prev => [newLog, ...prev]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addLogMessage(`Import failed: ${errorMessage}`, 'error');
      setImportStatus('Import failed');
    } finally {
      setIsImporting(false);
      setSelectedFiles([]);
    }
  };

  const handleViewCollection = (collectionName: string) => {
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
              {JSON.stringify([
                { id: '1', name: 'Sample 1', createdAt: new Date().toISOString() },
                { id: '2', name: 'Sample 2', createdAt: new Date().toISOString() },
                { id: '3', name: 'Sample 3', createdAt: new Date().toISOString() }
              ], null, 2)}
            </pre>
          </div>
        </div>
      ),
      collection: collectionName
    });
    setShowModal(true);
  };

  const handleManageCollection = (collectionName: string) => {
    addLogMessage(`Managing collection: ${collectionName}`);
    
    // Redirect to the appropriate management page
    const collectionId = collections.find(c => c.name === collectionName)?.id;
    
    if (collectionId) {
      window.location.href = `/admin/database/${collectionId.toLowerCase()}`;
    }
  };

  const handleExport = async (format: string) => {
    addLogMessage(`Starting export in ${format} format...`);
    
    try {
      // In a real implementation, this would trigger a server-side export
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      addLogMessage(`Export completed successfully. Download started.`, 'success');
      
      // Simulate download by creating a dummy link
      const link = document.createElement('a');
      link.href = '#';
      link.download = `database_export_${Date.now()}.${format}`;
      link.click();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addLogMessage(`Export failed: ${errorMessage}`, 'error');
    }
  };

  const handleBackup = async () => {
    addLogMessage('Starting database backup...');
    
    try {
      // In a real implementation, this would trigger a server-side backup
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      addLogMessage('Database backup completed successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addLogMessage(`Backup failed: ${errorMessage}`, 'error');
    }
  };

  const handleOperation = async (operation: string) => {
    addLogMessage(`Starting operation: ${operation}...`);
    
    try {
      // In a real implementation, this would perform the actual operation
      await performDatabaseOperation(operation);
      
      addLogMessage(`Operation ${operation} completed successfully`, 'success');
      
      // Refresh collection stats after operation
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addLogMessage(`Operation failed: ${errorMessage}`, 'error');
    }
  };

  return (
    <AdminLayout title="Database Management" subtitle="Manage database collections and operations">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Database Management</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  name={collection.name}
                  count={collection.count}
                  lastUpdated={collection.lastUpdated}
                  onView={handleViewCollection}
                  onManage={handleManageCollection}
                />
              ))}
            </div>
            
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Import Data
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Import data from files or external APIs.</p>
                </div>
                <div className="mt-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Import Source
                      </label>
                      <div className="mt-1">
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={importSource}
                          onChange={(e) => setImportSource(e.target.value)}
                          disabled={isImporting}
                        >
                          <option value="files">Files (JSON, CSV)</option>
                          <option value="api">External API</option>
                        </select>
                      </div>
                    </div>
                    
                    {importSource === 'files' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Select Files
                        </label>
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
                            <p className="text-xs text-gray-500">
                              JSON, CSV up to 10MB
                            </p>
                          </div>
                        </div>
                        
                        {selectedFiles.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                            <ul className="mt-1 text-sm text-gray-500">
                              {selectedFiles.map((file, index) => (
                                <li key={index}>{file}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {importSource === 'api' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          API Endpoint
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="https://api.example.com/data"
                            disabled={isImporting}
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Enter the API endpoint to import data from.
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={handleImport}
                        disabled={isImporting || (importSource === 'files' && selectedFiles.length === 0)}
                      >
                        {isImporting ? 'Importing...' : 'Start Import'}
                      </button>
                      
                      {importStatus && (
                        <p className="mt-2 text-sm text-gray-500">
                          Status: {importStatus}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Export & Backup
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Export data or create database backups.</p>
                </div>
                <div className="mt-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Export Format
                      </label>
                      <div className="mt-1 flex space-x-3">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => handleExport('json')}
                        >
                          Export as JSON
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => handleExport('csv')}
                        >
                          Export as CSV
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={handleBackup}
                      >
                        Create Database Backup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Database Operations
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Perform maintenance operations on the database.</p>
                </div>
                <div className="mt-5">
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => handleOperation('optimize')}
                      >
                        Optimize Database
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => handleOperation('validate')}
                      >
                        Validate Data
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => handleOperation('reindex')}
                      >
                        Rebuild Indexes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Operation Log
                </h3>
                <div className="mt-2">
                  <div className="bg-black rounded-md p-4 h-64 overflow-y-auto">
                    {logMessages.map((log) => (
                      <div key={log.id} className={`text-sm ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                        'text-gray-300'
                      }`}>
                        [{log.timestamp}] {log.message}
                      </div>
                    ))}
                    {logMessages.length === 0 && (
                      <div className="text-sm text-gray-500">No operations logged yet.</div>
                    )}
                  </div>
                </div>
              </div>
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
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowModal(false);
                    handleManageCollection(modalContent.collection);
                  }}
                >
                  Manage Collection
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
