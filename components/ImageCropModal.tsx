import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBase64: string) => void;
  imageUrl: string;
  aspectRatio?: number; // 1 for square (avatar), undefined for free (gallery)
  title?: string;
  circularCrop?: boolean; // true for circular crop (avatar)
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined
) {
  const percentCrop = centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect || 1,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );

  return percentCrop;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  imageUrl,
  aspectRatio,
  title = '画像をクロップ',
  circularCrop = false,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset crop when modal opens or image changes
  useEffect(() => {
    if (isOpen && imageUrl) {
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [isOpen, imageUrl]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }

  async function generateCroppedImage(): Promise<string | null> {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    if (!image || !canvas || !crop) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    ctx.save();

    // 円形クロップの場合、円形のクリッピングパスを作成
    if (circularCrop) {
      const centerX = cropWidth / 2;
      const centerY = cropHeight / 2;
      const radius = Math.min(cropWidth, cropHeight) / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();
    }

    ctx.translate(-cropX, -cropY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(blob);
        },
        circularCrop ? 'image/png' : 'image/jpeg',
        0.95
      );
    });
  }

  const handleComplete = async () => {
    const croppedImageBase64 = await generateCroppedImage();
    if (croppedImageBase64) {
      onCropComplete(croppedImageBase64);
      onClose();
    }
  };

  const handleCancel = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
      style={{
        zIndex: 200000,
        pointerEvents: 'auto'
      }}
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="flex items-center justify-center">
            {imageUrl && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minWidth={50}
                minHeight={50}
                circularCrop={circularCrop}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="クロップする画像"
                  onLoad={onImageLoad}
                  style={{ maxHeight: '60vh', maxWidth: '100%' }}
                />
              </ReactCrop>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-white">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="rounded-full"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleComplete}
            className="rounded-full bg-primary text-white hover:bg-primary/90"
            disabled={!completedCrop}
          >
            <Check className="h-4 w-4 mr-2" />
            完了
          </Button>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>,
    document.body
  );
};
