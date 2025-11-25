import React, { useState, useEffect } from 'react';
import { X, Loader2, User as UserIcon, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { getFollowers, getFollowing, getUserByUserId, followUser, isFollowing } from '../lib/api';
import { useToast } from '../hooks/useToast';
import type { User } from '../types';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string; // The UUID of the user whose followers/following to display
  initialTab?: 'followers' | 'following' | 'search';
  onUserClick?: (userId: string) => void;
  currentUserId?: string; // Current logged-in user's UUID for follow functionality
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialTab = 'followers',
  onUserClick,
  currentUserId,
}) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following' | 'search'>(initialTab);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

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

  // Incremental search - auto search when query changes
  useEffect(() => {
    if (activeTab !== 'search' || !searchQuery.trim()) {
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

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

  // Search for user by user_id
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('ユーザーIDを入力してください');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const user = await getUserByUserId(searchQuery.trim());

      if (!user) {
        setSearchError('ユーザーが見つかりませんでした');
      } else if (user.id === currentUserId) {
        setSearchError('自分自身は検索できません');
      } else {
        setSearchResult(user);
        // Check if already following this user
        if (currentUserId) {
          const following = await isFollowing(currentUserId, user.id);
          setFollowingStatus({ [user.id]: following });
        }
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setSearchError('検索中にエラーが発生しました');
    } finally {
      setSearching(false);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (targetUser: User) => {
    if (!currentUserId) return;

    setFollowLoading({ ...followLoading, [targetUser.id]: true });

    try {
      const isCurrentlyFollowing = followingStatus[targetUser.id];

      if (isCurrentlyFollowing) {
        // Unfollow logic would go here
        toast({
          title: 'フォロー解除',
          description: `${targetUser.name}のフォローを解除しました`,
        });
        setFollowingStatus({ ...followingStatus, [targetUser.id]: false });
      } else {
        // Follow
        const success = await followUser(currentUserId, targetUser.id);
        if (success) {
          toast({
            title: 'フォローしました',
            description: `${targetUser.name}をフォローしました`,
            variant: 'success',
          });
          setFollowingStatus({ ...followingStatus, [targetUser.id]: true });
        } else {
          toast({
            title: 'エラー',
            description: 'フォローに失敗しました',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'エラー',
        description: 'フォロー操作に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setFollowLoading({ ...followLoading, [targetUser.id]: false });
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

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following' | 'search')} className="w-full">
          <div className="sticky top-[65px] bg-white border-b border-gray-200 px-6">
            <TabsList className="w-full grid grid-cols-3 bg-transparent h-12">
              <TabsTrigger
                value="following"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent text-xs"
              >
                フォロー中
              </TabsTrigger>
              <TabsTrigger
                value="followers"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent text-xs"
              >
                フォロワー
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent text-xs"
              >
                友達を見つける
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

            <TabsContent value="search" className="mt-0">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSearchError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                        placeholder="ユーザーIDを入力"
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={searching || !searchQuery.trim()}
                      className="px-6"
                    >
                      {searching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        '検索'
                      )}
                    </Button>
                  </div>

                  {/* Error Message */}
                  {searchError && (
                    <p className="text-sm text-red-500">{searchError}</p>
                  )}
                </div>

                {/* Search Result */}
                {searchResult && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-12 w-12 cursor-pointer"
                        onClick={() => handleUserClick(searchResult)}
                      >
                        <AvatarImage src={searchResult.avatar || ''} />
                        <AvatarFallback className="bg-gray-400 text-white">
                          {searchResult.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleUserClick(searchResult)}
                      >
                        <div className="font-medium text-sm text-black">
                          {searchResult.name}
                        </div>
                        {searchResult.user_id && (
                          <div className="text-xs text-gray-500">
                            @{searchResult.user_id}
                          </div>
                        )}
                      </div>
                      {currentUserId && (
                        <Button
                          onClick={() => handleFollowToggle(searchResult)}
                          disabled={followLoading[searchResult.id]}
                          variant={followingStatus[searchResult.id] ? 'outline' : 'default'}
                          className="px-4 py-2 text-sm"
                        >
                          {followLoading[searchResult.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : followingStatus[searchResult.id] ? (
                            'フォロー中'
                          ) : (
                            'フォロー'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* No Result Message */}
                {!searchResult && !searching && !searchError && searchQuery && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mb-2 text-gray-300" />
                    <p className="text-sm">ユーザーIDで検索してください</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
