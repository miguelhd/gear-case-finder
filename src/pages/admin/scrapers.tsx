import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// Scraper card component
const ScraperCard = ({ name, lastRun, status, description }) => {
  const statusColors = {
    idle: 'bg-gray-100 text-gray-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{name}</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last run: {lastRun || 'Never'}
          </div>
          <div>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Run Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrapersPage = () => {
  // Mock data for scrapers
  const scrapers = [
    {
      id: 'amazon',
      name: 'Amazon Scraper',
      description: 'Scrapes product data from Amazon marketplace',
      lastRun: '2 hours ago',
      status: 'idle'
    },
    {
      id: 'ebay',
      name: 'eBay Scraper',
      description: 'Scrapes product data from eBay marketplace',
      lastRun: '1 day ago',
      status: 'idle'
    },
    {
      id: 'etsy',
      name: 'Etsy Scraper',
      description: 'Scrapes product data from Etsy marketplace',
      lastRun: '3 days ago',
      status: 'idle'
    },
    {
      id: 'aliexpress',
      name: 'AliExpress Scraper',
      description: 'Scrapes product data from AliExpress marketplace',
      lastRun: '1 week ago',
      status: 'idle'
    },
    {
      id: 'temu',
      name: 'Temu Scraper',
      description: 'Scrapes product data from Temu marketplace',
      lastRun: 'Never',
      status: 'idle'
    }
  ];

  const [selectedScrapers, setSelectedScrapers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const toggleScraperSelection = (scraperId) => {
    if (selectedScrapers.includes(scraperId)) {
      setSelectedScrapers(selectedScrapers.filter(id => id !== scraperId));
    } else {
      setSelectedScrapers([...selectedScrapers, scraperId]);
    }
  };

  const runSelectedScrapers = () => {
    if (selectedScrapers.length === 0) return;
    
    setIsRunning(true);
    
    // Simulate API call to run scrapers
    setTimeout(() => {
      setIsRunning(false);
      // Reset selection after running
      setSelectedScrapers([]);
    }, 2000);
  };

  const runAllScrapers = () => {
    setIsRunning(true);
    
    // Simulate API call to run all scrapers
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  return (
    <AdminLayout title="Scrapers" subtitle="Manage and run data scrapers">
      <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Run Scrapers</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Select scrapers to run or run all scrapers at once.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {scrapers.map((scraper) => (
              <div key={scraper.id} className="flex items-center">
                <input
                  id={`scraper-${scraper.id}`}
                  name={`scraper-${scraper.id}`}
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={selectedScrapers.includes(scraper.id)}
                  onChange={() => toggleScraperSelection(scraper.id)}
                  disabled={isRunning}
                />
                <label htmlFor={`scraper-${scraper.id}`} className="ml-2 text-sm text-gray-700">
                  {scraper.name}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-5 flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={runSelectedScrapers}
              disabled={selectedScrapers.length === 0 || isRunning}
            >
              {isRunning ? 'Running...' : `Run Selected (${selectedScrapers.length})`}
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={runAllScrapers}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run All Scrapers'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scrapers.map((scraper) => (
          <ScraperCard key={scraper.id} {...scraper} />
        ))}
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Scraper Schedule</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Configure automatic scraper runs</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="scraper-select" className="block text-sm font-medium text-gray-700">
                Scraper
              </label>
              <select
                id="scraper-select"
                name="scraper-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Scrapers</option>
                {scrapers.map((scraper) => (
                  <option key={scraper.id} value={scraper.id}>{scraper.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="sm:col-span-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ScrapersPage;
