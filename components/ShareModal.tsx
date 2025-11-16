import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import logo from './assets/LiVME_2.png';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, userId }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/${userId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'コピーしました',
        description: 'URLをクリップボードにコピーしました',
        variant: 'success',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'URLのコピーに失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `livme-qr-${userId}.png`;
          a.click();
          URL.revokeObjectURL(url);

          toast({
            title: 'ダウンロードしました',
            description: 'QRコードを保存しました',
            variant: 'success',
          });
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle>プロフィール共有</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-primary">
              <QRCodeSVG
                id="qr-code-svg"
                value={shareUrl}
                size={256}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: logo,
                  x: undefined,
                  y: undefined,
                  height: 50,
                  width: 50,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              QRコードをスキャンしてプロフィールを表示
            </p>
          </div>

          {/* URL Copy */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">プロフィールURL</p>
            <div className="flex gap-2">
              <input
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownloadQR}
            className="w-full"
            variant="default"
          >
            <Download className="h-4 w-4 mr-2" />
            QRコードをダウンロード
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
