/**
 * Content Generator
 * 
 * Generates mock content data for testing purposes
 */

const { ObjectId } = require('mongodb');

// Content types
const contentTypes = ['article', 'guide', 'review', 'comparison', 'tutorial'];

// Content categories
const contentCategories = [
  'Audio Gear', 'Cases & Protection', 'Studio Setup', 'Live Performance',
  'Recording Tips', 'Gear Maintenance', 'Buying Guides', 'Product Reviews'
];

// Content tags
const contentTags = [
  'microphones', 'audio interfaces', 'mixers', 'synthesizers', 'drum machines',
  'samplers', 'controllers', 'headphones', 'monitors', 'effects processors',
  'cases', 'protection', 'waterproof', 'shockproof', 'travel', 'touring',
  'studio', 'live', 'recording', 'production', 'beginner', 'advanced', 'professional'
];

// Generate a random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random subset of items from an array
function randomSubset(array, minCount = 0, maxCount = array.length) {
  const count = randomInt(minCount, Math.min(maxCount, array.length));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate a random date between start and end dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Generate a random title based on content type and referenced items
function generateTitle(type, audioGearItems, caseItems) {
  const titles = {
    article: [
      `Top 10 ${randomItem(['Best', 'Popular', 'Essential', 'Professional'])} ${randomItem(['Audio Gear', 'Recording Equipment', 'Music Production Tools'])} for ${new Date().getFullYear()}`,
      `Why ${randomItem(audioGearItems)?.brand || 'Professional'} ${randomItem(audioGearItems)?.category || 'Audio Gear'} Needs Proper Protection`,
      `${randomItem(['How to Choose', 'Guide to Selecting', 'Tips for Finding'])} the Perfect Case for Your Audio Equipment`,
      `${randomItem(['Protecting', 'Safeguarding', 'Preserving'])} Your Investment: Audio Gear Protection 101`,
      `${randomItem(['The Ultimate', 'The Complete', 'The Essential'])} Guide to Audio Gear Cases and Protection`
    ],
    guide: [
      `${randomItem(['Complete', 'Ultimate', 'Comprehensive', 'Definitive'])} Guide to Protecting Your ${randomItem(audioGearItems)?.category || 'Audio Gear'}`,
      `How to ${randomItem(['Choose', 'Select', 'Find'])} the Right Case for ${randomItem(audioGearItems)?.brand || 'Your'} ${randomItem(audioGearItems)?.category || 'Equipment'}`,
      `${randomItem(['Beginner', 'Professional', 'Touring Musician'])}'s Guide to Audio Gear Protection`,
      `${randomItem(['Everything', 'All'])} You Need to Know About ${randomItem(['Waterproof', 'Shockproof', 'Flight', 'Hard', 'Soft'])} Cases`,
      `${randomItem(['Protecting', 'Transporting', 'Storing'])} Your Gear: A Complete Guide`
    ],
    review: [
      `${randomItem(caseItems)?.brand || 'Premium'} ${randomItem(caseItems)?.type || 'Case'} Review: ${randomItem(['Is It Worth It?', 'The Perfect Protection?', 'Professional Quality?'])}`,
      `We Tested the ${randomItem(caseItems)?.name || 'Latest Audio Gear Cases'} So You Don't Have To`,
      `${randomItem(['Hands-on', 'In-depth', 'Comprehensive'])} Review: ${randomItem(caseItems)?.brand || 'Top'} ${randomItem(caseItems)?.type || 'Cases'} for ${randomItem(audioGearItems)?.category || 'Audio Gear'}`,
      `${randomItem(caseItems)?.brand || 'Professional'} ${randomItem(caseItems)?.type || 'Case'} for ${randomItem(audioGearItems)?.category || 'Audio Equipment'}: Our Verdict`,
      `${randomItem(['Testing', 'Reviewing', 'Evaluating'])} the ${randomItem(['Best', 'Top', 'Latest'])} Cases for ${randomItem(audioGearItems)?.category || 'Audio Gear'}`
    ],
    comparison: [
      `${randomItem(caseItems)?.brand || 'Brand A'} vs ${randomItem(caseItems)?.brand || 'Brand B'}: ${randomItem(['Which Offers Better Protection?', 'Battle of the Cases', 'The Ultimate Showdown'])}`,
      `${randomItem(['Hard', 'Soft', 'Waterproof', 'Flight'])} Cases vs ${randomItem(['Hard', 'Soft', 'Waterproof', 'Flight'])} Cases: ${randomItem(['Which Should You Choose?', 'Pros and Cons', 'What\'s Best for Your Gear?'])}`,
      `Comparing the Top 5 Cases for ${randomItem(audioGearItems)?.category || 'Audio Equipment'}`,
      `Budget vs Premium: ${randomItem(['Are Expensive Cases Worth It?', 'Case Comparison for Every Budget', 'Protection at Any Price Point'])}`,
      `${randomItem(['Waterproof', 'Shockproof', 'Dustproof'])} Cases Compared: ${randomItem(['Which Offers the Best Protection?', 'Finding the Perfect Balance', 'Our Top Picks'])}`
    ],
    tutorial: [
      `How to ${randomItem(['Properly Pack', 'Safely Transport', 'Effectively Protect'])} Your ${randomItem(audioGearItems)?.category || 'Audio Gear'}`,
      `DIY ${randomItem(['Custom Foam Inserts', 'Case Modifications', 'Protection Solutions'])} for Your Audio Equipment`,
      `${randomItem(['Step-by-Step', 'Complete', 'Beginner-Friendly'])} Guide to ${randomItem(['Organizing', 'Customizing', 'Maximizing'])} Your Gear Case`,
      `${randomItem(['Tips and Tricks', 'Pro Techniques', 'Expert Methods'])} for ${randomItem(['Extending the Life', 'Improving the Protection', 'Enhancing the Functionality'])} of Your Cases`,
      `${randomItem(['How to', 'The Right Way to', 'Best Practices for'])} ${randomItem(['Clean', 'Maintain', 'Store'])} Your Audio Gear Cases`
    ]
  };
  
  return randomItem(titles[type] || titles.article);
}

// Generate random content body based on title and type
function generateContentBody(title, type, audioGearItems, caseItems) {
  const intro = {
    article: `In the world of audio production and performance, protecting your valuable equipment is just as important as choosing the right gear in the first place. This article explores ${title.toLowerCase().includes('top 10') ? 'the top options' : 'essential considerations'} for ensuring your audio equipment remains safe and functional for years to come.`,
    guide: `Finding the perfect protection for your audio equipment can be challenging with so many options available. This comprehensive guide will walk you through everything you need to know about selecting, using, and maintaining the right cases for your valuable gear.`,
    review: `After extensive testing and real-world use, we're sharing our detailed thoughts on ${title.includes(':') ? title.split(':')[0] : 'this audio gear protection solution'}. We'll cover build quality, protection level, usability, and value to help you decide if this is the right choice for your equipment.`,
    comparison: `With so many protection options available for your audio gear, making the right choice can be overwhelming. In this detailed comparison, we'll evaluate key factors including protection level, durability, weight, price, and special features to help you make an informed decision.`,
    tutorial: `Proper protection of your audio equipment requires more than just buying a case. This tutorial will provide step-by-step instructions for ${title.toLowerCase().includes('pack') ? 'packing' : title.toLowerCase().includes('transport') ? 'transporting' : 'protecting'} your gear effectively, ensuring it stays safe in any situation.`
  };
  
  const sections = {
    article: [
      `## Understanding Protection Needs\n\nDifferent types of audio equipment require different levels of protection. Microphones, for instance, are often more fragile than synthesizers or drum machines. Consider factors like fragility, value, and usage scenarios when determining protection requirements.`,
      `## Types of Protection Solutions\n\nFrom hard cases to soft bags, the market offers numerous protection options. Hard cases like those from ${randomItem(caseItems)?.brand || 'leading manufacturers'} provide maximum protection but add weight and bulk. Soft cases offer convenience and lighter weight at the cost of reduced protection.`,
      `## Key Features to Consider\n\nWhen evaluating cases, pay attention to waterproofing, shock absorption, dust protection, and internal customization options. The ${randomItem(caseItems)?.name || 'best cases'} offer adjustable foam inserts that can be customized to fit your specific equipment perfectly.`,
      `## Protection for Specific Gear\n\nFor sensitive equipment like ${randomItem(audioGearItems)?.category || 'microphones'}, look for cases with extra padding and secure mounting points. ${randomItem(audioGearItems)?.brand || 'Premium brands'} often offer purpose-built cases designed specifically for their products.`,
      `## Investment vs. Protection\n\nWhile quality cases represent an additional investment, they're significantly less expensive than replacing damaged equipment. Consider the ${randomItem(caseItems)?.name || 'protection solution'} as insurance for your valuable audio gear.`
    ],
    guide: [
      `## Assessing Your Protection Needs\n\nBefore purchasing any case, evaluate your specific requirements. Consider the environments where you'll use your equipment, transportation methods, and the value and fragility of each piece of gear.`,
      `## Understanding Case Types\n\nHard cases, soft cases, bags, and covers each serve different purposes. Hard cases like the ${randomItem(caseItems)?.name || 'industry standards'} offer maximum protection for transportation, while soft cases provide convenience for frequent, local use.`,
      `## Sizing and Fit\n\nProper fit is crucial for effective protection. Measure your ${randomItem(audioGearItems)?.category || 'equipment'} carefully and allow for appropriate padding. Too much extra space can allow movement and potential damage.`,
      `## Protection Features Explained\n\nWaterproof ratings (IP ratings), shock absorption, pressure equalization valves, and locking mechanisms all contribute to a case's protective capabilities. The ${randomItem(caseItems)?.brand || 'leading brands'} offer various combinations of these features.`,
      `## Maintenance and Care\n\nProper maintenance extends the life of both your equipment and its protection. Regularly inspect seals, hinges, and padding for wear. Clean cases according to manufacturer recommendations to prevent deterioration.`
    ],
    review: [
      `## Design and Build Quality\n\nThe ${randomItem(caseItems)?.name || 'case'} features a ${randomItem(['robust', 'durable', 'well-engineered', 'thoughtful'])} design with ${randomItem(['high-quality materials', 'premium construction', 'attention to detail'])}. The ${randomItem(['latches', 'hinges', 'handles', 'zippers'])} feel ${randomItem(['solid', 'secure', 'built to last', 'reliable'])}.`,
      `## Protection Capabilities\n\nIn our testing, this case provided ${randomItem(['excellent', 'good', 'adequate', 'outstanding'])} protection against ${randomItem(['impacts', 'water', 'dust', 'pressure'])}. The ${randomItem(['foam inserts', 'padding', 'interior design'])} effectively ${randomItem(['cushioned', 'secured', 'stabilized'])} the equipment.`,
      `## Usability and Convenience\n\nThe case weighs ${randomInt(2, 15)} pounds empty, which is ${randomItem(['lightweight', 'reasonable', 'somewhat heavy', 'quite substantial'])} for its protection level. ${randomItem(['Handles', 'Wheels', 'Straps'])} make transportation ${randomItem(['easy', 'manageable', 'convenient'])}.`,
      `## Value Assessment\n\nAt a price point of $${randomInt(30, 300)}, this case represents ${randomItem(['excellent', 'good', 'reasonable', 'premium'])} value compared to similar options on the market. The protection-to-price ratio is ${randomItem(['outstanding', 'favorable', 'acceptable', 'worth considering'])}.`,
      `## Verdict\n\nOverall, we ${randomItem(['highly recommend', 'recommend', 'cautiously recommend'])} the ${randomItem(caseItems)?.name || 'case'} for ${randomItem(['professionals', 'enthusiasts', 'touring musicians', 'studio owners'])} looking for ${randomItem(['maximum protection', 'reliable protection', 'good value', 'specific features'])}.`
    ],
    comparison: [
      `## Protection Level Comparison\n\nThe ${randomItem(caseItems)?.brand || 'Brand A'} cases offer ${randomItem(['superior', 'excellent', 'good'])} waterproofing with IP67 ratings, while ${randomItem(caseItems)?.brand || 'Brand B'} focuses more on ${randomItem(['impact resistance', 'dust protection', 'pressure equalization'])}.`,
      `## Build Quality and Durability\n\nIn our stress tests, ${randomItem(caseItems)?.brand || 'Brand A'} cases showed ${randomItem(['exceptional', 'impressive', 'adequate'])} durability, withstanding repeated drops from ${randomInt(3, 6)} feet. ${randomItem(caseItems)?.brand || 'Brand B'} cases performed ${randomItem(['slightly better', 'somewhat worse', 'about the same'])}.`,
      `## Weight and Portability\n\nFor protecting a standard ${randomItem(audioGearItems)?.category || 'piece of equipment'}, ${randomItem(caseItems)?.brand || 'Brand A'} cases typically weigh ${randomInt(2, 5)} pounds more than comparable ${randomItem(caseItems)?.brand || 'Brand B'} options, but offer ${randomItem(['better handles', 'superior wheels', 'more comfortable straps'])}.`,
      `## Price Comparison\n\nOn average, ${randomItem(caseItems)?.brand || 'Brand A'} cases cost about ${randomInt(10, 50)}% more than ${randomItem(caseItems)?.brand || 'Brand B'} equivalents. This premium gets you ${randomItem(['better warranties', 'higher-quality materials', 'additional features', 'more customization options'])}.`,
      `## Recommendation\n\nFor ${randomItem(['professional use', 'frequent travelers', 'outdoor recording', 'studio environments'])}, we recommend ${randomItem(caseItems)?.brand || 'Brand A'} despite the higher cost. For ${randomItem(['occasional use', 'budget-conscious buyers', 'lighter equipment'])}, ${randomItem(caseItems)?.brand || 'Brand B'} offers better value.`
    ],
    tutorial: [
      `## Preparing Your Equipment\n\nBefore packing, ensure your ${randomItem(audioGearItems)?.category || 'audio gear'} is clean and free of loose parts. Disconnect and separately wrap all cables, adapters, and accessories. Consider taking photos of your setup for easy reassembly later.`,
      `## Customizing Your Case\n\nMany ${randomItem(caseItems)?.type || 'cases'} come with pick-and-pluck foam that can be customized to fit your equipment perfectly. Trace your gear on the foam before removing any pieces, and remove foam in layers rather than all at once to avoid over-cutting.`,
      `## Proper Packing Technique\n\nPlace heavier items at the bottom of the case, with fragile components cushioned in the center. Ensure nothing can shift during transport by making foam cutouts slightly smaller than your equipment for a snug fit.`,
      `## Securing and Transporting\n\nAlways test your packed case by gently shaking it to check for movement. Use all available latches and locks. When transporting, avoid exposing the case to extreme temperatures and keep it away from potential hazards.`,
      `## Maintenance Tips\n\nRegularly inspect your case for wear and tear. Clean foam inserts with compressed air rather than liquids. Replace degraded foam promptly to maintain protection levels. Keep silica gel packets in your case to prevent moisture buildup.`
    ]
  };
  
  const conclusion = {
    article: `Investing in proper protection for your audio gear is essential for any serious musician or producer. The right case not only prevents costly damage but also makes transportation and storage more convenient. Consider your specific needs and usage scenarios when selecting protection solutions for your valuable equipment.`,
    guide: `Choosing the right protection for your audio equipment is a crucial decision that can save you from costly repairs or replacements. By understanding your specific needs, the available options, and the features that matter most for your situation, you can make an informed choice that provides peace of mind and long-term value.`,
    review: `After thorough testing, the ${randomItem(caseItems)?.name || 'case'} has proven to be a ${randomItem(['solid', 'excellent', 'worthwhile', 'valuable'])} investment for protecting ${randomItem(audioGearItems)?.category || 'audio equipment'}. While ${randomItem(['not perfect', 'somewhat expensive', 'slightly bulky'])}, its ${randomItem(['protection capabilities', 'build quality', 'thoughtful design'])} make it a ${randomItem(['top recommendation', 'strong contender', 'worthy consideration'])}.`,
    comparison: `Both ${randomItem(caseItems)?.brand || 'Brand A'} and ${randomItem(caseItems)?.brand || 'Brand B'} offer quality protection options, but with different strengths and price points. Your specific equipment, usage scenarios, and budget should guide your decision. Remember that the best case is the one that meets your particular protection needs while fitting your practical requirements.`,
    tutorial: `Following these steps will ensure your audio equipment remains well-protected during storage and transportation. Remember that proper case selection and packing technique are investments in the longevity of your gear. Take the time to do it right, and your equipment will remain safe and functional for years to come.`
  };
  
  // Combine sections into full content
  const fullContent = `# ${title}\n\n${intro[type] || intro.article}\n\n${sections[type].join('\n\n') || sections.article.join('\n\n')}\n\n## Conclusion\n\n${conclusion[type] || conclusion.article}`;
  
  return fullContent;
}

// Generate a single content item
function generateContentItem(index, audioGearItems, caseItems) {
  const type = randomItem(contentTypes);
  const title = generateTitle(type, audioGearItems, caseItems);
  const slug = generateSlug(title);
  
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const publishedAt = randomDate(oneYearAgo, now);
  
  // Reference some actual gear and cases if available
  const referencedGear = audioGearItems.length > 0 
    ? randomSubset(audioGearItems, 0, 3).map(gear => gear._id) 
    : [];
    
  const referencedCases = caseItems.length > 0 
    ? randomSubset(caseItems, 0, 3).map(caseItem => caseItem._id) 
    : [];
  
  return {
    _id: new ObjectId(),
    title,
    slug,
    type,
    category: randomItem(contentCategories),
    tags: randomSubset(contentTags, 2, 6),
    content: generateContentBody(title, type, audioGearItems, caseItems),
    excerpt: `${title} - Learn about ${type === 'review' ? 'our assessment of this product' : type === 'comparison' ? 'how these options compare' : type === 'tutorial' ? 'how to properly protect your gear' : 'protecting your audio equipment'} in this ${type}.`,
    author: {
      name: `${randomItem(['John', 'Jane', 'Alex', 'Sam', 'Chris'])} ${randomItem(['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'])}`,
      bio: `Experienced ${randomItem(['audio engineer', 'music producer', 'touring musician', 'studio owner', 'gear reviewer'])} with a passion for ${randomItem(['high-quality audio', 'music production', 'audio gear', 'sound engineering'])}.`
    },
    featuredImage: `https://example.com/images/content/${slug}-featured.jpg`,
    gallery: [
      `https://example.com/images/content/${slug}-gallery-1.jpg`,
      `https://example.com/images/content/${slug}-gallery-2.jpg`,
      `https://example.com/images/content/${slug}-gallery-3.jpg`
    ],
    referencedGear,
    referencedCases,
    metadata: {
      views: randomInt(50, 10000),
      likes: randomInt(5, 500),
      shares: randomInt(0, 200),
      readTime: randomInt(3, 15)
    },
    seo: {
      metaTitle: title,
      metaDescription: `${title} - Learn about ${type === 'review' ? 'our assessment of this product' : type === 'comparison' ? 'how these options compare' : type === 'tutorial' ? 'how to properly protect your gear' : 'protecting your audio equipment'} in this comprehensive ${type}.`,
      keywords: randomSubset(contentTags, 3, 8).join(', ')
    },
    publishedAt,
    updatedAt: randomDate(publishedAt, now),
    status: 'published'
  };
}

// Generate multiple content items
function generateContent(count, audioGearItems, caseItems) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(generateContentItem(i, audioGearItems, caseItems));
  }
  return items;
}

module.exports = {
  generateContent,
  generateContentItem
};
