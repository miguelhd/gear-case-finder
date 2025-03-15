// This file needs to be fixed to properly import the mock databases
import { NextRequest, NextResponse } from 'next/server';
import { AudioGear, Case } from '@/app/types';

// Mock databases (in a real app, these would be database models)
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
  const gearId = searchParams.get('gearId');
  
  if (!gearId) {
    return NextResponse.json(
      { error: 'Missing required parameter: gearId' },
      { status: 400 }
    );
  }
  
  // Find the gear item
  const gear = gearDatabase.find(item => item.id === gearId);
  
  if (!gear) {
    return NextResponse.json(
      { error: 'Gear not found' },
      { status: 404 }
    );
  }
  
  // Find compatible cases based on explicit compatibility list
  let compatibleCases = casesDatabase.filter(caseItem => 
    caseItem.compatibleWith?.includes(gearId)
  );
  
  // If no explicitly compatible cases, find cases based on dimensions
  if (compatibleCases.length === 0 && gear.dimensions) {
    compatibleCases = casesDatabase.filter(caseItem => {
      // Add some tolerance (e.g., case should be at least 1cm larger in each dimension)
      const tolerance = 1;
      return (
        caseItem.dimensions.innerWidth >= gear.dimensions!.width + tolerance &&
        caseItem.dimensions.innerHeight >= gear.dimensions!.height + tolerance &&
        caseItem.dimensions.innerDepth >= gear.dimensions!.depth + tolerance &&
        (gear.weight === undefined || caseItem.maxWeight >= gear.weight)
      );
    });
  }
  
  // Calculate fit score for each compatible case
  const casesWithScores = compatibleCases.map(caseItem => {
    const fitScore = calculateFitScore(gear, caseItem);
    return { ...caseItem, fitScore };
  });
  
  // Sort by fit score (highest first)
  casesWithScores.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));
  
  // Simulate server delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(casesWithScores);
}

// Function to calculate fit score between gear and case
function calculateFitScore(gear: AudioGear, caseItem: Case): number {
  if (!gear.dimensions) return 0;
  
  // Calculate how well the gear fits in the case (higher is better)
  const widthFit = caseItem.dimensions.innerWidth - gear.dimensions.width;
  const heightFit = caseItem.dimensions.innerHeight - gear.dimensions.height;
  const depthFit = caseItem.dimensions.innerDepth - gear.dimensions.depth;
  
  // If any dimension is negative, the gear doesn't fit
  if (widthFit < 0 || heightFit < 0 || depthFit < 0) {
    return 0;
  }
  
  // If the gear is too heavy, it doesn't fit
  if (gear.weight && gear.weight > caseItem.maxWeight) {
    return 0;
  }
  
  // Calculate fit score - perfect fit would be close to 100
  // Too much extra space reduces the score
  const idealExtraSpace = 2; // cm
  const maxExtraSpace = 10; // cm
  
  const widthScore = 100 - Math.min(100, Math.max(0, Math.abs(widthFit - idealExtraSpace) / maxExtraSpace * 100));
  const heightScore = 100 - Math.min(100, Math.max(0, Math.abs(heightFit - idealExtraSpace) / maxExtraSpace * 100));
  const depthScore = 100 - Math.min(100, Math.max(0, Math.abs(depthFit - idealExtraSpace) / maxExtraSpace * 100));
  
  // Average the scores
  return Math.round((widthScore + heightScore + depthScore) / 3);
}
