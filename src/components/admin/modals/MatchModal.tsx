import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase';
import FormField from './FormField';

interface Match {
  _id?: string;
  gearId: string;
  caseId: string;
  confidenceScore: number;
  matchType: string;
  notes: string;
  verified: boolean;
}

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (match: Match) => void;
  match?: Match;
  gearOptions: Array<{ value: string; label: string }>;
  caseOptions: Array<{ value: string; label: string }>;
  matchTypes: Array<{ value: string; label: string }>;
  isProcessing?: boolean;
  mode: 'add' | 'edit';
}

const defaultMatch: Match = {
  gearId: '',
  caseId: '',
  confidenceScore: 0,
  matchType: '',
  notes: '',
  verified: false
};

const MatchModal: React.FC<MatchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  match,
  gearOptions,
  caseOptions,
  matchTypes,
  isProcessing = false,
  mode
}) => {
  const [formData, setFormData] = useState<Match>(defaultMatch);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (match && mode === 'edit') {
      setFormData(match);
    } else {
      setFormData(defaultMatch);
    }
    setErrors({});
  }, [match, isOpen, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.gearId) {
      newErrors.gearId = 'Audio Gear is required';
    }
    
    if (!formData.caseId) {
      newErrors.caseId = 'Case is required';
    }
    
    if (!formData.matchType) {
      newErrors.matchType = 'Match Type is required';
    }
    
    if (formData.confidenceScore < 0 || formData.confidenceScore > 100) {
      newErrors.confidenceScore = 'Confidence Score must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <ModalBase 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'add' ? 'Add Match' : 'Edit Match'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <FormField
              id="gearId"
              label="Audio Gear"
              type="select"
              value={formData.gearId}
              onChange={handleChange}
              required
              error={errors.gearId}
              options={gearOptions}
            />
          </div>
          
          <div className="sm:col-span-3">
            <FormField
              id="caseId"
              label="Case"
              type="select"
              value={formData.caseId}
              onChange={handleChange}
              required
              error={errors.caseId}
              options={caseOptions}
            />
          </div>
          
          <div className="sm:col-span-3">
            <FormField
              id="matchType"
              label="Match Type"
              type="select"
              value={formData.matchType}
              onChange={handleChange}
              required
              error={errors.matchType}
              options={matchTypes}
            />
          </div>
          
          <div className="sm:col-span-3">
            <FormField
              id="confidenceScore"
              label="Confidence Score (%)"
              type="number"
              value={formData.confidenceScore}
              onChange={handleChange}
              required
              error={errors.confidenceScore}
              min={0}
              max={100}
            />
          </div>
          
          <div className="sm:col-span-6">
            <FormField
              id="notes"
              label="Notes"
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter match notes"
            />
          </div>
          
          <div className="sm:col-span-6">
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="verified"
                  name="verified"
                  type="checkbox"
                  checked={formData.verified}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="verified" className="font-medium text-gray-700">
                  Verified Match
                </label>
                <p className="text-gray-500">Mark this match as manually verified</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
            disabled={isProcessing}
          >
            {isProcessing ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

export default MatchModal;
