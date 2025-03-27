# Vercel Deployment Fix: Using /tmp Directory for Logs

## Overview
This document explains the comprehensive fix implemented to resolve the "ENOENT: no such file or directory, mkdir './logs'" error in Vercel's serverless environment.

## Problem
In Vercel's serverless functions environment, the application was attempting to create and write to a './logs' directory in multiple files. However, in serverless environments, only the `/tmp` directory is writable. This was causing the following error:

```
Error: ENOENT: no such file or directory, mkdir './logs'
    at Object.mkdirSync (node:fs:1364:26)
    at 9241 (/var/task/.next/server/chunks/241.js:43:27)
    ...
```

This error was preventing the GraphQL API from functioning properly, resulting in 405 Method Not Allowed errors.

## Solution
The solution involved modifying all files that create log directories to use the `/tmp` directory in production environments, while maintaining the current behavior in development environments.

### Files Modified

1. **src/lib/scrapers/scraper-manager.ts**:
   - Updated to use '/tmp/logs' in production and './logs' in development
   - Added robust error handling for directory creation failures

2. **src/lib/system-monitoring.ts**:
   - Changed log directory determination to use '/tmp/logs' in production
   - Implemented fallback to console-only logging if file transports fail

3. **src/lib/mongodb-monitor.ts**:
   - This file was missed in the initial fix and was the source of the persistent error
   - Updated to use '/tmp/logs' in production and './logs' in development
   - Added comprehensive error handling and fallbacks

### Key Code Changes

#### Environment-aware directory selection:
```typescript
// Determine appropriate log directory based on environment
const LOG_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/logs' 
  : (process.env.LOG_DIR || './logs');
```

#### Robust error handling:
```typescript
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.error(`Failed to create log directory ${LOG_DIR}:`, error);
  // Continue execution even if directory creation fails
}
```

#### Fallback mechanisms:
```typescript
try {
  rotateLogIfNeeded();
  fs.appendFileSync(LOG_FILE, logMessage);
} catch (error) {
  // Fallback to console logging if file operations fail
  console.error(`[MongoDB Monitor] ${message}`);
  console.error('Error writing to log file:', error);
}
```

## Testing
The fix was tested locally by running a complete build, which completed successfully with no errors. This confirmed that the changes were syntactically correct and didn't introduce any new issues.

## Deployment
The changes were committed and pushed to the repository in multiple commits:
1. "Fix: Use /tmp directory for logs in Vercel serverless environment" - Initial fix for system-monitoring.ts and scraper-manager.ts
2. "Add documentation for Vercel deployment fix" - Added initial documentation
3. "Fix: Update mongodb-monitor.ts to use /tmp directory for logs in Vercel serverless environment" - Fixed the missed mongodb-monitor.ts file

## Lessons Learned
1. **Comprehensive Analysis**: When fixing issues in serverless environments, it's crucial to perform a comprehensive analysis of all files that might be affected, not just the ones that are most obvious.
2. **Search for Similar Patterns**: Using grep or similar tools to search for all instances of problematic patterns (like './logs') can help identify issues that might be missed in a more targeted approach.
3. **Environment-Aware Code**: Always make file system operations environment-aware in applications that might run in different environments (development, production, serverless, etc.).

## Best Practices for Serverless Environments
When working with serverless environments like Vercel:

1. **Use /tmp for writable files**: Only the /tmp directory is writable in most serverless environments
2. **Implement environment-aware logic**: Use different paths based on NODE_ENV
3. **Add robust error handling**: Always include fallbacks in case file operations fail
4. **Consider stateless alternatives**: When possible, use external logging services instead of local files
5. **Keep file operations to a minimum**: Serverless functions have limited execution time and resources

## Next Steps
1. Consider implementing a more robust logging solution using external services like Logtail, Papertrail, or CloudWatch
2. Review other parts of the application for similar file system operations that might cause issues in serverless environments
3. Add monitoring to track any file system related errors in production
4. Consider adding a pre-deployment check that scans for potential serverless compatibility issues
