import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/useToast';
import { createLive, updateLive } from '../lib/api';
import type { Live } from '../types';

interface AddLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
  editingLive?: Live | null;
}

export const AddLiveModal: React.FC<AddLiveModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
  editingLive,
}) => {
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingLive) {
      setArtist(editingLive.artist);
      setDate(editingLive.date);
      setVenue(editingLive.venue);
      setDescription(editingLive.description || '');
    } else {
      resetForm();
    }
  }, [editingLive, isOpen]);

  const resetForm = () => {
    setArtist('');
    setDate('');
    setVenue('');
    setDescription('');
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
        description: description || undefined,
      };

      if (editingLive) {
        await updateLive(editingLive.id, liveData);
        toast({
          title: '更新しました',
          description: 'ライブ情報を更新しました',
          variant: 'success',
        });
      } else {
        await createLive(liveData);
        toast({
          title: '追加しました',
          description: '新しいライブを追加しました',
          variant: 'success',
        });
      }

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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full shadow-sm border border-primary/30 bg-white">
        <DialogHeader>
          <DialogTitle className="text-[21px] font-bold text-center">
            {editingLive ? 'ライブ編集' : 'ライブ追加'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artist" className="text-sm">アーティスト名 *</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="山田太郎"
              className="text-sm bg-yellow-50 border-yellow-100 focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm">日付 *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm bg-yellow-50 border-yellow-100 focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue" className="text-sm">会場 *</Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="渋谷クラブクアトロ"
              className="text-sm bg-yellow-50 border-yellow-100 focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ライブの詳細説明"
              className="text-sm bg-yellow-50 border-yellow-100 focus:border-primary focus:ring-primary"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="text-sm h-12 font-medium">
              キャンセル
            </Button>
            <Button type="submit" disabled={loading} className="text-sm h-12 font-medium">
              {loading ? '保存中...' : editingLive ? '更新' : '追加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
