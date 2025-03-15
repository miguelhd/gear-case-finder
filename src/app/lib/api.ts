import React from 'react';
import { AudioGear, Case, SearchFilters } from '../types';

// Mock data for initial development
const mockGear: AudioGear[] = [
  {
    id: '1',
    name: 'Korg Minilogue',
    brand: 'Korg',
    type: 'synthesizer',
    dimensions: {
      width: 50,
      height: 30,
      depth: 15
    },
    weight: 2.8,
    imageUrl: 'https://via.placeholder.com/300x200?text=Korg+Minilogue'
  },
  {
    id: '2',
    name: 'Roland TR-8S',
    brand: 'Roland',
    type: 'drum machine',
    dimensions: {
      width: 40,
      height: 22,
      depth: 13
    },
    weight: 1.9,
    imageUrl: 'https://via.placeholder.com/300x200?text=Roland+TR-8S'
  },
  {
    id: '3',
    name: 'Focusrite Scarlett 2i2',
    brand: 'Focusrite',
    type: 'interface',
    dimensions: {
      width: 18,
      height: 5,
      depth: 10
    },
    weight: 0.6,
    imageUrl: 'https://via.placeholder.com/300x200?text=Focusrite+Scarlett'
  }
];

const mockCases: Case[] = [
  {
    id: '1',
    name: 'Hardshell Synth Case',
    brand: 'Gator',
    type: 'hard',
    dimensions: {
      innerWidth: 52,
      innerHeight: 32,
      innerDepth: 17,
      outerWidth: 55,
      outerHeight: 35,
      outerDepth: 20
    },
    maxWeight: 5,
    price: 129.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=Gator+Synth+Case',
    features: ['Waterproof', 'Foam padding', 'Lockable'],
    compatibleWith: ['1']
  },
  {
    id: '2',
    name: 'Drum Machine Bag',
    brand: 'Magma',
    type: 'soft',
    dimensions: {
      innerWidth: 42,
      innerHeight: 24,
      innerDepth: 15,
      outerWidth: 44,
      outerHeight: 26,
      outerDepth: 16
    },
    maxWeight: 3,
    price: 79.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=Magma+Drum+Machine+Bag',
    features: ['Padded interior', 'Shoulder strap', 'Accessory pocket'],
    compatibleWith: ['2']
  },
  {
    id: '3',
    name: 'Audio Interface Pouch',
    brand: 'UDG',
    type: 'bag',
    dimensions: {
      innerWidth: 20,
      innerHeight: 7,
      innerDepth: 12,
      outerWidth: 22,
      outerHeight: 9,
      outerDepth: 14
    },
    maxWeight: 1,
    price: 29.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=UDG+Interface+Pouch',
    features: ['Compact', 'Cable storage', 'Velcro closure'],
    compatibleWith: ['3']
  }
];

// This would be replaced with actual API calls in the final implementation
export const fetchGear = async (): Promise<AudioGear[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockGear;
};

export const fetchCases = async (): Promise<Case[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockCases;
};

export const searchGear = async (query: string, filters: SearchFilters): Promise<AudioGear[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredGear = [...mockGear];
  
  // Apply search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredGear = filteredGear.filter(gear => 
      gear.name.toLowerCase().includes(lowerQuery) || 
      gear.brand.toLowerCase().includes(lowerQuery) ||
      gear.type.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Apply filters
  if (filters.gearType) {
    filteredGear = filteredGear.filter(gear => 
      gear.type.toLowerCase() === filters.gearType?.toLowerCase()
    );
  }
  
  if (filters.brand) {
    filteredGear = filteredGear.filter(gear => 
      gear.brand.toLowerCase() === filters.brand?.toLowerCase()
    );
  }
  
  return filteredGear;
};

export const findCompatibleCases = async (gear: AudioGear): Promise<Case[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would use the dimensions to find compatible cases
  // For now, we'll use the mockCases compatibleWith property
  return mockCases.filter(caseItem => 
    caseItem.compatibleWith?.includes(gear.id)
  );
};

export const searchCases = async (query: string, filters: SearchFilters): Promise<Case[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredCases = [...mockCases];
  
  // Apply search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.name.toLowerCase().includes(lowerQuery) || 
      caseItem.brand.toLowerCase().includes(lowerQuery) ||
      caseItem.type.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Apply filters
  if (filters.caseType) {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.type.toLowerCase() === filters.caseType?.toLowerCase()
    );
  }
  
  if (filters.brand) {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.brand.toLowerCase() === filters.brand?.toLowerCase()
    );
  }
  
  if (filters.priceRange) {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.price !== undefined &&
      caseItem.price >= (filters.priceRange?.min || 0) &&
      caseItem.price <= (filters.priceRange?.max || Infinity)
    );
  }
  
  return filteredCases;
};
