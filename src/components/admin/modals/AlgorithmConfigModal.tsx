import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase';

interface AlgorithmParameter {
  id: string;
  name: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

interface AlgorithmConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (parameters: AlgorithmParameter[]) => void;
  isProcessing: boolean;
}

const AlgorithmConfigModal: React.FC<AlgorithmConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isProcessing
}) => {
  const [parameters, setParameters] = useState<AlgorithmParameter[]>([
    {
      id: 'dimensionWeight',
      name: 'Dimension Weight',
      description: 'Weight given to dimensional fit in the matching algorithm',
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.05
    },
    {
      id: 'protectionWeight',
      name: 'Protection Weight',
      description: 'Weight given to protection level in the matching algorithm',
      value: 0.25,
      min: 0,
      max: 1,
      step: 0.05
    },
    {
      id: 'featureWeight',
      name: 'Feature Weight',
      description: 'Weight given to feature compatibility in the matching algorithm',
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.05
    },
    {
      id: 'ratingWeight',
      name: 'Rating Weight',
      description: 'Weight given to user ratings in the matching algorithm',
      value: 0.15,
      min: 0,
      max: 1,
      step: 0.05
    },
    {
      id: 'dimensionThreshold',
      name: 'Dimension Threshold',
      description: 'Minimum percentage of space that gear should occupy in a case',
      value: 70,
      min: 50,
      max: 95,
      step: 5
    },
    {
      id: 'confidenceThreshold',
      name: 'Confidence Threshold',
      description: 'Minimum confidence score required for a match to be considered valid',
      value: 60,
      min: 0,
      max: 100,
      step: 5
    }
  ]);

  // Load current algorithm parameters from API
  useEffect(() => {
    if (isOpen) {
      const fetchParameters = async () => {
        try {
          const response = await fetch('/api/admin/matching/parameters');
          if (response.ok) {
            const data = await response.json();
            if (data.parameters && Array.isArray(data.parameters)) {
              setParameters(prevParams => {
                return prevParams.map(param => {
                  const matchingParam = data.parameters.find((p: any) => p.id === param.id);
                  return matchingParam ? { ...param, value: matchingParam.value } : param;
                });
              });
            }
          }
        } catch (error) {
          console.error('Error fetching algorithm parameters:', error);
        }
      };

      fetchParameters();
    }
  }, [isOpen]);

  const handleParameterChange = (id: string, value: number) => {
    setParameters(prevParams => 
      prevParams.map(param => 
        param.id === id ? { ...param, value } : param
      )
    );
  };

  const handleSave = () => {
    onSave(parameters);
  };

  // Calculate total weight to ensure it equals 1.0
  const totalWeight = parameters
    .filter(p => ['dimensionWeight', 'protectionWeight', 'featureWeight', 'ratingWeight'].includes(p.id))
    .reduce((sum, param) => sum + param.value, 0);
  
  const weightError = Math.abs(totalWeight - 1) > 0.001;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Matching Algorithm"
      maxWidth="max-w-3xl"
      footer={
        <>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing || weightError}
            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
              isProcessing || weightError
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            }`}
          >
            {isProcessing ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Cancel
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-500">
          Configure the parameters used by the matching algorithm to find compatible cases for audio gear.
        </p>

        {weightError && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Weight Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The sum of weights must equal 1.0. Current sum: {totalWeight.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Algorithm Weights</h4>
          <p className="text-xs text-gray-500">These weights determine the importance of each factor in the matching algorithm. The sum must equal 1.0.</p>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {parameters
              .filter(param => ['dimensionWeight', 'protectionWeight', 'featureWeight', 'ratingWeight'].includes(param.id))
              .map(param => (
                <div key={param.id} className="rounded-md border border-gray-200 p-4">
                  <label htmlFor={param.id} className="block text-sm font-medium text-gray-700">
                    {param.name} ({(param.value * 100).toFixed(0)}%)
                  </label>
                  <p className="mt-1 text-xs text-gray-500">{param.description}</p>
                  <input
                    type="range"
                    id={param.id}
                    name={param.id}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={param.value}
                    onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                    className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{param.min}</span>
                    <span>{param.max}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Threshold Settings</h4>
          <p className="text-xs text-gray-500">These thresholds determine when matches are considered valid.</p>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {parameters
              .filter(param => ['dimensionThreshold', 'confidenceThreshold'].includes(param.id))
              .map(param => (
                <div key={param.id} className="rounded-md border border-gray-200 p-4">
                  <label htmlFor={param.id} className="block text-sm font-medium text-gray-700">
                    {param.name} ({param.value}%)
                  </label>
                  <p className="mt-1 text-xs text-gray-500">{param.description}</p>
                  <input
                    type="range"
                    id={param.id}
                    name={param.id}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={param.value}
                    onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                    className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{param.min}%</span>
                    <span>{param.max}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

export default AlgorithmConfigModal;
