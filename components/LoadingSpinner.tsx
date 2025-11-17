import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Logo */}
      <picture>
        <source srcSet="/LiVME_2.webp" type="image/webp" />
        <img
          src="/LiVME_2.png"
          alt="LiVME"
          className="w-32 h-32 mb-8 object-contain"
        />
      </picture>

      {/* Dot animation */}
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse-dot" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-pulse-dot {
          animation: pulse-dot 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
