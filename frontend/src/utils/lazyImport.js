/**
 * Utility for optimized lazy loading of components
 * This helps with better code splitting and chunk management
 */
import { lazy } from 'react';

/**
 * Enhanced lazy import function that provides better naming in dev tools
 * and allows for more granular code splitting
 * 
 * @param {Function} factory - Import function
 * @param {String} exportName - Name of the export (for named exports)
 * @param {String} chunkName - Optional chunk name for better debugging
 * @returns {React.LazyExoticComponent}
 */
export function lazyImport(factory, exportName = 'default', chunkName = '') {
  // For named exports
  if (exportName !== 'default') {
    return lazy(async () => {
      const module = await factory();
      return { default: module[exportName] };
    });
  }
  
  // For default exports with chunk naming
  if (chunkName) {
    return lazy(() => 
      factory()
        .then(module => {
          // This comment helps webpack with chunk naming
          // webpackChunkName: "[chunkName]"
          return { default: module.default };
        })
    );
  }
  
  // Simple default export
  return lazy(factory);
}

/**
 * Example usage:
 * 
 * // Default export
 * const Home = lazyImport(() => import('./pages/Home'));
 * 
 * // Named export
 * const { Button } = lazyImport(() => import('./components/UI'), 'Button');
 * 
 * // With chunk naming
 * const AdminDashboard = lazyImport(() => import('./pages/admin/Dashboard'), 'default', 'admin');
 */
