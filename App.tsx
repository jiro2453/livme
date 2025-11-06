import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { AuthScreen } from './components/auth/AuthScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { AddLiveModal } from './components/AddLiveModal';
import { LiveCard } from './components/LiveCard';
import { EmptyState } from './components/EmptyState';
import { SocialIcons } from './components/SocialIcons';
import { ShareModal } from './components/ShareModal';
import { LiveAttendeesModal } from './components/LiveAttendeesModal';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './components/ui/accordion';
import { Plus, User as UserIcon, LogOut, Calendar, Search } from 'lucide-react';
import { getLivesByUserId, deleteLive, getUserByUserId, getUsersAttendingSameLive, getAttendedLivesByUserId } from './lib/api';
import { groupLivesByMonth } from './utils/liveGrouping';
import { useToast } from './hooks/useToast';
import { useProfileRouting } from './hooks/useProfileRouting';
import type { Live, User } from './types';

const AppContent: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { urlUserId, navigateToProfile, navigateToHome } = useProfileRouting();

  // Data
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  // Profile screens
  const [showProfile, setShowProfile] = useState(false); // Own profile modal
  const [showUserProfile, setShowUserProfile] = useState(false); // Other user's full-screen profile
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Other user being viewed

  // ProfileRing modals (LiveAttendeesModal)
  const [selectedLive, setSelectedLive] = useState<Live | null>(null); // From home (z-index: 90)
  const [profileModalSelectedLive, setProfileModalSelectedLive] = useState<Live | null>(null); // From profile (z-index: 110)
  const [attendeeUserIds, setAttendeeUserIds] = useState<string[]>([]);
  const [profileModalAttendeeUserIds, setProfileModalAttendeeUserIds] = useState<string[]>([]);

  // Other modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddLiveModalOpen, setIsAddLiveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingLive, setEditingLive] = useState<Live | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadLives();
      loadProfileUser();
    }
  }, [user]);

  // Handle URL-based profile routing
  useEffect(() => {
    if (!user || authLoading || loading) return;

    if (urlUserId) {
      // URL contains a user_id -> show that user's profile
      if (urlUserId === user.user_id) {
        // URL is own user_id -> show own profile modal
        setShowProfile(true);
        setShowUserProfile(false);
        setSelectedUser(null);
      } else {
        // URL is another user_id -> show full-screen profile
        handleViewUserProfile(urlUserId);
      }
    } else {
      // URL is home (/) -> close any open profiles
      if (showUserProfile) {
        setShowUserProfile(false);
        setSelectedUser(null);
      }
    }
  }, [urlUserId, user, authLoading, loading]);

  const loadLives = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('=== Loading lives for user ===');
      console.log('User ID (UUID):', user.id);
      console.log('User ID (string):', user.user_id);

      // Get both created lives and attended lives
      const [createdLives, attendedLives] = await Promise.all([
        getLivesByUserId(user.id),
        getAttendedLivesByUserId(user.user_id),
      ]);

      console.log('Created lives:', createdLives.length);
      console.log('Attended lives:', attendedLives.length);

      // Merge and remove duplicates based on ID
      const allLives = [...createdLives, ...attendedLives];
      const uniqueLives = allLives.reduce((acc, live) => {
        if (!acc.some(l => l.id === live.id)) {
          acc.push(live);
        }
        return acc;
      }, [] as Live[]);

      console.log('Total unique lives:', uniqueLives.length);

      // Sort by date (newest first)
      uniqueLives.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setLives(uniqueLives);
    } catch (error) {
      console.error('Error loading lives:', error);
      toast({
        title: 'エラー',
        description: 'ライブ情報の読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfileUser = async () => {
    if (!user) return;

    try {
      const userData = await getUserByUserId(user.user_id);
      setProfileUser(userData);
    } catch (error) {
      console.error('Error loading profile user:', error);
    }
  };

  const handleDeleteLive = async (liveId: string) => {
    if (!confirm('本当に削除しますか?')) return;

    try {
      const success = await deleteLive(liveId);
      if (success) {
        toast({
          title: '削除しました',
          description: 'ライブ情報を削除しました',
          variant: 'success',
        });
        loadLives();
      } else {
        throw new Error('削除に失敗しました');
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ライブ情報の削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleEditLive = (live: Live) => {
    setEditingLive(live);
    setIsAddLiveModalOpen(true);
  };

  const handleCloseAddLiveModal = () => {
    setIsAddLiveModalOpen(false);
    setEditingLive(null);
  };

  const handleOpenProfile = () => {
    // Open own profile modal (no URL change)
    setShowProfile(true);
  };

  const handleViewUserProfile = async (userId: string) => {
    // View another user's profile (full-screen with URL change)
    try {
      const userData = await getUserByUserId(userId);
      setSelectedUser(userData);
      setShowUserProfile(true);
      navigateToProfile(userId);
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'エラー',
        description: 'ユーザー情報の読み込みに失敗しました',
        variant: 'destructive',
      });
      navigateToHome();
    }
  };

  const handleCloseUserProfile = () => {
    // Close other user's profile and return to home
    setShowUserProfile(false);
    setSelectedUser(null);
    setProfileModalSelectedLive(null);
    setProfileModalAttendeeUserIds([]);
    navigateToHome();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'ログアウトしました',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ログアウトに失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleLiveClick = async (live: Live) => {
    // Handle live click from home screen -> ProfileRing z-90
    setSelectedLive(live);

    // Fetch attendees for this live event
    try {
      const attendees = await getUsersAttendingSameLive(live);

      // 自分自身を先頭に配置
      if (user) {
        const sortedAttendees = [
          user.user_id,
          ...attendees.filter(id => id !== user.user_id)
        ];
        setAttendeeUserIds(sortedAttendees);
      } else {
        setAttendeeUserIds(attendees);
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
      toast({
        title: 'エラー',
        description: '参加者情報の読み込みに失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleProfileLiveClick = async (live: Live) => {
    // Handle live click from profile screen -> ProfileRing z-110
    setProfileModalSelectedLive(live);

    // Fetch attendees for this live event
    try {
      const attendees = await getUsersAttendingSameLive(live);

      // 自分自身を先頭に配置
      if (user) {
        const sortedAttendees = [
          user.user_id,
          ...attendees.filter(id => id !== user.user_id)
        ];
        setProfileModalAttendeeUserIds(sortedAttendees);
      } else {
        setProfileModalAttendeeUserIds(attendees);
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
      toast({
        title: 'エラー',
        description: '参加者情報の読み込みに失敗しました',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Filter lives based on search query
  const filteredLives = lives.filter(live => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const artist = live.artist?.toLowerCase() || '';
    const venue = live.venue?.toLowerCase() || '';

    return artist.includes(query) || venue.includes(query);
  });

  const groupedLives = groupLivesByMonth(filteredLives);

  // 他ユーザーのプロフィール画面表示時
  if (showUserProfile && selectedUser) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* ProfileModal as full page (not modal) */}
        <ProfileModal
          isOpen={true}
          onClose={handleCloseUserProfile}
          userId={selectedUser.user_id}
          currentUserId={user?.id}
          isOwnProfile={false}
          onSuccess={() => {}}
          onLiveClick={handleProfileLiveClick}
        />

        {/* ProfileRing from profile (z-110) */}
        {profileModalSelectedLive && (
          <LiveAttendeesModal
            isOpen={!!profileModalSelectedLive}
            onClose={() => {
              setProfileModalSelectedLive(null);
              setProfileModalAttendeeUserIds([]);
            }}
            live={profileModalSelectedLive}
            attendeeUserIds={profileModalAttendeeUserIds}
            currentUserId={user?.user_id}
            onViewProfile={handleViewUserProfile}
            zIndex={110}
          />
        )}

        <Toaster />
      </div>
    );
  }

  // ホーム画面
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-primary">
        <div className="max-w-[546px] mx-auto px-4 py-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-[88px]">
              {/* 左側のスペーサー（右側のボタン2つ分の幅） */}
            </div>
            <img src="/LiVME_2.png" alt="LiVME" className="h-12 w-auto" />
            <div className="flex items-center gap-2 w-[88px] justify-end">
              <button
                onClick={handleOpenProfile}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="プロフィール"
              >
                <UserIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="ログアウト"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[546px] mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-28 w-28 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleOpenProfile}>
              <AvatarImage src={profileUser?.avatar || ''} />
              <AvatarFallback className="bg-gray-400 text-white text-3xl">
                {profileUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-2">
              <h2 className="text-[15.75px] font-semibold">{profileUser?.name}</h2>
              <p className="text-[12.25px] text-gray-500">@ {profileUser?.user_id}</p>
              {profileUser?.bio && (
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                  {profileUser.bio}
                </p>
              )}
            </div>
            <SocialIcons
              socialLinks={profileUser?.socialLinks}
              onShare={() => setIsShareModalOpen(true)}
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="アーティスト名・会場名で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[42px] pl-12 pr-4 border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 参加公演 Section */}
          <div className="relative flex items-center justify-center">
            <h2 className="text-[15.75px] font-semibold">参加公演</h2>
            <button
              onClick={() => setIsAddLiveModalOpen(true)}
              className="absolute right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90"
              aria-label="ライブ追加"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Lives List */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : lives.length === 0 ? (
            <EmptyState
              message="ライブ情報がありません。追加してみましょう！"
              icon={<Calendar className="h-12 w-12 mb-4 text-gray-400" />}
            />
          ) : filteredLives.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mb-4 text-gray-400 mx-auto" />
              <p>「{searchQuery}」に一致する公演が見つかりませんでした</p>
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
                          isOwner={live.created_by === user.id}
                          onEdit={handleEditLive}
                          onDelete={handleDeleteLive}
                          onClick={handleLiveClick}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </main>

      {/* Modals */}
      {/* Own profile modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        userId={user?.user_id}
        currentUserId={user?.id}
        isOwnProfile={true}
        onSuccess={loadProfileUser}
        onLiveClick={handleProfileLiveClick}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenProfile={handleOpenProfile}
      />

      <AddLiveModal
        isOpen={isAddLiveModalOpen}
        onClose={handleCloseAddLiveModal}
        userId={user.id}
        onSuccess={loadLives}
        editingLive={editingLive}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        userId={user.user_id}
      />

      {/* ProfileRing from home (z-90) */}
      {selectedLive && (
        <LiveAttendeesModal
          isOpen={!!selectedLive}
          onClose={() => {
            setSelectedLive(null);
            setAttendeeUserIds([]);
          }}
          live={selectedLive}
          attendeeUserIds={attendeeUserIds}
          currentUserId={user?.user_id}
          onViewProfile={handleViewUserProfile}
          zIndex={90}
        />
      )}

      <Toaster />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
