import { NextRequest, NextResponse } from 'next/server';
import { AudioGear } from '@/app/types';

// Mock database for audio gear
const gearDatabase: AudioGear[] = [
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
  },
  {
    id: '4',
    name: 'Moog Subsequent 37',
    brand: 'Moog',
    type: 'synthesizer',
    dimensions: {
      width: 58,
      height: 14.5,
      depth: 33
    },
    weight: 6.8,
    imageUrl: 'https://via.placeholder.com/300x200?text=Moog+Subsequent+37'
  },
  {
    id: '5',
    name: 'Yamaha MG10XU',
    brand: 'Yamaha',
    type: 'mixer',
    dimensions: {
      width: 25.5,
      height: 6.5,
      depth: 16.5
    },
    weight: 1.8,
    imageUrl: 'https://via.placeholder.com/300x200?text=Yamaha+MG10XU'
  }
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const gearType = searchParams.get('gearType') || '';
  const brand = searchParams.get('brand') || '';
  
  let filteredGear = [...gearDatabase];
  
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
  if (gearType) {
    filteredGear = filteredGear.filter(gear => 
      gear.type.toLowerCase() === gearType.toLowerCase()
    );
  }
  
  if (brand) {
    filteredGear = filteredGear.filter(gear => 
      gear.brand.toLowerCase() === brand.toLowerCase()
    );
  }
  
  // Simulate server delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(filteredGear);
}

export async function POST(request: NextRequest) {
  try {
    const newGear = await request.json();
    
    // Validate required fields
    if (!newGear.name || !newGear.brand || !newGear.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, brand, and type are required' },
        { status: 400 }
      );
    }
    
    // Generate a new ID (in a real app, this would be handled by the database)
    const id = (gearDatabase.length + 1).toString();
    const createdGear = { ...newGear, id };
    
    // In a real app, this would save to a database
    gearDatabase.push(createdGear);
    
    return NextResponse.json(createdGear, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
