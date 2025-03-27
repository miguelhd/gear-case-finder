/**
 * Amazon Product Advertising API Client
 * 
 * This module provides a client for interacting with Amazon's Product Advertising API 5.0
 * to fetch product data for audio gear and protective cases.
 */

import axios from 'axios';
import crypto from 'crypto';

interface AmazonPaapiConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region: string;
  host: string;
}

interface SearchItemsRequest {
  Keywords?: string;
  SearchIndex?: string;
  ItemCount?: number;
  Resources?: string[];
  BrowseNodeId?: string;
  SortBy?: string;
}

interface GetItemsRequest {
  ItemIds: string[];
  Resources?: string[];
}

export class AmazonPaapiClient {
  private config: AmazonPaapiConfig;
  private defaultResources: string[];

  constructor(config: AmazonPaapiConfig) {
    this.config = config;
    
    // Default resources to request from the API
    this.defaultResources = [
      'Images.Primary.Large',
      'Images.Variants.Large',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'ItemInfo.ProductInfo',
      'ItemInfo.ByLineInfo',
      'ItemInfo.ContentInfo',
      'ItemInfo.ManufactureInfo',
      'ItemInfo.TechnicalInfo',
      'Offers.Listings.Price',
      'Offers.Listings.DeliveryInfo.IsPrimeEligible',
      'Offers.Listings.PromotionIds',
      'Offers.Summaries.LowestPrice'
    ];
  }

  /**
   * Generate the required authentication headers for the Amazon Product Advertising API
   */
  private generateHeaders(path: string, payload: any): Record<string, string> {
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    
    // Create canonical request
    const canonicalUri = path;
    const canonicalQueryString = '';
    const canonicalHeaders = 
      'content-encoding:amz-1.0\n' +
      'content-type:application/json; charset=utf-8\n' +
      'host:' + this.config.host + '\n' +
      'x-amz-date:' + amzDate + '\n' +
      'x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.' + payload.Operation + '\n';
    
    const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
    
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
    
    const canonicalRequest = 
      'POST\n' +
      canonicalUri + '\n' +
      canonicalQueryString + '\n' +
      canonicalHeaders + '\n' +
      signedHeaders + '\n' +
      payloadHash;
    
    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = dateStamp + '/' + this.config.region + '/ProductAdvertisingAPI/aws4_request';
    const stringToSign = 
      algorithm + '\n' +
      amzDate + '\n' +
      credentialScope + '\n' +
      crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    // Calculate signature
    // Fix TypeScript error by using string as key instead of Buffer
    const kSecret = 'AWS4' + this.config.secretKey;
    
    // Use string keys for all HMAC operations to avoid Buffer type errors
    const kDate = crypto
      .createHmac('sha256', kSecret)
      .update(dateStamp)
      .digest('hex');
    
    const kRegion = crypto
      .createHmac('sha256', kDate)
      .update(this.config.region)
      .digest('hex');
    
    const kService = crypto
      .createHmac('sha256', kRegion)
      .update('ProductAdvertisingAPI')
      .digest('hex');
    
    const kSigning = crypto
      .createHmac('sha256', kService)
      .update('aws4_request')
      .digest('hex');
    
    const signature = crypto
      .createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');
    
    // Create authorization header
    const authorizationHeader = 
      algorithm + ' ' +
      'Credential=' + this.config.accessKey + '/' + credentialScope + ', ' +
      'SignedHeaders=' + signedHeaders + ', ' +
      'Signature=' + signature;
    
    return {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/json; charset=utf-8',
      'host': this.config.host,
      'x-amz-date': amzDate,
      'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.' + payload.Operation,
      'Authorization': authorizationHeader
    };
  }

  /**
   * Search for items on Amazon using keywords
   */
  async searchItems(request: SearchItemsRequest): Promise<any> {
    try {
      const operation = 'SearchItems';
      const path = '/paapi5/searchitems';
      
      const payload = {
        Operation: operation,
        PartnerTag: this.config.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
        Keywords: request.Keywords || '',
        SearchIndex: request.SearchIndex || 'All',
        ItemCount: request.ItemCount || 10,
        Resources: request.Resources || this.defaultResources
      };
      
      if (request.BrowseNodeId) {
        payload['BrowseNodeId'] = request.BrowseNodeId;
      }
      
      if (request.SortBy) {
        payload['SortBy'] = request.SortBy;
      }
      
      const headers = this.generateHeaders(path, payload);
      
      const response = await axios({
        method: 'post',
        url: `https://${this.config.host}${path}`,
        headers: headers,
        data: payload
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching Amazon items:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for specific items by their ASINs
   */
  async getItems(request: GetItemsRequest): Promise<any> {
    try {
      const operation = 'GetItems';
      const path = '/paapi5/getitems';
      
      const payload = {
        Operation: operation,
        PartnerTag: this.config.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
        ItemIds: request.ItemIds,
        Resources: request.Resources || this.defaultResources
      };
      
      const headers = this.generateHeaders(path, payload);
      
      const response = await axios({
        method: 'post',
        url: `https://${this.config.host}${path}`,
        headers: headers,
        data: payload
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting Amazon items:', error);
      throw error;
    }
  }

  /**
   * Search for audio gear on Amazon
   */
  async searchAudioGear(keywords: string, itemCount: number = 10): Promise<any> {
    return this.searchItems({
      Keywords: keywords,
      SearchIndex: 'Electronics',
      ItemCount: itemCount,
      Resources: this.defaultResources
    });
  }

  /**
   * Search for protective cases on Amazon
   */
  async searchCases(keywords: string, itemCount: number = 10): Promise<any> {
    return this.searchItems({
      Keywords: keywords + ' case',
      SearchIndex: 'Electronics',
      ItemCount: itemCount,
      Resources: this.defaultResources
    });
  }
}

export default AmazonPaapiClient;
