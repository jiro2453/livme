import React, { useState, useEffect } from 'react';
import { X, Loader2, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { getFollowers, getFollowing } from '../lib/api';
import type { User } from '../types';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string; // The UUID of the user whose followers/following to display
  initialTab?: 'followers' | 'following';
  onUserClick?: (userId: string) => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialTab = 'followers',
  onUserClick,
}) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);

  // Reset active tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && userId) {
      loadFollowers();
      loadFollowing();
    }
  }, [isOpen, userId]);

  const loadFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const users = await getFollowers(userId);
      setFollowers(users);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const loadFollowing = async () => {
    setLoadingFollowing(true);
    try {
      const users = await getFollowing(userId);
      setFollowing(users);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleUserClick = (user: User) => {
    if (onUserClick) {
      onUserClick(user.user_id);
      onClose();
    }
  };

  const renderUserList = (users: User[], loading: boolean) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <UserIcon className="w-12 h-12 mb-2 text-gray-300" />
          <p className="text-sm">ユーザーがいません</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback className="bg-gray-400 text-white">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-black">{user.name}</div>
              {user.user_id && (
                <div className="text-xs text-gray-500">@{user.user_id}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="w-[calc(100vw-2rem)] max-w-md max-h-[80vh] p-0 bg-white overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-black">
            フォロー
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')} className="w-full">
          <div className="sticky top-[65px] bg-white border-b border-gray-200 px-6">
            <TabsList className="w-full grid grid-cols-2 bg-transparent h-12">
              <TabsTrigger
                value="following"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                フォロー中 ({following.length})
              </TabsTrigger>
              <TabsTrigger
                value="followers"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                フォロワー ({followers.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-130px)] px-6 py-4">
            <TabsContent value="following" className="mt-0">
              {renderUserList(following, loadingFollowing)}
            </TabsContent>

            <TabsContent value="followers" className="mt-0">
              {renderUserList(followers, loadingFollowers)}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
