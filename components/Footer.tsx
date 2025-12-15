import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12 py-6">
      <div className="max-w-[546px] mx-auto px-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              プライバシーポリシー
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              利用規約
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="https://www.notion.so/2b16b287f66b80459cc3e6e71b102bdb"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              運営者情報
            </a>
          </div>
          <div className="text-xs text-gray-400">
            <p>© 2025 LiVME. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
