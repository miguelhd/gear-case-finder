import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// Collection card component
const CollectionCard = ({ name, count, lastUpdated }) => {
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
          >
            View
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

const DatabasePage = () => {
  // Mock data for collections
  const collections = [
    {
      id: 'audioGear',
      name: 'AudioGear',
      count: 248,
      lastUpdated: '2 hours ago'
    },
    {
      id: 'case',
      name: 'Case',
      count: 573,
      lastUpdated: '2 hours ago'
    },
    {
      id: 'gearCaseMatch',
      name: 'GearCaseMatch',
      count: 1024,
      lastUpdated: '2 hours ago'
    },
    {
      id: 'user',
      name: 'User',
      count: 15,
      lastUpdated: '5 days ago'
    },
    {
      id: 'content',
      name: 'Content',
      count: 42,
      lastUpdated: '1 week ago'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      count: 156,
      lastUpdated: '1 day ago'
    },
    {
      id: 'affiliate',
      name: 'Affiliate',
      count: 28,
      lastUpdated: '3 days ago'
    }
  ];

  const [importSource, setImportSource] = useState('files');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    setIsImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false);
      setSelectedFiles([]);
    }, 2000);
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
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
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
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} {...collection} />
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
              >
                Rebuild Indexes
              </button>
            </div>
            <div>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Validate Data
              </button>
            </div>
            <div>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Export Data
              </button>
            </div>
            <div>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Clear Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DatabasePage;
