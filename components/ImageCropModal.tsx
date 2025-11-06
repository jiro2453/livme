import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  imageUrl: string;
  aspectRatio?: number; // 1 for square (avatar), undefined for free (gallery)
  title?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  imageUrl,
  aspectRatio = 1,
  title = '画像をクロップ',
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;

    // Set initial crop based on aspect ratio
    const { width, height } = e.currentTarget;
    const cropWidth = Math.min(width, height * (aspectRatio || 1));
    const cropHeight = aspectRatio ? cropWidth / aspectRatio : Math.min(height, width);

    const crop: Crop = {
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
    };

    setCrop(crop);
    setCompletedCrop(crop as PixelCrop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async (): Promise<string | null> => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [completedCrop]);

  const handleComplete = async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100000]">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="flex items-center justify-center min-h-[400px]">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-w-full"
            >
              <img
                src={imageUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </ReactCrop>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-white">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-full"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleComplete}
            className="rounded-full bg-primary text-white hover:bg-primary/90"
          >
            <Check className="h-4 w-4 mr-2" />
            完了
          </Button>
        </div>
      </div>
    </div>
  );
};
