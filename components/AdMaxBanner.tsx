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

  useEffect(() => {
    // 広告IDが設定されていない場合は何もしない
    if (!admaxId || !containerRef.current) {
      return;
    }

    // 既存のスクリプトをクリア
    containerRef.current.innerHTML = '';

    // 開始コメント
    const startComment = document.createComment(' admax ');

    // AdMaxスクリプトを作成（シンプルな形式）
    const adScript = document.createElement('script');
    adScript.src = `https://adm.shinobi.jp/s/${admaxId}`;

    // 終了コメント
    const endComment = document.createComment(' admax ');

    // スクリプトを追加
    containerRef.current.appendChild(startComment);
    containerRef.current.appendChild(adScript);
    containerRef.current.appendChild(endComment);

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
