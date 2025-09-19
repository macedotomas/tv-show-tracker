import cache from './cache.js';
import { CURRENT_CACHE_CONFIG } from '../config/cacheConfig.js';

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
  TV_SHOWS_LIST: {
    ttl: CURRENT_CACHE_CONFIG.TV_SHOWS_LIST_TTL,
    keyPrefix: 'tv_shows_page_'
  },
  TV_SHOW_DETAIL: {
    ttl: CURRENT_CACHE_CONFIG.TV_SHOW_DETAIL_TTL,
    keyPrefix: 'tv_show_'
  },
  TV_SHOWS_COUNT: {
    ttl: CURRENT_CACHE_CONFIG.TV_SHOWS_COUNT_TTL,
    key: 'tv_shows_total_count'
  },
  ACTORS_LIST: {
    ttl: CURRENT_CACHE_CONFIG.ACTORS_TTL,
    keyPrefix: 'actors_'
  },
  EPISODES_BY_SHOW: {
    ttl: CURRENT_CACHE_CONFIG.EPISODES_TTL,
    keyPrefix: 'episodes_show_'
  }
};

/**
 * Generate cache key for paginated TV shows
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} sortField - Sort field
 * @param {string} sortDirection - Sort direction
 * @returns {string} Cache key
 */
export function getTvShowsListCacheKey(page = 1, limit = 12, sortField = 'title', sortDirection = 'asc') {
  return `${CACHE_CONFIG.TV_SHOWS_LIST.keyPrefix}${page}_${limit}_${sortField}_${sortDirection}`;
}

/**
 * Generate cache key for individual TV show
 * @param {number|string} showId - TV show ID
 * @returns {string} Cache key
 */
export function getTvShowDetailCacheKey(showId) {
  return `${CACHE_CONFIG.TV_SHOW_DETAIL.keyPrefix}${showId}`;
}

/**
 * Generate cache key for episodes by show
 * @param {number|string} showId - TV show ID
 * @returns {string} Cache key
 */
export function getEpisodesCacheKey(showId) {
  return `${CACHE_CONFIG.EPISODES_BY_SHOW.keyPrefix}${showId}`;
}

/**
 * Cache TV shows list with pagination
 * @param {string} cacheKey - Cache key
 * @param {object} data - Data to cache (including pagination metadata)
 */
export function cacheTvShowsList(cacheKey, data) {
  if (!CURRENT_CACHE_CONFIG.ENABLED) return;
  cache.set(cacheKey, data, CACHE_CONFIG.TV_SHOWS_LIST.ttl);
}

/**
 * Cache individual TV show details
 * @param {number|string} showId - TV show ID
 * @param {object} data - TV show data
 */
export function cacheTvShowDetail(showId, data) {
  if (!CURRENT_CACHE_CONFIG.ENABLED) return;
  const cacheKey = getTvShowDetailCacheKey(showId);
  cache.set(cacheKey, data, CACHE_CONFIG.TV_SHOW_DETAIL.ttl);
}

/**
 * Cache total TV shows count
 * @param {number} count - Total count
 */
export function cacheTvShowsCount(count) {
  if (!CURRENT_CACHE_CONFIG.ENABLED) return;
  cache.set(CACHE_CONFIG.TV_SHOWS_COUNT.key, count, CACHE_CONFIG.TV_SHOWS_COUNT.ttl);
}

/**
 * Get cached TV shows list
 * @param {string} cacheKey - Cache key
 * @returns {object|null} Cached data or null
 */
export function getCachedTvShowsList(cacheKey) {
  if (!CURRENT_CACHE_CONFIG.ENABLED) return null;
  return cache.get(cacheKey);
}

/**
 * Get cached TV show details
 * @param {number|string} showId - TV show ID
 * @returns {object|null} Cached data or null
 */
export function getCachedTvShowDetail(showId) {
  if (!CURRENT_CACHE_CONFIG.ENABLED) return null;
  const cacheKey = getTvShowDetailCacheKey(showId);
  return cache.get(cacheKey);
}

/**
 * Get cached TV shows count
 * @returns {number|null} Cached count or null
 */
export function getCachedTvShowsCount() {
  if (!CURRENT_CACHE_CONFIG.ENABLED) return null;
  return cache.get(CACHE_CONFIG.TV_SHOWS_COUNT.key);
}

/**
 * Invalidate cache entries related to TV shows
 * This should be called when TV shows are created, updated, or deleted
 */
export function invalidateTvShowsCache() {
  // Clear all TV shows list cache entries
  const stats = cache.getStats();
  const tvShowKeys = stats.keys.filter(key => 
    key.startsWith(CACHE_CONFIG.TV_SHOWS_LIST.keyPrefix) ||
    key === CACHE_CONFIG.TV_SHOWS_COUNT.key
  );
  
  tvShowKeys.forEach(key => cache.delete(key));
  console.log(`Cache invalidated: ${tvShowKeys.length} TV shows cache entries removed`);
}

/**
 * Invalidate specific TV show detail cache
 * @param {number|string} showId - TV show ID
 */
export function invalidateTvShowDetailCache(showId) {
  const cacheKey = getTvShowDetailCacheKey(showId);
  cache.delete(cacheKey);
  
  // Also invalidate episodes cache for this show
  const episodesCacheKey = getEpisodesCacheKey(showId);
  cache.delete(episodesCacheKey);
  
  console.log(`Cache invalidated: TV show ${showId} detail cache removed`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats();
}

export default cache;
