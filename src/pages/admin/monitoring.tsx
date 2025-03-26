import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

// Log entry component
const LogEntry = ({ timestamp, level, source, message }) => {
  const levelColors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    debug: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="px-4 py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${levelColors[level]}`}>
            {level.toUpperCase()}
          </span>
          <span className="ml-2 text-sm text-gray-500">{timestamp}</span>
          <span className="ml-2 text-sm font-medium text-gray-700">{source}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div className="mt-1 text-sm text-gray-900">
        {message}
      </div>
    </div>
  );
};

// System health card component
const HealthCard = ({ name, status, value, description }) => {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{name}</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

const MonitoringPage = () => {
  // Mock data for logs
  const logs = [
    {
      id: 1,
      timestamp: '2025-03-26 18:45:12',
      level: 'info',
      source: 'Amazon Scraper',
      message: 'Scraper started for category: Audio Equipment'
    },
    {
      id: 2,
      timestamp: '2025-03-26 18:47:35',
      level: 'warning',
      source: 'Amazon Scraper',
      message: 'Rate limiting detected, slowing down requests'
    },
    {
      id: 3,
      timestamp: '2025-03-26 18:52:08',
      level: 'info',
      source: 'Amazon Scraper',
      message: 'Scraper completed. 124 products scraped successfully'
    },
    {
      id: 4,
      timestamp: '2025-03-26 19:01:45',
      level: 'error',
      source: 'Database Import',
      message: 'Failed to import 3 products due to validation errors'
    },
    {
      id: 5,
      timestamp: '2025-03-26 19:05:22',
      level: 'info',
      source: 'Database Import',
      message: 'Successfully imported 121 products to AudioGear collection'
    },
    {
      id: 6,
      timestamp: '2025-03-26 19:10:17',
      level: 'debug',
      source: 'Match Algorithm',
      message: 'Processing matches for gear ID: 5f8d43e1c812d8e6b324a123'
    }
  ];

  // Mock data for system health
  const healthMetrics = [
    {
      id: 'cpu',
      name: 'CPU Usage',
      status: 'healthy',
      value: '12%',
      description: 'Average over last 5 minutes'
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      status: 'healthy',
      value: '1.2 GB',
      description: '30% of available memory'
    },
    {
      id: 'disk',
      name: 'Disk Space',
      status: 'warning',
      value: '75%',
      description: '25% free space remaining'
    },
    {
      id: 'api',
      name: 'API Response',
      status: 'healthy',
      value: '120 ms',
      description: 'Average response time'
    },
    {
      id: 'database',
      name: 'Database',
      status: 'healthy',
      value: 'Connected',
      description: 'MongoDB Atlas - M0 Cluster'
    },
    {
      id: 'scrapers',
      name: 'Scrapers',
      status: 'healthy',
      value: '5/5',
      description: 'All scrapers operational'
    }
  ];

  const [logFilter, setLogFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  return (
    <AdminLayout title="Monitoring" subtitle="Monitor system health and logs">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {healthMetrics.map((metric) => (
          <HealthCard key={metric.id} {...metric} />
        ))}
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Logs</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">View and filter system activity logs</p>
          </div>
          <div className="flex space-x-3">
            <select
              id="log-filter"
              name="log-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
            <select
              id="time-range"
              name="time-range"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <LogEntry key={log.id} {...log} />
            ))
          ) : (
            <div className="px-4 py-5 text-center text-sm text-gray-500">
              No logs found matching the current filters.
            </div>
          )}
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download Logs
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Performance Metrics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">System performance over time</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Performance charts will be displayed here</p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              CPU Usage
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Memory Usage
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              API Response Time
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MonitoringPage;
