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
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double loading in development mode
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const container = adContainerRef.current;
    if (!container) return;

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

    // Create loader script
    const loaderScript = document.createElement('script');
    loaderScript.type = 'text/javascript';
    loaderScript.charset = 'utf-8';
    loaderScript.src = 'https://adm.shinobi.jp/st/t.js';
    loaderScript.async = true;

    // Append elements
    container.appendChild(adDiv);
    container.appendChild(pushScript);
    container.appendChild(loaderScript);

    return () => {
      // Cleanup on unmount
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      scriptLoadedRef.current = false;
    };
  }, [adMaxId, width, height]);

  return <div ref={adContainerRef} className={className} />;
};
