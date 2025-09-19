import { Router } from 'express';
import { getCacheStats } from '../utils/cacheHelpers.js';
import cache from '../utils/cache.js';

const router = Router();

// Get cache statistics
router.get('/stats', (req, res) => {
  try {
    const stats = getCacheStats();
    res.status(200).json({
      success: true,
      data: {
        ...stats,
        cacheHitRatio: calculateHitRatio(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cache statistics'
    });
  }
});

// Clear all cache
router.delete('/clear', (req, res) => {
  try {
    cache.clear();
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

// Delete specific cache key
router.delete('/key/:key', (req, res) => {
  try {
    const { key } = req.params;
    const deleted = cache.delete(decodeURIComponent(key));
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: `Cache key '${key}' deleted successfully`
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Cache key '${key}' not found`
      });
    }
  } catch (error) {
    console.error('Error deleting cache key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cache key'
    });
  }
});

// Simple hit ratio calculation (would need to be enhanced for production)
function calculateHitRatio() {
  // This is a simplified version - in production you'd want to track hits/misses
  return "Not implemented - would require hit/miss tracking";
}

export default router;
