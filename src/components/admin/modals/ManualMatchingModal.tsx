import React, { useState } from 'react';
import ModalBase from './ModalBase';

interface ManualMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunMatching: (options: ManualMatchingOptions) => void;
  isProcessing: boolean;
}

export interface ManualMatchingOptions {
  gearIds: string[];
  caseIds: string[];
  matchAll: boolean;
  useCustomParameters: boolean;
  parameters?: Record<string, number>;
}

const ManualMatchingModal: React.FC<ManualMatchingModalProps> = ({
  isOpen,
  onClose,
  onRunMatching,
  isProcessing
}) => {
  const [matchingOptions, setMatchingOptions] = useState<ManualMatchingOptions>({
    gearIds: [],
    caseIds: [],
    matchAll: false,
    useCustomParameters: false,
    parameters: {}
  });
  
  const [gearOptions, setGearOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [caseOptions, setCaseOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [searchGear, setSearchGear] = useState('');
  const [searchCase, setSearchCase] = useState('');

  // Fetch gear and case options when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      // Fetch gear options
      const gearResponse = await fetch('/api/admin/gear?limit=100');
      if (gearResponse.ok) {
        const gearData = await gearResponse.json();
        setGearOptions(
          gearData.items.map((gear: any) => ({
            value: gear._id,
            label: `${gear.name} (${gear.brand})`
          }))
        );
      }

      // Fetch case options
      const caseResponse = await fetch('/api/admin/cases?limit=100');
      if (caseResponse.ok) {
        const caseData = await caseResponse.json();
        setCaseOptions(
          caseData.items.map((caseItem: any) => ({
            value: caseItem._id,
            label: `${caseItem.name} (${caseItem.brand})`
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleGearSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setMatchingOptions(prev => ({
      ...prev,
      gearIds: selectedOptions
    }));
  };

  const handleCaseSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setMatchingOptions(prev => ({
      ...prev,
      caseIds: selectedOptions
    }));
  };

  const handleMatchAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMatchingOptions(prev => ({
      ...prev,
      matchAll: e.target.checked
    }));
  };

  const handleUseCustomParametersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMatchingOptions(prev => ({
      ...prev,
      useCustomParameters: e.target.checked
    }));
  };

  const handleParameterChange = (id: string, value: number) => {
    setMatchingOptions(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [id]: value
      }
    }));
  };

  const handleRunMatching = () => {
    onRunMatching(matchingOptions);
  };

  const filteredGearOptions = gearOptions.filter(option => 
    option.label.toLowerCase().includes(searchGear.toLowerCase())
  );

  const filteredCaseOptions = caseOptions.filter(option => 
    option.label.toLowerCase().includes(searchCase.toLowerCase())
  );

  const isValid = (
    (matchingOptions.matchAll || 
     (matchingOptions.gearIds.length > 0 && matchingOptions.caseIds.length > 0))
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Run Manual Matching"
      maxWidth="max-w-3xl"
      footer={
        <>
          <button
            type="button"
            onClick={handleRunMatching}
            disabled={isProcessing || !isValid}
            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
              isProcessing || !isValid
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Run Matching'}
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
          Run the matching algorithm manually to find compatible cases for audio gear.
        </p>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="matchAll"
              name="matchAll"
              type="checkbox"
              checked={matchingOptions.matchAll}
              onChange={handleMatchAllChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="matchAll" className="ml-2 block text-sm font-medium leading-6 text-gray-900">
              Match all gear with all cases
            </label>
          </div>
          
          <p className="text-xs text-gray-500">
            {matchingOptions.matchAll 
              ? "This will run the matching algorithm on all gear and case combinations in the database. This may take some time."
              : "Select specific gear and cases to match. You can select multiple items by holding Ctrl/Cmd while clicking."}
          </p>
        </div>

        {!matchingOptions.matchAll && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="gearIds" className="block text-sm font-medium text-gray-700">
                Select Audio Gear
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Search gear..."
                  value={searchGear}
                  onChange={(e) => setSearchGear(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mt-1 relative">
                <select
                  id="gearIds"
                  name="gearIds"
                  multiple
                  size={6}
                  value={matchingOptions.gearIds}
                  onChange={handleGearSelectionChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions ? (
                    <option disabled>Loading...</option>
                  ) : (
                    filteredGearOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  )}
                </select>
                {matchingOptions.gearIds.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    {matchingOptions.gearIds.length} item(s) selected
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="caseIds" className="block text-sm font-medium text-gray-700">
                Select Cases
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchCase}
                  onChange={(e) => setSearchCase(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mt-1 relative">
                <select
                  id="caseIds"
                  name="caseIds"
                  multiple
                  size={6}
                  value={matchingOptions.caseIds}
                  onChange={handleCaseSelectionChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions ? (
                    <option disabled>Loading...</option>
                  ) : (
                    filteredCaseOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  )}
                </select>
                {matchingOptions.caseIds.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    {matchingOptions.caseIds.length} item(s) selected
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="useCustomParameters"
              name="useCustomParameters"
              type="checkbox"
              checked={matchingOptions.useCustomParameters}
              onChange={handleUseCustomParametersChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="useCustomParameters" className="ml-2 block text-sm font-medium leading-6 text-gray-900">
              Use custom parameters for this run
            </label>
          </div>
          
          {matchingOptions.useCustomParameters && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4 p-4 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="dimensionWeight" className="block text-sm font-medium text-gray-700">
                  Dimension Weight
                </label>
                <input
                  type="range"
                  id="dimensionWeight"
                  name="dimensionWeight"
                  min={0}
                  max={1}
                  step={0.05}
                  value={matchingOptions.parameters?.dimensionWeight || 0.4}
                  onChange={(e) => handleParameterChange('dimensionWeight', parseFloat(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-1 text-xs text-gray-500 text-center">
                  {(matchingOptions.parameters?.dimensionWeight || 0.4).toFixed(2)}
                </div>
              </div>
              
              <div>
                <label htmlFor="protectionWeight" className="block text-sm font-medium text-gray-700">
                  Protection Weight
                </label>
                <input
                  type="range"
                  id="protectionWeight"
                  name="protectionWeight"
                  min={0}
                  max={1}
                  step={0.05}
                  value={matchingOptions.parameters?.protectionWeight || 0.25}
                  onChange={(e) => handleParameterChange('protectionWeight', parseFloat(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-1 text-xs text-gray-500 text-center">
                  {(matchingOptions.parameters?.protectionWeight || 0.25).toFixed(2)}
                </div>
              </div>
              
              <div>
                <label htmlFor="featureWeight" className="block text-sm font-medium text-gray-700">
                  Feature Weight
                </label>
                <input
                  type="range"
                  id="featureWeight"
                  name="featureWeight"
                  min={0}
                  max={1}
                  step={0.05}
                  value={matchingOptions.parameters?.featureWeight || 0.2}
                  onChange={(e) => handleParameterChange('featureWeight', parseFloat(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-1 text-xs text-gray-500 text-center">
                  {(matchingOptions.parameters?.featureWeight || 0.2).toFixed(2)}
                </div>
              </div>
              
              <div>
                <label htmlFor="ratingWeight" className="block text-sm font-medium text-gray-700">
                  Rating Weight
                </label>
                <input
                  type="range"
                  id="ratingWeight"
                  name="ratingWeight"
                  min={0}
                  max={1}
                  step={0.05}
                  value={matchingOptions.parameters?.ratingWeight || 0.15}
                  onChange={(e) => handleParameterChange('ratingWeight', parseFloat(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-1 text-xs text-gray-500 text-center">
                  {(matchingOptions.parameters?.ratingWeight || 0.15).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
};

export default ManualMatchingModal;
