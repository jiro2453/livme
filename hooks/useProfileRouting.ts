import { useState, useEffect, useCallback } from 'react';

/**
 * Get current pathname from URL
 */
const getPathFromUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '/';
};

/**
 * Extract user_id from pathname
 * @param path - URL pathname (e.g., "/jiro2453")
 * @returns user_id or null
 *
 * Examples:
 * - "/" -> null
 * - "/jiro2453" -> "jiro2453"
 * - "/jiro2453/profile" -> null (invalid format)
 */
const getUserIdFromPath = (path: string): string | null => {
  const trimmedPath = path.replace(/^\//, ''); // Remove leading slash

  // Empty or contains additional slashes -> invalid
  if (!trimmedPath || trimmedPath.includes('/')) {
    return null;
  }

  return trimmedPath;
};

/**
 * Update browser URL without page reload
 * @param path - New path (user_id or '/')
 */
const updateUrl = (path: string): void => {
  if (typeof window !== 'undefined') {
    const newUrl = path === '/' ? '/' : `/${path}`;
    window.history.pushState({}, '', newUrl);
  }
};

/**
 * Hook for managing profile routing with URL
 *
 * URL Structure:
 * - Home: /
 * - Own profile: / (no URL change)
 * - Other user's profile: /:user_id
 *
 * @returns {Object} routing utilities
 * - urlUserId: Current user_id from URL (null for home)
 * - navigateToProfile: Navigate to user profile
 * - navigateToHome: Navigate to home
 */
export const useProfileRouting = () => {
  const [urlUserId, setUrlUserId] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Handle location changes (initial load and popstate events)
     */
    const handleLocationChange = () => {
      const path = getPathFromUrl();
      const userId = getUserIdFromPath(path);
      setUrlUserId(userId);
    };

    // Initial check
    handleLocationChange();

    // Listen for browser back/forward
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  /**
   * Navigate to a user's profile page
   * @param userId - Target user's user_id
   */
  const navigateToProfile = useCallback((userId: string) => {
    updateUrl(userId);
    setUrlUserId(userId);
  }, []);

  /**
   * Navigate to home page
   */
  const navigateToHome = useCallback(() => {
    updateUrl('/');
    setUrlUserId(null);
  }, []);

  return {
    urlUserId,
    navigateToProfile,
    navigateToHome,
  };
};
