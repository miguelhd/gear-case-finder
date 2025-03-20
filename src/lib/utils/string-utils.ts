/**
 * Utility functions for string manipulation
 */

/**
 * Normalizes a product title by removing excessive spaces and special characters
 */
export function normalizeProductTitle(title: string): string {
  // Remove excessive spaces
  let normalized = title.replace(/\s+/g, ' ').trim();
  
  // Remove special characters that might cause issues
  normalized = normalized.replace(/[^\w\s\-.,&()]/g, '');
  
  return normalized;
}

/**
 * Converts a string to slug format for URLs
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
