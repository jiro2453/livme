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

  // デバッグ用：環境変数の確認
  console.log('AdMaxBanner - admaxId:', admaxId);
  console.log('AdMaxBanner - all env vars:', import.meta.env);

  useEffect(() => {
    // 広告IDが設定されていない場合は何もしない
    if (!admaxId || !containerRef.current) {
      return;
    }

    // 既存のスクリプトをクリア
    containerRef.current.innerHTML = '';

    // AdMax設定スクリプトを作成
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      var admax_id = '${admaxId}';
      var admax_width = '${width}';
      var admax_height = '${height}';
    `;

    // AdMaxスクリプトを作成
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.src = `https://adm.shinobi.jp/s/${admaxId}`;
    adScript.async = true;

    // スクリプトを追加
    containerRef.current.appendChild(configScript);
    containerRef.current.appendChild(adScript);

    // クリーンアップは不要（広告の表示を維持）
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
      style={{ minWidth: `${width}px`, minHeight: `${height}px` }}
    />
  );
};
