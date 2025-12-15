import React, { useState, useEffect } from 'react';

interface CookieConsentProps {
  onAccept: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 pr-4">
            <p className="text-sm text-gray-700">
              当サイトでは、サービスの利便性向上および広告配信のためにCookieを使用しています。
              Cookieの使用に同意いただけない場合、一部のサービス機能が利用できない可能性があります。
              詳しくは
              <a
                href="/privacy"
                className="text-primary underline hover:text-primary/80 mx-1"
              >
                プライバシーポリシー
              </a>
              をご確認ください。
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-4 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              拒否
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-6 py-2 text-sm bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              同意する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
