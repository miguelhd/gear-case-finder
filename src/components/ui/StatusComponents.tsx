import React from 'react';

// Loading spinner component
const LoadingSpinner = ({ message }: { message?: string }) => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    <span className="ml-3 text-gray-600">{message || "Loading..."}</span>
  </div>
);

// Error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">
          {message}
        </p>
      </div>
    </div>
  </div>
);

// Empty state component
interface EmptyStateProps {
  message: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ message, description, actionLabel, onAction, action }: EmptyStateProps) => (
  <div className="text-center py-12 px-4">
    <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
    {description && (
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    )}
    {(actionLabel && onAction) || action ? (
      <div className="mt-6">
        <button
          type="button"
          onClick={action ? action.onClick : onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {action ? action.label : actionLabel}
        </button>
      </div>
    ) : null}
  </div>
);

export { LoadingSpinner, ErrorMessage, EmptyState };
