/**
 * Content Collection Import Script
 * 
 * This script imports content data into the Content collection in MongoDB.
 * Content includes articles, guides, reviews, and other SEO-optimized content.
 */

module.exports = async function importContent(db, items = []) {
  console.log('Starting Content import...');
  
  // Initialize counters
  const result = {
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0
  };
  
  try {
    // Get reference to Content collection
    const collection = db.collection('Content');
    
    // If no items provided, we'll create some sample content for testing
    if (items.length === 0) {
      console.log('No content data provided. Creating sample content for testing...');
      
      const sampleContent = [
        {
          title: 'How to Choose the Perfect Case for Your Synthesizer',
          slug: 'how-to-choose-perfect-case-synthesizer',
          content: `
            <h2>Introduction</h2>
            <p>Protecting your synthesizer investment is crucial for any musician or producer. A quality case not only keeps your gear safe during transport but also extends its lifespan by protecting it from dust, moisture, and accidental damage.</p>
            
            <h2>Types of Synthesizer Cases</h2>
            <p>There are several types of cases available for synthesizers:</p>
            <ul>
              <li><strong>Hard Cases</strong>: Offer maximum protection with rigid shells and foam padding</li>
              <li><strong>Soft Cases</strong>: Lightweight and more affordable, with moderate protection</li>
              <li><strong>Gig Bags</strong>: Portable and convenient, but with minimal protection</li>
              <li><strong>Flight Cases</strong>: Heavy-duty protection designed for air travel</li>
            </ul>
            
            <h2>Measuring Your Synthesizer</h2>
            <p>Before purchasing a case, you need to measure your synthesizer accurately:</p>
            <ol>
              <li>Measure the length from the leftmost to the rightmost point</li>
              <li>Measure the width from front to back</li>
              <li>Measure the height from the bottom to the highest point</li>
              <li>Add 1-2 inches to each dimension to allow for padding</li>
            </ol>
            
            <h2>Key Features to Look For</h2>
            <p>When selecting a synthesizer case, consider these important features:</p>
            <ul>
              <li><strong>Padding</strong>: Dense foam padding protects against impacts</li>
              <li><strong>Waterproofing</strong>: Essential for outdoor gigs or travel</li>
              <li><strong>Handles and Wheels</strong>: Make transportation easier</li>
              <li><strong>Compartments</strong>: Useful for storing cables and accessories</li>
              <li><strong>Locks</strong>: Provide security for valuable equipment</li>
            </ul>
            
            <h2>Top Brands for Synthesizer Cases</h2>
            <p>These manufacturers are known for producing high-quality cases:</p>
            <ul>
              <li>Gator Cases</li>
              <li>SKB</li>
              <li>Pelican</li>
              <li>Nanuk</li>
              <li>Decksaver</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>Investing in a quality case for your synthesizer is a small price to pay for protecting your valuable gear. Consider your specific needs, budget, and how you'll be using your synthesizer to choose the perfect case.</p>
          `,
          excerpt: 'Learn how to choose the perfect case to protect your synthesizer investment with our comprehensive guide covering types, measurements, features, and top brands.',
          metaTitle: 'How to Choose the Perfect Synthesizer Case | Complete Guide',
          metaDescription: 'Protect your synthesizer with the right case. Our guide covers hard cases, soft cases, measurements, key features, and top brands for all budgets.',
          keywords: ['synthesizer case', 'keyboard case', 'synth protection', 'hard case', 'soft case', 'gig bag', 'music gear protection'],
          contentType: 'guide',
          relatedGearIds: [],
          relatedCaseIds: [],
          author: 'Gear Case Finder Team',
          publishDate: new Date(),
          updateDate: new Date(),
          status: 'published',
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Top 10 Cases for Protecting Your Audio Interface',
          slug: 'top-10-cases-protecting-audio-interface',
          content: `
            <h2>Introduction</h2>
            <p>Audio interfaces are essential tools for music production, and protecting them ensures they'll continue to perform reliably for years. This article reviews the top 10 cases specifically designed for audio interfaces.</p>
            
            <h2>Why Your Audio Interface Needs Protection</h2>
            <p>Audio interfaces contain sensitive electronic components that can be damaged by impacts, dust, or moisture. A quality case provides:</p>
            <ul>
              <li>Protection during transport</li>
              <li>Safe storage when not in use</li>
              <li>Prevention of dust accumulation</li>
              <li>Moisture protection</li>
            </ul>
            
            <h2>Our Top 10 Picks</h2>
            
            <h3>1. Gator Cases G-MIXERBAG-1212</h3>
            <p>Perfect for small to medium audio interfaces, this padded bag offers excellent protection at an affordable price.</p>
            <p><strong>Key Features:</strong></p>
            <ul>
              <li>Padded interior with adjustable dividers</li>
              <li>Water-resistant exterior</li>
              <li>Comfortable carrying handle</li>
              <li>External pocket for cables</li>
            </ul>
            
            <h3>2. Pelican 1510 Case</h3>
            <p>This hard case offers military-grade protection for your audio interface.</p>
            <p><strong>Key Features:</strong></p>
            <ul>
              <li>Watertight and crushproof design</li>
              <li>Customizable foam interior</li>
              <li>Built-in wheels and extension handle</li>
              <li>Pressure equalization valve</li>
            </ul>
            
            <h3>3. SKB iSeries Waterproof Audio Interface Case</h3>
            <p>Specifically designed for audio interfaces, this case offers professional-grade protection.</p>
            <p><strong>Key Features:</strong></p>
            <ul>
              <li>Custom-cut foam for popular interface models</li>
              <li>Waterproof and dustproof</li>
              <li>Trigger release latches</li>
              <li>Lifetime warranty</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>Investing in a quality case for your audio interface is essential for protecting your gear and ensuring its longevity. Consider your specific needs, budget, and how you'll be using your interface to choose the perfect case from our top 10 list.</p>
          `,
          excerpt: 'Discover the top 10 cases for protecting your audio interface, from affordable padded bags to professional-grade waterproof hard cases.',
          metaTitle: 'Top 10 Audio Interface Cases | Best Protection for Your Gear',
          metaDescription: 'Find the perfect case for your audio interface with our top 10 picks, including Gator Cases, Pelican, and SKB. Protect your gear with the right case.',
          keywords: ['audio interface case', 'gear protection', 'Pelican case', 'SKB case', 'Gator case', 'waterproof case', 'padded bag'],
          contentType: 'article',
          relatedGearIds: [],
          relatedCaseIds: [],
          author: 'Gear Case Finder Team',
          publishDate: new Date(),
          updateDate: new Date(),
          status: 'published',
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Check if content already exists
      for (const content of sampleContent) {
        const existingContent = await collection.findOne({ slug: content.slug });
        
        if (existingContent) {
          console.log(`Content with slug '${content.slug}' already exists. Skipping...`);
          result.skippedCount++;
        } else {
          // Insert new content
          const insertResult = await collection.insertOne(content);
          
          if (insertResult.acknowledged) {
            console.log(`Created sample content: ${content.title}`);
            result.insertedCount++;
          } else {
            result.skippedCount++;
          }
        }
      }
    } else {
      // Process provided content items
      for (const item of items) {
        // Skip items that don't have required fields
        if (!item.title || !item.content) {
          console.warn('Skipping content with missing required fields');
          result.skippedCount++;
          continue;
        }
        
        // Generate slug if not provided
        const slug = item.slug || generateSlug(item.title);
        
        // Transform item to Content schema
        const content = {
          title: item.title,
          slug,
          content: item.content,
          excerpt: item.excerpt || generateExcerpt(item.content),
          metaTitle: item.metaTitle || item.title,
          metaDescription: item.metaDescription || generateExcerpt(item.content, 160),
          keywords: item.keywords || extractKeywords(item.title, item.content),
          contentType: item.contentType || 'article',
          relatedGearIds: item.relatedGearIds || [],
          relatedCaseIds: item.relatedCaseIds || [],
          author: item.author || 'Gear Case Finder Team',
          publishDate: item.publishDate ? new Date(item.publishDate) : new Date(),
          updateDate: item.updateDate ? new Date(item.updateDate) : new Date(),
          status: item.status || 'published',
          viewCount: item.viewCount || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Check if content already exists
        const existingContent = await collection.findOne({ slug });
        
        if (existingContent) {
          // Update existing content
          const updateResult = await collection.updateOne(
            { _id: existingContent._id },
            { 
              $set: {
                ...content,
                createdAt: existingContent.createdAt, // Preserve original creation date
                updatedAt: new Date() // Update the updatedAt timestamp
              }
            }
          );
          
          if (updateResult.modifiedCount > 0) {
            result.updatedCount++;
          } else {
            result.skippedCount++;
          }
        } else {
          // Insert new content
          const insertResult = await collection.insertOne(content);
          
          if (insertResult.acknowledged) {
            result.insertedCount++;
          } else {
            result.skippedCount++;
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error importing Content data:', error);
    throw error;
  }
};

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Trim leading/trailing spaces
}

/**
 * Generate an excerpt from content
 */
function generateExcerpt(content, maxLength = 200) {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]+>/g, ' ');
  
  // Trim whitespace and limit length
  let excerpt = plainText.replace(/\s+/g, ' ').trim();
  
  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength).trim();
    
    // Ensure we don't cut off in the middle of a word
    const lastSpaceIndex = excerpt.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      excerpt = excerpt.substring(0, lastSpaceIndex);
    }
    
    excerpt += '...';
  }
  
  return excerpt;
}

/**
 * Extract keywords from title and content
 */
function extractKeywords(title, content) {
  // Common audio gear keywords
  const commonKeywords = [
    'synthesizer', 'synth', 'keyboard', 'audio interface', 'mixer', 'drum machine',
    'sampler', 'effects pedal', 'microphone', 'mic', 'headphones', 'speakers',
    'monitor', 'case', 'hard case', 'soft case', 'gig bag', 'protection', 'gear'
  ];
  
  // Remove HTML tags from content
  const plainText = content.replace(/<[^>]+>/g, ' ');
  
  // Combine title and content
  const combinedText = `${title} ${plainText}`.toLowerCase();
  
  // Extract keywords that appear in the text
  const keywords = [];
  
  for (const keyword of commonKeywords) {
    if (combinedText.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  }
  
  // Add some generic keywords
  keywords.push('audio gear', 'music equipment', 'gear protection');
  
  return keywords;
}
