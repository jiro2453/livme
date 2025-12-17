import React, { useEffect, useRef } from 'react';

interface AdMaxBannerProps {
  adMaxId: string;
  className?: string;
  width?: string;
  height?: string;
}

// Extend window type for AdMax
declare global {
  interface Window {
    admaxads: any[];
  }
}

export const AdMaxBanner: React.FC<AdMaxBannerProps> = ({
  adMaxId,
  className = '',
  width,
  height
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const container = adContainerRef.current;
    if (!container || isLoadedRef.current) return;

    console.log('[AdMaxBanner] Initializing ad:', adMaxId);

    // Clear any existing content
    container.innerHTML = '';

    // Initialize admaxads array if not exists
    window.admaxads = window.admaxads || [];

    // Create ad div
    const adDiv = document.createElement('div');
    adDiv.className = 'admax-ads';
    adDiv.setAttribute('data-admax-id', adMaxId);

    const style = 'display:inline-block;' +
      (width ? `width:${width};` : '') +
      (height ? `height:${height};` : '');
    adDiv.setAttribute('style', style);

    // Append ad div first
    container.appendChild(adDiv);

    // Push to admaxads array
    try {
      window.admaxads.push({ admax_id: adMaxId, type: "banner" });
      console.log('[AdMaxBanner] Pushed to admaxads:', adMaxId);
    } catch (error) {
      console.error('[AdMaxBanner] Error pushing to admaxads:', error);
    }

    // Load script if not already loaded
    const existingScript = document.querySelector('script[src="https://adm.shinobi.jp/st/t.js"]');
    if (!existingScript) {
      const loaderScript = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.charset = 'utf-8';
      loaderScript.src = 'https://adm.shinobi.jp/st/t.js';
      loaderScript.async = true;

      loaderScript.onload = () => {
        console.log('[AdMaxBanner] Script loaded successfully');
      };

      loaderScript.onerror = () => {
        console.error('[AdMaxBanner] Failed to load script');
      };

      document.body.appendChild(loaderScript);
      console.log('[AdMaxBanner] Script appended to body');
    } else {
      console.log('[AdMaxBanner] Script already exists');
    }

    isLoadedRef.current = true;

    return () => {
      // Don't clear on unmount to preserve ads
      console.log('[AdMaxBanner] Component unmounting:', adMaxId);
    };
  }, [adMaxId, width, height]);

  return <div ref={adContainerRef} className={className} />;
};
