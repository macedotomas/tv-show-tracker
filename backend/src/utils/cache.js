/**
 * Simple in-memory cache with TTL (Time To Live) support
 * Automatically prunes expired entries
 */
class Cache {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
    
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds
   */
  set(key, value, ttlMs = 5 * 60 * 1000) { // Default 5 minutes
    // Clear existing timer if key already exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store the value with timestamp
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlMs
    });

    // Set timer to remove expired entry
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlMs);

    this.timers.set(key, timer);

    console.log(`Cache SET: ${key} (TTL: ${ttlMs}ms)`);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const entry = this.store.get(key);
    
    if (!entry) {
      console.log(`Cache MISS: ${key}`);
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.delete(key);
      console.log(`Cache EXPIRED: ${key}`);
      return null;
    }

    console.log(`Cache HIT: ${key}`);
    return entry.value;
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    const deleted = this.store.delete(key);
    if (deleted) {
      console.log(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Check if a key exists in cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.timers.clear();
    this.store.clear();
    console.log('Cache CLEARED');
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        expiresAt: new Date(entry.timestamp + entry.ttl),
        isExpired: Date.now() - entry.timestamp > entry.ttl
      }))
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cache CLEANUP: Removed ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Destroy the cache and cleanup intervals
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Create a singleton cache instance
const cache = new Cache();

// Graceful shutdown
process.on('SIGTERM', () => cache.destroy());
process.on('SIGINT', () => cache.destroy());

export default cache;
