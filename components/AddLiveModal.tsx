import React, { useState, useEffect, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { cn } from '../lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/useToast';
import { createLive, getArtistSuggestions, getVenueSuggestions } from '../lib/api';

interface AddLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export const AddLiveModal: React.FC<AddLiveModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}) => {
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [artistSuggestions, setArtistSuggestions] = useState<string[]>([]);
  const [venueSuggestions, setVenueSuggestions] = useState<string[]>([]);
  const [showArtistSuggestions, setShowArtistSuggestions] = useState(false);
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);
  const artistInputRef = useRef<HTMLInputElement>(null);
  const venueInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Fetch artist suggestions when artist input changes
  useEffect(() => {
    const fetchArtistSuggestions = async () => {
      if (artist.length >= 1) {
        const suggestions = await getArtistSuggestions(artist);
        setArtistSuggestions(suggestions);
      } else {
        setArtistSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchArtistSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [artist]);

  // Fetch venue suggestions when venue input changes
  useEffect(() => {
    const fetchVenueSuggestions = async () => {
      if (venue.length >= 1) {
        const suggestions = await getVenueSuggestions(venue);
        setVenueSuggestions(suggestions);
      } else {
        setVenueSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchVenueSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [venue]);

  const resetForm = () => {
    setArtist('');
    setDate('');
    setVenue('');
    setArtistSuggestions([]);
    setVenueSuggestions([]);
    setShowArtistSuggestions(false);
    setShowVenueSuggestions(false);
  };

  const handleArtistSelect = (selectedArtist: string) => {
    setArtist(selectedArtist);
    setShowArtistSuggestions(false);
  };

  const handleVenueSelect = (selectedVenue: string) => {
    setVenue(selectedVenue);
    setShowVenueSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!artist || !date || !venue) {
      toast({
        title: 'エラー',
        description: 'アーティスト名、日付、会場は必須です',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const liveData = {
        created_by: userId,
        artist,
        date,
        venue,
      };

      await createLive(liveData);
      toast({
        title: '追加しました',
        description: '新しいライブを追加しました',
        variant: 'success',
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message || '操作に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay style={{ zIndex: 120 }} />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            "w-[calc(100vw-2rem)] max-w-md sm:w-full shadow-sm border border-primary/30 bg-white"
          )}
          style={{ zIndex: 120 }}
        >
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <DialogHeader>
            <DialogTitle className="text-[15.75px] font-bold text-center">
              ライブ追加
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 relative">
              <Label htmlFor="artist" className="text-sm text-center block">アーティスト名 *</Label>
              <Input
                ref={artistInputRef}
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onFocus={() => setShowArtistSuggestions(true)}
                onBlur={() => setTimeout(() => setShowArtistSuggestions(false), 200)}
                placeholder="アーティスト名"
                className="text-sm bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                required
                autoComplete="off"
              />
              {showArtistSuggestions && artistSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {artistSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleArtistSelect(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm text-center block">日付 *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="venue" className="text-sm text-center block">会場 *</Label>
              <Input
                ref={venueInputRef}
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                onFocus={() => setShowVenueSuggestions(true)}
                onBlur={() => setTimeout(() => setShowVenueSuggestions(false), 200)}
                placeholder="日本武道館"
                className="text-sm bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                required
                autoComplete="off"
              />
              {showVenueSuggestions && venueSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {venueSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleVenueSelect(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white text-sm rounded-full px-6 py-2.5 sm:px-8 sm:py-3 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '追加中...' : '追加'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-sm rounded-full px-5 py-2.5 sm:px-6 sm:py-3 border border-input bg-white hover:bg-gray-100 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                キャンセル
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
