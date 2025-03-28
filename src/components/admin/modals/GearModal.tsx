import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase';
import FormField from './FormField';

interface AudioGear {
  _id?: string;
  name: string;
  brand: string;
  category: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weight: number;
  description: string;
}

interface GearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gear: AudioGear) => void;
  gear?: AudioGear;
  categories: Array<{ value: string; label: string }>;
  brands: Array<{ value: string; label: string }>;
  isProcessing?: boolean;
  mode: 'add' | 'edit';
}

const defaultGear: AudioGear = {
  name: '',
  brand: '',
  category: '',
  dimensions: {
    width: 0,
    height: 0,
    depth: 0
  },
  weight: 0,
  description: ''
};

const GearModal: React.FC<GearModalProps> = ({
  isOpen,
  onClose,
  onSave,
  gear,
  categories,
  brands,
  isProcessing = false,
  mode
}) => {
  const [formData, setFormData] = useState<AudioGear>(defaultGear);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (gear && mode === 'edit') {
      setFormData(gear);
    } else {
      setFormData(defaultGear);
    }
    setErrors({});
  }, [gear, isOpen, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Ensure we're dealing with an object before spreading
        const parentObj = prev[parent as keyof AudioGear];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.dimensions.width <= 0) {
      newErrors['dimensions.width'] = 'Width must be greater than 0';
    }
    
    if (formData.dimensions.height <= 0) {
      newErrors['dimensions.height'] = 'Height must be greater than 0';
    }
    
    if (formData.dimensions.depth <= 0) {
      newErrors['dimensions.depth'] = 'Depth must be greater than 0';
    }
    
    if (formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
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
      title={mode === 'add' ? 'Add Audio Gear' : 'Edit Audio Gear'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <FormField
              id="name"
              label="Name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter gear name"
              required
              error={errors.name}
            />
          </div>
          
          <div className="sm:col-span-3">
            <FormField
              id="brand"
              label="Brand"
              type="select"
              value={formData.brand}
              onChange={handleChange}
              required
              error={errors.brand}
              options={brands}
            />
          </div>
          
          <div className="sm:col-span-3">
            <FormField
              id="category"
              label="Category"
              type="select"
              value={formData.category}
              onChange={handleChange}
              required
              error={errors.category}
              options={categories}
            />
          </div>
          
          <div className="sm:col-span-3">
            <FormField
              id="weight"
              label="Weight (g)"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              required
              error={errors.weight}
              min={0}
            />
          </div>
          
          <div className="sm:col-span-2">
            <FormField
              id="dimensions.width"
              label="Width (mm)"
              type="number"
              value={formData.dimensions.width}
              onChange={handleChange}
              required
              error={errors['dimensions.width']}
              min={0}
            />
          </div>
          
          <div className="sm:col-span-2">
            <FormField
              id="dimensions.height"
              label="Height (mm)"
              type="number"
              value={formData.dimensions.height}
              onChange={handleChange}
              required
              error={errors['dimensions.height']}
              min={0}
            />
          </div>
          
          <div className="sm:col-span-2">
            <FormField
              id="dimensions.depth"
              label="Depth (mm)"
              type="number"
              value={formData.dimensions.depth}
              onChange={handleChange}
              required
              error={errors['dimensions.depth']}
              min={0}
            />
          </div>
          
          <div className="sm:col-span-6">
            <FormField
              id="description"
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter gear description"
            />
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

export default GearModal;
