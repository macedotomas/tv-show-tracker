/**
 * Cache configuration based on environment
 */
export const CACHE_SETTINGS = {
  // Development settings (shorter TTL for testing)
  development: {
    TV_SHOWS_LIST_TTL: 2 * 60 * 1000,      // 2 minutes
    TV_SHOW_DETAIL_TTL: 5 * 60 * 1000,     // 5 minutes
    TV_SHOWS_COUNT_TTL: 3 * 60 * 1000,     // 3 minutes
    ACTORS_TTL: 10 * 60 * 1000,            // 10 minutes
    EPISODES_TTL: 5 * 60 * 1000,           // 5 minutes
    CLEANUP_INTERVAL: 60 * 1000,           // 1 minute cleanup
    ENABLED: true
  },
  
  // Production settings (longer TTL for performance)
  production: {
    TV_SHOWS_LIST_TTL: 15 * 60 * 1000,     // 15 minutes
    TV_SHOW_DETAIL_TTL: 30 * 60 * 1000,    // 30 minutes
    TV_SHOWS_COUNT_TTL: 20 * 60 * 1000,    // 20 minutes
    ACTORS_TTL: 60 * 60 * 1000,            // 1 hour
    EPISODES_TTL: 30 * 60 * 1000,          // 30 minutes
    CLEANUP_INTERVAL: 5 * 60 * 1000,       // 5 minute cleanup
    ENABLED: true
  },

  // Test settings (very short TTL or disabled)
  test: {
    TV_SHOWS_LIST_TTL: 1000,               // 1 second
    TV_SHOW_DETAIL_TTL: 1000,              // 1 second
    TV_SHOWS_COUNT_TTL: 1000,              // 1 second
    ACTORS_TTL: 1000,                      // 1 second
    EPISODES_TTL: 1000,                    // 1 second
    CLEANUP_INTERVAL: 500,                 // 500ms cleanup
    ENABLED: false                         // Disable cache in tests
  }
};

const environment = process.env.NODE_ENV || 'development';
export const CURRENT_CACHE_CONFIG = CACHE_SETTINGS[environment];

export default CURRENT_CACHE_CONFIG;
