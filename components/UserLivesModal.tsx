import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { SocialIcons } from './SocialIcons';
import { LiveCard } from './LiveCard';
import { MapPin, X } from 'lucide-react';
import { getUserByUserId, getAttendedLivesByUserId } from '../lib/api';
import { groupLivesByMonth } from '../utils/liveGrouping';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import type { User, Live } from '../types';

interface UserLivesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onShareUser?: () => void;
}

export const UserLivesModal: React.FC<UserLivesModalProps> = ({
  isOpen,
  onClose,
  userId,
  onShareUser,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      console.log('=== UserLivesModal: Loading user data ===');
      console.log('User ID:', userId);

      const [userData, livesData] = await Promise.all([
        getUserByUserId(userId),
        getAttendedLivesByUserId(userId),
      ]);

      console.log('User data:', userData);
      console.log('Lives data:', livesData);
      console.log('Lives count:', livesData?.length || 0);

      setUser(userData);
      setLives(livesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedLives = groupLivesByMonth(lives);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">プロフィール</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-4 py-6">
              {/* Profile Section */}
              <div className="flex flex-col items-center space-y-4 mb-8">
                <Avatar className="h-28 w-28">
                  <AvatarImage src={user.avatar || ''} />
                  <AvatarFallback className="bg-gray-400 text-white text-3xl">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h2 className="text-[15.75px] font-semibold">{user.name}</h2>
                  <p className="text-[12.25px] text-gray-500">@ {user.user_id}</p>
                  {user.bio && (
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      {user.bio}
                    </p>
                  )}
                </div>
                <SocialIcons
                  socialLinks={user.social_links}
                  onShare={onShareUser}
                />
              </div>

              {/* Attended Lives Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  参加したライブ
                </h3>

                {lives.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    まだライブに参加していません
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-2" defaultValue={Object.keys(groupedLives)}>
                    {Object.entries(groupedLives).map(([month, monthLives]) => (
                      <AccordionItem
                        key={month}
                        value={month}
                        className="border-2 border-primary rounded-xl overflow-hidden bg-white"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                          <div className="flex items-center justify-between w-full pr-2">
                            <span className="text-base font-medium text-gray-800">
                              {month}
                            </span>
                            <span className="text-sm text-gray-500">
                              {monthLives.length}件
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3 pt-2">
                            {monthLives.map((live) => (
                              <LiveCard
                                key={live.id}
                                live={live}
                                onClick={() => {}}
                                isOwner={false}
                              />
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 text-gray-500">
            ユーザー情報を取得できませんでした
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
