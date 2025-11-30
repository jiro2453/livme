import React, { useEffect, useRef } from 'react';

interface AdMaxBannerProps {
  admaxId?: string;
  width?: string;
  height?: string;
  className?: string;
}

export const AdMaxBanner: React.FC<AdMaxBannerProps> = ({
  admaxId,
  width = '300',
  height = '250',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // 広告IDが設定されていない場合は何もしない
    if (!admaxId) {
      console.warn('AdMax ID is not set. Please set VITE_ADMAX_ID in your .env file');
      return;
    }

    // 既にスクリプトがロードされている場合はスキップ
    if (scriptLoadedRef.current) {
      return;
    }

    // 忍者AdMaxのスクリプトを動的に追加
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;

    // AdMax変数をグローバルスコープに設定
    (window as any).admax_id = admaxId;
    (window as any).admax_width = width;
    (window as any).admax_height = height;

    // AdMaxのスクリプトURLを設定
    script.src = `https://adm.shinobi.jp/s/${admaxId}`;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
      scriptLoadedRef.current = true;
    }

    return () => {
      // クリーンアップ
      if (containerRef.current && script.parentNode) {
        containerRef.current.removeChild(script);
      }
      scriptLoadedRef.current = false;
    };
  }, [admaxId, width, height]);

  // 広告IDが設定されていない場合はプレースホルダーを表示
  if (!admaxId) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="text-center text-gray-500 text-sm px-4">
          <p className="font-semibold">広告スペース</p>
          <p className="text-xs mt-1">VITE_ADMAX_IDを設定してください</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`admax-banner ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
