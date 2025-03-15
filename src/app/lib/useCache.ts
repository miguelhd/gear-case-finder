import { useEffect, useState } from 'react';

type CacheItem<T> = {
  data: T;
  timestamp: number;
};

type UseCacheOptions = {
  key: string;
  expiration?: number; // in milliseconds
  initialData?: any;
};

// Default cache expiration time (5 minutes)
const DEFAULT_EXPIRATION = 5 * 60 * 1000;

export function useCache<T>({ key, expiration = DEFAULT_EXPIRATION, initialData }: UseCacheOptions) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadFromCache = () => {
      try {
        const cachedItem = localStorage.getItem(`cache_${key}`);
        if (cachedItem) {
          const { data, timestamp }: CacheItem<T> = JSON.parse(cachedItem);
          const now = Date.now();
          
          // Check if cache is still valid
          if (now - timestamp < expiration) {
            setData(data);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error loading from cache:', error);
        return false;
      }
    };

    loadFromCache();
  }, [key, expiration]);

  // Function to update cache
  const updateCache = (newData: T) => {
    try {
      setData(newData);
      const cacheItem: CacheItem<T> = {
        data: newData,
        timestamp: Date.now(),
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error updating cache:', error);
    }
  };

  // Function to fetch data with caching
  const fetchWithCache = async (fetchFn: () => Promise<T>, forceRefresh = false) => {
    setLoading(true);
    try {
      // If force refresh is requested, skip cache check
      if (forceRefresh) {
        const freshData = await fetchFn();
        updateCache(freshData);
        setLoading(false);
        return freshData;
      }

      // Try to load from cache first
      const cachedItem = localStorage.getItem(`cache_${key}`);
      if (cachedItem) {
        const { data, timestamp }: CacheItem<T> = JSON.parse(cachedItem);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < expiration) {
          setData(data);
          setLoading(false);
          return data;
        }
      }

      // If no valid cache, fetch fresh data
      const freshData = await fetchFn();
      updateCache(freshData);
      setLoading(false);
      return freshData;
    } catch (error) {
      console.error('Error in fetchWithCache:', error);
      setLoading(false);
      throw error;
    }
  };

  // Function to clear cache
  const clearCache = () => {
    localStorage.removeItem(`cache_${key}`);
    setData(initialData);
  };

  return {
    data,
    loading,
    updateCache,
    fetchWithCache,
    clearCache,
  };
}
