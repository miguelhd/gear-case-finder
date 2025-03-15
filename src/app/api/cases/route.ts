import { NextRequest, NextResponse } from 'next/server';
import { Case } from '@/app/types';

// Mock database for cases
const casesDatabase: Case[] = [
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
    compatibleWith: ['1', '4']
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
  },
  {
    id: '4',
    name: 'Mixer Flight Case',
    brand: 'SKB',
    type: 'flight',
    dimensions: {
      innerWidth: 28,
      innerHeight: 8,
      innerDepth: 18,
      outerWidth: 32,
      outerHeight: 12,
      outerDepth: 22
    },
    maxWeight: 4,
    price: 149.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=SKB+Mixer+Case',
    features: ['Heavy-duty', 'Metal corners', 'Recessed handles'],
    compatibleWith: ['5']
  },
  {
    id: '5',
    name: 'Waterproof Synth Case',
    brand: 'Pelican',
    type: 'waterproof',
    dimensions: {
      innerWidth: 60,
      innerHeight: 16,
      innerDepth: 35,
      outerWidth: 65,
      outerHeight: 20,
      outerDepth: 40
    },
    maxWeight: 10,
    price: 199.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=Pelican+Synth+Case',
    features: ['IP67 rated', 'Pressure equalization valve', 'Custom foam'],
    compatibleWith: ['4']
  }
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const caseType = searchParams.get('caseType') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  
  let filteredCases = [...casesDatabase];
  
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
  if (caseType) {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.type.toLowerCase() === caseType.toLowerCase()
    );
  }
  
  if (brand) {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.brand.toLowerCase() === brand.toLowerCase()
    );
  }
  
  if (minPrice !== undefined) {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.price !== undefined && caseItem.price >= minPrice
    );
  }
  
  if (maxPrice !== undefined) {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.price !== undefined && caseItem.price <= maxPrice
    );
  }
  
  // Simulate server delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(filteredCases);
}

export async function POST(request: NextRequest) {
  try {
    const newCase = await request.json();
    
    // Validate required fields
    if (!newCase.name || !newCase.brand || !newCase.type || !newCase.dimensions) {
      return NextResponse.json(
        { error: 'Missing required fields: name, brand, type, and dimensions are required' },
        { status: 400 }
      );
    }
    
    // Generate a new ID (in a real app, this would be handled by the database)
    const id = (casesDatabase.length + 1).toString();
    const createdCase = { ...newCase, id };
    
    // In a real app, this would save to a database
    casesDatabase.push(createdCase);
    
    return NextResponse.json(createdCase, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
