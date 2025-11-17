import React from 'react';
import { Share } from 'lucide-react';
import { Icons } from './assets/Icons';

interface SocialIconsProps {
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  onShare?: () => void;
}

export const SocialIcons: React.FC<SocialIconsProps> = ({ socialLinks, onShare }) => {
  const handleSocialClick = (platform: string, username?: string) => {
    if (!username) return;

    const urls = {
      instagram: `https://instagram.com/${username.replace('@', '')}`,
      twitter: `https://x.com/${username.replace('@', '')}`,
      tiktok: `https://tiktok.com/@${username.replace('@', '')}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {socialLinks?.instagram && (
        <button
          onClick={() => handleSocialClick('instagram', socialLinks.instagram)}
          className="hover:opacity-80 transition-opacity"
          aria-label="Instagram"
        >
          <picture>
            <source srcSet={Icons.instagramWebp} type="image/webp" />
            <img src={Icons.instagram} alt="Instagram" className="h-[35px] w-[35px]" loading="lazy" decoding="async" />
          </picture>
        </button>
      )}

      {socialLinks?.twitter && (
        <button
          onClick={() => handleSocialClick('twitter', socialLinks.twitter)}
          className="hover:opacity-80 transition-opacity"
          aria-label="X (Twitter)"
        >
          <picture>
            <source srcSet={Icons.xWebp} type="image/webp" />
            <img src={Icons.x} alt="X" className="h-[35px] w-[35px]" loading="lazy" decoding="async" />
          </picture>
        </button>
      )}

      {socialLinks?.tiktok && (
        <button
          onClick={() => handleSocialClick('tiktok', socialLinks.tiktok)}
          className="hover:opacity-80 transition-opacity"
          aria-label="TikTok"
        >
          <picture>
            <source srcSet={Icons.tiktokWebp} type="image/webp" />
            <img src={Icons.tiktok} alt="TikTok" className="h-[35px] w-[35px]" loading="lazy" decoding="async" />
          </picture>
        </button>
      )}

      {onShare && (
        <button
          onClick={onShare}
          className="h-[35px] w-[35px] rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label="Share"
        >
          <Share className="h-[20px] w-[20px] text-white" />
        </button>
      )}
    </div>
  );
};
