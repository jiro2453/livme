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
 * Parse pathname into route type and identifier
 * @param path - URL pathname
 * @returns Route information
 *
 * Examples:
 * - "/" -> { type: 'home', value: null }
 * - "/privacy" -> { type: 'privacy', value: null }
 * - "/terms" -> { type: 'terms', value: null }
 * - "/jiro2453" -> { type: 'profile', value: 'jiro2453' }
 */
const parseRoute = (path: string): { type: 'home' | 'privacy' | 'terms' | 'profile'; value: string | null } => {
  const trimmedPath = path.replace(/^\//, ''); // Remove leading slash

  // Empty path -> home
  if (!trimmedPath) {
    return { type: 'home', value: null };
  }

  // Contains additional slashes -> invalid, treat as home
  if (trimmedPath.includes('/')) {
    return { type: 'home', value: null };
  }

  // Special routes
  if (trimmedPath === 'privacy') {
    return { type: 'privacy', value: null };
  }
  if (trimmedPath === 'terms') {
    return { type: 'terms', value: null };
  }

  // Otherwise, treat as user profile
  return { type: 'profile', value: trimmedPath };
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
  const route = parseRoute(path);
  return route.type === 'profile' ? route.value : null;
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
 * - Privacy policy: /privacy
 * - Terms of service: /terms
 *
 * @returns {Object} routing utilities
 * - urlUserId: Current user_id from URL (null for home)
 * - currentRoute: Current route type
 * - navigateToProfile: Navigate to user profile
 * - navigateToHome: Navigate to home
 * - navigateToPrivacy: Navigate to privacy policy
 * - navigateToTerms: Navigate to terms of service
 */
export const useProfileRouting = () => {
  const [urlUserId, setUrlUserId] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'privacy' | 'terms' | 'profile'>('home');

  useEffect(() => {
    /**
     * Handle location changes (initial load and popstate events)
     */
    const handleLocationChange = () => {
      const path = getPathFromUrl();
      const route = parseRoute(path);
      setCurrentRoute(route.type);
      setUrlUserId(route.type === 'profile' ? route.value : null);
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
    setCurrentRoute('profile');
  }, []);

  /**
   * Navigate to home page
   */
  const navigateToHome = useCallback(() => {
    updateUrl('/');
    setUrlUserId(null);
    setCurrentRoute('home');
  }, []);

  /**
   * Navigate to privacy policy page
   */
  const navigateToPrivacy = useCallback(() => {
    updateUrl('privacy');
    setUrlUserId(null);
    setCurrentRoute('privacy');
  }, []);

  /**
   * Navigate to terms of service page
   */
  const navigateToTerms = useCallback(() => {
    updateUrl('terms');
    setUrlUserId(null);
    setCurrentRoute('terms');
  }, []);

  return {
    urlUserId,
    currentRoute,
    navigateToProfile,
    navigateToHome,
    navigateToPrivacy,
    navigateToTerms,
  };
};
