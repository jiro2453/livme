import React, { useEffect, useRef } from 'react';

interface AdMaxBannerProps {
  adMaxId: string;
  className?: string;
  width?: string;
  height?: string;
}

export const AdMaxBanner: React.FC<AdMaxBannerProps> = ({
  adMaxId,
  className = '',
  width,
  height
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = adContainerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create ad div
    const adDiv = document.createElement('div');
    adDiv.className = 'admax-ads';
    adDiv.setAttribute('data-admax-id', adMaxId);

    const style = 'display:inline-block;' +
      (width ? `width:${width};` : '') +
      (height ? `height:${height};` : '');
    adDiv.setAttribute('style', style);

    // Create push script
    const pushScript = document.createElement('script');
    pushScript.type = 'text/javascript';
    pushScript.text = `(admaxads = window.admaxads || []).push({admax_id: "${adMaxId}", type: "banner"});`;

    // Create loader script only if not already loaded
    const loaderScript = document.createElement('script');
    loaderScript.type = 'text/javascript';
    loaderScript.charset = 'utf-8';
    loaderScript.src = 'https://adm.shinobi.jp/st/t.js';
    loaderScript.async = true;

    // Append elements
    container.appendChild(adDiv);
    container.appendChild(pushScript);
    
    // Check if loader script is already in document
    if (!document.querySelector('script[src="https://adm.shinobi.jp/st/t.js"]')) {
      container.appendChild(loaderScript);
    }

    return () => {
      // Cleanup on unmount
      container.innerHTML = '';
    };
  }, [adMaxId, width, height]);

  return <div ref={adContainerRef} className={className} />;
};
