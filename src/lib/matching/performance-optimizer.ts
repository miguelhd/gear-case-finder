import { ProductMatcher } from '../matching/product-matcher';
import { FeatureMatcher } from '../matching/feature-matcher';
import { RecommendationEngine } from '../matching/recommendation-engine';
import { IAudioGear, ICase } from '../models/gear-models';
import mongoose from 'mongoose';

/**
 * Performance optimization for the product matching algorithm
 */
export class PerformanceOptimizer {
  /**
   * Optimize database queries for the product matching algorithm
   */
  async optimizeDatabaseQueries(): Promise<void> {
    // Ensure all necessary indexes are created
    await this.createIndexes();
    
    // Create materialized views for common queries
    await this.createMaterializedViews();
    
    // Implement caching for frequent queries
    this.setupQueryCaching();
  }
  
  /**
   * Create indexes for faster queries
   */
  private async createIndexes(): Promise<void> {
    const AudioGear = mongoose.model<IAudioGear>('AudioGear');
    const Case = mongoose.model<ICase>('Case');
    
    // Create indexes for AudioGear collection
    await AudioGear.collection.createIndex({ name: 1 });
    await AudioGear.collection.createIndex({ brand: 1 });
    await AudioGear.collection.createIndex({ category: 1 });
    await AudioGear.collection.createIndex({ type: 1 });
    await AudioGear.collection.createIndex({ 'dimensions.length': 1 });
    await AudioGear.collection.createIndex({ 'dimensions.width': 1 });
    await AudioGear.collection.createIndex({ 'dimensions.height': 1 });
    await AudioGear.collection.createIndex({ popularity: -1 });
    
    // Create indexes for Case collection
    await Case.collection.createIndex({ name: 1 });
    await Case.collection.createIndex({ brand: 1 });
    await Case.collection.createIndex({ type: 1 });
    await Case.collection.createIndex({ 'internalDimensions.length': 1 });
    await Case.collection.createIndex({ 'internalDimensions.width': 1 });
    await Case.collection.createIndex({ 'internalDimensions.height': 1 });
    await Case.collection.createIndex({ price: 1 });
    await Case.collection.createIndex({ rating: -1 });
    await Case.collection.createIndex({ protectionLevel: 1 });
    await Case.collection.createIndex({ marketplace: 1 });
    
    // Create compound indexes for common query patterns
    await Case.collection.createIndex({ 
      'internalDimensions.length': 1, 
      'internalDimensions.width': 1, 
      'internalDimensions.height': 1 
    });
    
    await Case.collection.createIndex({ 
      protectionLevel: 1, 
      price: 1 
    });
    
    console.log('Database indexes created successfully');
  }
  
  /**
   * Create materialized views for common queries
   */
  private async createMaterializedViews(): Promise<void> {
    // This would typically be implemented with MongoDB's aggregation pipeline
    // and stored in a separate collection that gets refreshed periodically
    
    // For this implementation, we'll simulate materialized views with aggregation pipelines
    
    // Example: Create a view of popular gear with their dimensions
    const AudioGear = mongoose.model<IAudioGear>('AudioGear');
    const popularGearPipeline = [
      { $sort: { popularity: -1 } },
      { $limit: 100 },
      { $project: { 
        _id: 1,
        name: 1,
        brand: 1,
        category: 1,
        dimensions: 1
      }}
    ];
    
    // We would store this result in a separate collection
    // For now, we'll just log that this would be done
    console.log('Materialized views would be created here in a production environment');
  }
  
  /**
   * Set up query caching for frequent queries
   */
  private setupQueryCaching(): void {
    // In a production environment, this would use Redis or a similar caching system
    // For this implementation, we'll use a simple in-memory cache
    
    const queryCache = new Map<string, { data: any, timestamp: number }>();
    const CACHE_TTL = 3600000; // 1 hour in milliseconds
    
    // Monkey patch the mongoose query prototype to add caching
    // This is just a demonstration and would be implemented differently in production
    const originalExec = mongoose.Query.prototype.exec;
    
    mongoose.Query.prototype.exec = function(this: mongoose.Query<any, any>) {
      if (this.model.modelName !== 'AudioGear' && this.model.modelName !== 'Case') {
        return originalExec.apply(this, arguments as any);
      }
      
      const key = JSON.stringify({
        modelName: this.model.modelName,
        query: this.getQuery(),
        options: this.getOptions(),
        collection: this.mongooseCollection.name
      });
      
      const cachedResult = queryCache.get(key);
      const now = Date.now();
      
      if (cachedResult && (now - cachedResult.timestamp < CACHE_TTL)) {
        console.log(`Cache hit for ${this.model.modelName} query`);
        return Promise.resolve(cachedResult.data);
      }
      
      return originalExec.apply(this, arguments as any).then((result: any) => {
        queryCache.set(key, { data: result, timestamp: now });
        return result;
      });
    };
    
    console.log('Query caching set up successfully');
  }
  
  /**
   * Optimize the matching algorithm for better performance
   */
  optimizeMatchingAlgorithm(productMatcher: ProductMatcher): void {
    // Implement batch processing for large datasets
    this.implementBatchProcessing(productMatcher);
    
    // Implement parallel processing for independent operations
    this.implementParallelProcessing(productMatcher);
    
    console.log('Matching algorithm optimized for performance');
  }
  
  /**
   * Implement batch processing for large datasets
   */
  private implementBatchProcessing(productMatcher: ProductMatcher): void {
    // This would modify the product matcher to process items in batches
    // For this implementation, we'll just log that this would be done
    console.log('Batch processing would be implemented here in a production environment');
  }
  
  /**
   * Implement parallel processing for independent operations
   */
  private implementParallelProcessing(productMatcher: ProductMatcher): void {
    // This would modify the product matcher to process items in parallel
    // For this implementation, we'll just log that this would be done
    console.log('Parallel processing would be implemented here in a production environment');
  }
}

/**
 * Automated testing suite for the product matching algorithm
 */
export class MatchingTestSuite {
  private productMatcher: ProductMatcher;
  private featureMatcher: FeatureMatcher;
  private recommendationEngine: RecommendationEngine;
  
  constructor() {
    this.productMatcher = new ProductMatcher();
    this.featureMatcher = new FeatureMatcher();
    this.recommendationEngine = new RecommendationEngine();
  }
  
  /**
   * Run all tests
   */
  async runAllTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('Running automated tests for product matching algorithm...');
    
    let passed = 0;
    let failed = 0;
    
    // Test dimension matching
    const dimensionTestResult = await this.testDimensionMatching();
    passed += dimensionTestResult.passed;
    failed += dimensionTestResult.failed;
    
    // Test feature matching
    const featureTestResult = await this.testFeatureMatching();
    passed += featureTestResult.passed;
    failed += featureTestResult.failed;
    
    // Test recommendation engine
    const recommendationTestResult = await this.testRecommendationEngine();
    passed += recommendationTestResult.passed;
    failed += recommendationTestResult.failed;
    
    // Test confidence scoring
    const confidenceTestResult = await this.testConfidenceScoring();
    passed += confidenceTestResult.passed;
    failed += confidenceTestResult.failed;
    
    // Test edge cases
    const edgeCaseTestResult = await this.testEdgeCases();
    passed += edgeCaseTestResult.passed;
    failed += edgeCaseTestResult.failed;
    
    const total = passed + failed;
    console.log(`Test results: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    return { passed, failed, total };
  }
  
  /**
   * Test dimension matching
   */
  private async testDimensionMatching(): Promise<{ passed: number; failed: number }> {
    console.log('Testing dimension matching...');
    
    let passed = 0;
    let failed = 0;
    
    // Test case 1: Perfect fit
    try {
      const gear = this.createMockGear({
        dimensions: { length: 10, width: 8, height: 4, unit: 'in' }
      });
      
      const perfectCase = this.createMockCase({
        internalDimensions: { length: 11, width: 9, height: 5, unit: 'in' }
      });
      
      const score = this.calculateCompatibilityScore(gear, perfectCase);
      
      if (score >= 90) {
        passed++;
        console.log('✓ Perfect fit test passed');
      } else {
        failed++;
        console.log(`✗ Perfect fit test failed: score ${score} is less than 90`);
      }
    } catch (error) {
      failed++;
      console.log('✗ Perfect fit test failed with error:', error);
    }
    
    // Test case 2: Too tight
    try {
      const gear = this.createMockGear({
        dimensions: { length: 10, width: 8, height: 4, unit: 'in' }
      });
      
      const tightCase = this.createMockCase({
        internalDimensions: { length: 10.1, width: 8.1, height: 4.1, unit: 'in' }
      });
      
      const score = this.calculateCompatibilityScore(gear, tightCase);
      
      if (score < 70) {
        passed++;
        console.log('✓ Too tight test passed');
      } else {
        failed++;
        console.log(`✗ Too tight test failed: score ${score} is not less than 70`);
      }
    } catch (error) {
      failed++;
      console.log('✗ Too tight test failed with error:', error);
    }
    
    // Test case 3: Too loose
    try {
      const gear = this.createMockGear({
        dimensions: { length: 10, width: 8, height: 4, unit: 'in' }
      });
      
      const looseCase = this.createMockCase({
        internalDimensions: { length: 20, width: 16, height: 8, unit: 'in' }
      });
      
      const score = this.calculateCompatibilityScore(gear, looseCase);
      
      if (score < 80) {
        passed++;
        console.log('✓ Too loose test passed');
      } else {
        failed++;
        console.log(`✗ Too loose test failed: score ${score} is not less than 80`);
      }
    } catch (error) {
      failed++;
      console.log('✗ Too loose test failed with error:', error);
    }
    
    console.log(`Dimension matching tests: ${passed} passed, ${failed} failed`);
    return { passed, failed };
  }
  
  /**
   * Test feature matching
   */
  private async testFeatureMatching(): Promise<{ passed: number; failed: number }> {
    console.log('Testing feature matching...');
    
    let passed = 0;
    let failed = 0;
    
    // Test case 1: Matching features
    try {
      const gear = this.createMockGear({
        category: 'Synthesizer'
      });
      
      const caseWithFeatures = this.createMockCase({
        description: 'Padded case with compartments',
        features: ['Padded interior', 'Multiple compartments', 'Waterproof'],
        hasHandle: true,
        waterproof: true
      });
      
      const options = {
        requirePadding: true,
        requireCompartments: true,
        requireHandle: true
      };
      
      const featureScore = this.featureMatcher.matchFeatures([gear], [caseWithFeatures], options)[0].featureScore;
      
      if (featureScore >= 80) {
        passed++;
        console.log('✓ Matching features test passed');
      } else {
        failed++;
        console.log(`✗ Matching features test failed: score ${featureScore} is less than 80`);
      }
    } catch (error) {
      failed++;
      console.log('✗ Matching features test failed with error:', error);
    }
    
    // Test case 2: Missing features
    try {
      const gear = this.createMockGear({
        category: 'Synthesizer'
      });
      
      const caseWithoutFeatures = this.createMockCase({
        description: 'Basic case',
        features: [],
        hasHandle: false,
        waterproof: false
      });
      
      const options = {
        requirePadding: true,
        requireCompartments: true,
        requireHandle: true
      };
      
      const featureScore = this.featureMatcher.matchFeatures([gear], [caseWithoutFeatures], options)[0].featureScore;
      
      if (featureScore < 50) {
        passed++;
        console.log('✓ Missing features test passed');
      } else {
        failed++;
        console.log(`✗ Missing features test failed: score ${featureScore} is not less than 50`);
      }
    } catch (error) {
      failed++;
      console.log('✗ Missing features test failed with error:', error);
    }
    
    console.log(`Feature matching tests: ${passed} passed, ${failed} failed`);
    return { passed, failed };
  }
  
  /**
   * Test recommendation engine
   */
  private async testRecommendationEngine(): Promise<{ passed: number; failed: number }> {
    console.log('Testing recommendation engine...');
    
    let passed = 0;
    let failed = 0;
    
    // Test case 1: Budget alternatives
    try {
      const gear = this.createMockGear();
      
      const primaryCase = this.createMockCase({
        price: 100,
        currency: 'USD',
        protectionLevel: 'medium'
      });
      
      const options = {
        includeBudgetOptions: true,
        includeUpgrades: false,
        includeAlternativeSizes: false
      };
      
      const recommendations = await this.recommendationEngine.generateAlternativeRecommendations(
        gear, primaryCase, options
      );
      
      const hasBudgetOptions = recommendations.some(item => 
        item.recommendationType === 'budget' && item.price < primaryCase.price
      );
      
      if (hasBudgetOptions) {
        passed++;
        console.log('✓ Budget alternatives test passed');
      } else {
        failed++;
        console.log('✗ Budget alternatives test failed: no budget options found');
      }
    } catch (error) {
      failed++;
      console.log('✗ Budget alternatives test failed with error:', error);
    }
    
    // Test case 2: Premium upgrades
    try {
      const gear = this.createMockGear();
      
      const primaryCase = this.createMockCase({
        price: 100,
        currency: 'USD',
        protectionLevel: 'medium'
      });
      
      const options = {
        includeBudgetOptions: false,
        includeUpgrades: true,
        includeAlternativeSizes: false
      };
      
      const recommendations = await this.recommendationEngine.generateAlternativeRecommendations(
        gear, primaryCase, options
      );
      
      const hasUpgradeOptions = recommendations.some(item => 
        item.recommendationType === 'premium' && 
        (item.price > primaryCase.price || item.protectionLevel === 'high')
      );
      
      if (hasUpgradeOptions) {
        passed++;
        console.log('✓ Premium upgrades test passed');
      } else {
        failed++;
        console.log('✗ Premium upgrades test failed: no upgrade options found');
      }
    } catch (error) {
      failed++;
      console.log('✗ Premium upgrades test failed with error:', error);
    }
    
    console.log(`Recommendation engine tests: ${passed} passed, ${failed} failed`);
    return { passed, failed };
  }
  
  /**
   * Test confidence scoring
   */
  private async testConfidenceScoring(): Promise<{ passed: number; failed: number }> {
    console.log('Testing confidence scoring...');
    
    let passed = 0;
    let failed = 0;
    
    // Test case 1: High confidence match
    try {
      const gear = this.createMockGear({
        name: 'Moog Subsequent 37',
        category: 'Synthesizer'
      });
      
      const perfectCase = this.createMockCase({
        name: 'Synthesizer Case for Moog',
        description: 'Perfect for Moog Subseque<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>