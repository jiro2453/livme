import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { SocialIcons } from './SocialIcons';
import { LiveCard } from './LiveCard';
import { LiveAttendeesModal } from './LiveAttendeesModal';
import { X } from 'lucide-react';
import { getUserByUserId, getAttendedLivesByUserId, getUsersAttendingSameLive } from '../lib/api';
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
  currentUserId?: string;
  onShareUser?: () => void;
}

export const UserLivesModal: React.FC<UserLivesModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentUserId,
  onShareUser,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [selectedLive, setSelectedLive] = useState<Live | null>(null);
  const [attendeeUserIds, setAttendeeUserIds] = useState<string[]>([]);

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

  const handleLiveClick = async (live: Live) => {
    setSelectedLive(live);
    setIsAttendeesModalOpen(true);

    // Fetch attendees for this live event
    try {
      const attendees = await getUsersAttendingSameLive(live);
      setAttendeeUserIds(attendees);
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  };

  const groupedLives = groupLivesByMonth(lives);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header with close button */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-end">
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
                  onShare={userId === currentUserId ? onShareUser : undefined}
                />
              </div>

              {/* Attended Lives Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 text-center">
                  参加公演
                </h3>

                {lives.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    まだライブに参加していません
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full" defaultValue={Object.keys(groupedLives)}>
                    {Object.entries(groupedLives).map(([month, monthLives]) => (
                      <AccordionItem key={month} value={month}>
                        <AccordionTrigger>{month}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {monthLives.map((live) => (
                              <LiveCard
                                key={live.id}
                                live={live}
                                onClick={handleLiveClick}
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

    {selectedLive && (
      <LiveAttendeesModal
        isOpen={isAttendeesModalOpen}
        onClose={() => {
          setIsAttendeesModalOpen(false);
          setSelectedLive(null);
        }}
        live={selectedLive}
        attendeeUserIds={attendeeUserIds}
        currentUserId={currentUserId}
        onViewProfile={undefined}
      />
    )}
  </>
  );
};
