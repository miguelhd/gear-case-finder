import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const SettingsPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Gear Case Finder',
    siteDescription: 'Find the perfect case for your audio gear',
    adminEmail: 'admin@gearcasefinder.com',
    resultsPerPage: 20
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    connectionString: process.env.MONGODB_URI || 'mongodb+srv://user:password@cluster.mongodb.net/database',
    maxConnections: 10,
    connectionTimeout: 30000
  });

  const [scraperSettings, setScraperSettings] = useState({
    concurrentScrapers: 2,
    requestDelay: 1000,
    maxRetries: 3,
    userAgent: 'Mozilla/5.0 (compatible; GearCaseFinder/1.0; +https://gearcasefinder.com/bot)'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    errorAlerts: true,
    successReports: true,
    notificationEmail: 'alerts@gearcasefinder.com'
  });

  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    });
  };

  const handleDatabaseSettingsChange = (e) => {
    const { name, value } = e.target;
    setDatabaseSettings({
      ...databaseSettings,
      [name]: value
    });
  };

  const handleScraperSettingsChange = (e) => {
    const { name, value } = e.target;
    setScraperSettings({
      ...scraperSettings,
      [name]: value
    });
  };

  const handleNotificationSettingsChange = (e) => {
    const { name, type, checked, value } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const saveSettings = (settingType) => {
    // Simulate saving settings
    console.log(`Saving ${settingType} settings`);
    // In a real implementation, this would make an API call to save the settings
  };

  return (
    <AdminLayout title="Settings" subtitle="Configure system settings">
      {/* General Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">General Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Basic application settings</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                id="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <input
                type="email"
                name="adminEmail"
                id="adminEmail"
                value={generalSettings.adminEmail}
                onChange={handleGeneralSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="sm:col-span-6">
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                Site Description
              </label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                rows={3}
                value={generalSettings.siteDescription}
                onChange={handleGeneralSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="resultsPerPage" className="block text-sm font-medium text-gray-700">
                Results Per Page
              </label>
              <input
                type="number"
                name="resultsPerPage"
                id="resultsPerPage"
                value={generalSettings.resultsPerPage}
                onChange={handleGeneralSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => saveSettings('general')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save General Settings
            </button>
          </div>
        </div>
      </div>

      {/* Database Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Database Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">MongoDB connection configuration</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="connectionString" className="block text-sm font-medium text-gray-700">
                Connection String
              </label>
              <input
                type="text"
                name="connectionString"
                id="connectionString"
                value={databaseSettings.connectionString}
                onChange={handleDatabaseSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: mongodb+srv://username:password@cluster.mongodb.net/database
              </p>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="maxConnections" className="block text-sm font-medium text-gray-700">
                Max Connections
              </label>
              <input
                type="number"
                name="maxConnections"
                id="maxConnections"
                value={databaseSettings.maxConnections}
                onChange={handleDatabaseSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="connectionTimeout" className="block text-sm font-medium text-gray-700">
                Connection Timeout (ms)
              </label>
              <input
                type="number"
                name="connectionTimeout"
                id="connectionTimeout"
                value={databaseSettings.connectionTimeout}
                onChange={handleDatabaseSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => saveSettings('database')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Database Settings
            </button>
          </div>
        </div>
      </div>

      {/* Scraper Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Scraper Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Configure scraper behavior</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="concurrentScrapers" className="block text-sm font-medium text-gray-700">
                Concurrent Scrapers
              </label>
              <input
                type="number"
                name="concurrentScrapers"
                id="concurrentScrapers"
                value={scraperSettings.concurrentScrapers}
                onChange={handleScraperSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="requestDelay" className="block text-sm font-medium text-gray-700">
                Request Delay (ms)
              </label>
              <input
                type="number"
                name="requestDelay"
                id="requestDelay"
                value={scraperSettings.requestDelay}
                onChange={handleScraperSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="maxRetries" className="block text-sm font-medium text-gray-700">
                Max Retries
              </label>
              <input
                type="number"
                name="maxRetries"
                id="maxRetries"
                value={scraperSettings.maxRetries}
                onChange={handleScraperSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="sm:col-span-6">
              <label htmlFor="userAgent" className="block text-sm font-medium text-gray-700">
                User Agent
              </label>
              <input
                type="text"
                name="userAgent"
                id="userAgent"
                value={scraperSettings.userAgent}
                onChange={handleScraperSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => saveSettings('scraper')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Scraper Settings
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Configure system notifications</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationSettingsChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                  Email Notifications
                </label>
                <p className="text-gray-500">Receive system notifications via email</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="errorAlerts"
                  name="errorAlerts"
                  type="checkbox"
                  checked={notificationSettings.errorAlerts}
                  onChange={handleNotificationSettingsChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="errorAlerts" className="font-medium text-gray-700">
                  Error Alerts
                </label>
                <p className="text-gray-500">Receive alerts for system errors</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="successReports"
                  name="successReports"
                  type="checkbox"
                  checked={notificationSettings.successReports}
                  onChange={handleNotificationSettingsChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="successReports" className="font-medium text-gray-700">
                  Success Reports
                </label>
                <p className="text-gray-500">Receive reports for successful operations</p>
              </div>
            </div>
            <div className="sm:col-span-6">
              <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700">
                Notification Email
              </label>
              <input
                type="email"
                name="notificationEmail"
                id="notificationEmail"
                value={notificationSettings.notificationEmail}
                onChange={handleNotificationSettingsChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => saveSettings('notification')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
