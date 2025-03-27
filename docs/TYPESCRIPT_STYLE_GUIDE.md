# TypeScript Style Guide

## Overview
This document outlines the TypeScript coding standards and best practices for the Gear Case Finder project. Following these guidelines will help maintain code consistency and prevent type-related errors.

## Naming Conventions

### Interfaces
- Use the `I` prefix for all interfaces (e.g., `IProduct`, `IApiResponse`)
- Use PascalCase for interface names
- Name interfaces based on their purpose, not implementation details
- For data transfer objects, use the suffix `DTO` (e.g., `IProductDTO`)

### Types
- Use PascalCase for type aliases
- Do not use prefixes for type aliases
- Use descriptive names that indicate the purpose of the type

### Variables and Functions
- Use camelCase for variable and function names
- Use descriptive names that indicate purpose and usage
- Avoid abbreviations unless they are widely understood

### Constants
- Use UPPER_SNAKE_CASE for constants that are truly immutable
- Use camelCase for constants that are technically const but represent configuration

## Type Annotations

### General Rules
- Always specify return types for functions
- Avoid using `any` type; use more specific types or generics instead
- Use union types (`type1 | type2`) instead of `any` when a variable can have multiple types
- Use intersection types (`type1 & type2`) to combine types
- Use type guards to narrow types when necessary

### Function Parameters
- Always specify types for function parameters
- Use optional parameters (`param?: type`) instead of parameters with default values when appropriate
- For functions with many parameters, use an options object with a defined interface

### Generics
- Use generics to create reusable components
- Use descriptive names for generic type parameters (e.g., `T` for general types, `K` for keys, `V` for values)
- Constrain generic types when possible (`<T extends BaseType>`)

## Interface Design

### Structure
- Keep interfaces focused on a single responsibility
- Prefer composition over inheritance for interfaces
- Use readonly modifier for properties that should not be modified
- Group related properties together

### Documentation
- Add JSDoc comments to all interfaces
- Document each property with a brief description
- Include examples where appropriate
- Specify units for dimensional properties

### Example
```typescript
/**
 * Represents the dimensions of an object.
 */
export interface IDimensions {
  /**
   * Length of the object in the specified unit.
   */
  length: number;
  
  /**
   * Width of the object in the specified unit.
   */
  width: number;
  
  /**
   * Height of the object in the specified unit.
   */
  height: number;
  
  /**
   * Unit of measurement (e.g., 'in', 'cm', 'mm').
   */
  unit: string;
}
```

## Type Safety

### Null and Undefined
- Use `undefined` for uninitialized values
- Use `null` only when explicitly required by external APIs
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators
- Avoid non-null assertion operator (`!`) when possible

### Type Assertions
- Avoid type assertions (`as Type`) when possible
- If type assertions are necessary, add a comment explaining why
- Use `unknown` instead of `any` for values of uncertain type, then use type guards

### Type Guards
- Use type guards to narrow types
- Prefer user-defined type guards (`function isType(obj: any): obj is Type`) over type assertions
- Create reusable type guard functions for common patterns

## Error Handling

### Error Types
- Define specific error types for different error categories
- Extend the built-in `Error` class for custom errors
- Include relevant error information in custom error types

### Async Code
- Always handle promise rejections
- Use try/catch blocks for async/await code
- Provide meaningful error messages

## Module Organization

### Exports
- Export all reusable interfaces, types, and functions
- Use named exports instead of default exports
- Group related exports in index files

### Imports
- Use absolute imports for modules from other directories
- Use relative imports for modules in the same directory
- Order imports: built-in modules, external modules, internal modules

## Best Practices

### General
- Enable strict mode in TypeScript configuration
- Use readonly arrays and tuples when the array should not be modified
- Use const assertions for object literals that should not be modified
- Use discriminated unions for state management

### React Components
- Define prop types as interfaces
- Use React.FC<Props> type for functional components
- Define state types explicitly

### API Integration
- Define request and response types for all API endpoints
- Use generics for reusable API client methods
- Handle error responses with specific types

## Linting and Formatting
- Use ESLint with TypeScript-specific rules
- Use Prettier for consistent code formatting
- Run linting as part of the CI/CD pipeline
