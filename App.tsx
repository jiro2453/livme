import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { AuthScreen } from './components/auth/AuthScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProfileModal } from './components/ProfileModal';
import { FollowListModal } from './components/FollowListModal';
import { SettingsModal } from './components/SettingsModal';
import { AddLiveModal } from './components/AddLiveModal';
import { EditLiveModal } from './components/EditLiveModal';
import { LiveCard } from './components/LiveCard';
import { EmptyState } from './components/EmptyState';
import { SocialIcons } from './components/SocialIcons';
import { ShareModal } from './components/ShareModal';
import { LiveAttendeesModal } from './components/LiveAttendeesModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CookieConsent } from './components/CookieConsent';
import { Footer } from './components/Footer';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './components/ui/accordion';
import { Plus, User as UserIcon, LogOut, Calendar, Search } from 'lucide-react';
import { deleteLive, getUserByUserId, getUsersAttendingSameLive, getAttendedLivesByUserId, getFollowerCount, getFollowingCount } from './lib/api';
import { groupLivesByMonth } from './utils/liveGrouping';
import { useToast } from './hooks/useToast';
import { useProfileRouting } from './hooks/useProfileRouting';
import type { Live, User } from './types';
import { StatusBar, Style } from '@capacitor/status-bar';

const AppContent: React.FC = () => {
  const { user, loading: authLoading, signOut, refreshUserProfile } = useAuth();
  const { urlUserId, navigateToProfile, navigateToHome } = useProfileRouting();

  // Data
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [liveToDelete, setLiveToDelete] = useState<string | null>(null);
  const [isEditLiveModalOpen, setIsEditLiveModalOpen] = useState(false);
  const [liveToEdit, setLiveToEdit] = useState<Live | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Legal pages
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  // Follow stats
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowListModal, setShowFollowListModal] = useState(false);
  const [followListInitialTab, setFollowListInitialTab] = useState<'followers' | 'following'>('followers');

  // Attendees cache to avoid redundant API calls
  const attendeesCache = useRef<Map<string, string[]>>(new Map());

  const { toast } = useToast();

  // Initialize Status Bar for iOS
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        // Allow status bar to overlay the web content
        await StatusBar.setOverlaysWebView({ overlay: true });
        // Set status bar style to dark content (black text on white background)
        await StatusBar.setStyle({ style: Style.Dark });
        // Set background color to match header
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
      } catch (error) {
        // Status Bar API is only available on native platforms
        console.log('Status Bar not available (web platform)');
      }
    };

    initStatusBar();
  }, []);

  useEffect(() => {
    if (user) {
      loadLives();
    }
  }, [user]);

  // Handle URL-based profile routing
  useEffect(() => {
    if (!user || authLoading || loading) return;

    // Reset scroll position on page navigation
    window.scrollTo(0, 0);

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
    // Clear attendees cache when reloading lives
    attendeesCache.current.clear();

    try {
      console.log('=== Loading lives for user ===');
      console.log('User ID (UUID):', user.id);
      console.log('User ID (string):', user.user_id);

      // Get only attended lives from LiveAttendees table
      const attendedLives = await getAttendedLivesByUserId(user.id);

      console.log('Attended lives:', attendedLives.length);

      // Sort by date (newest first)
      attendedLives.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setLives(attendedLives);

      // Load follower/following counts
      const [followers, following] = await Promise.all([
        getFollowerCount(user.id),
        getFollowingCount(user.id),
      ]);
      setFollowerCount(followers);
      setFollowingCount(following);
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

  const handleDeleteLive = (liveId: string) => {
    setLiveToDelete(liveId);
    setIsDeleteConfirmOpen(true);
  };

  const handleEditLive = (live: Live) => {
    setLiveToEdit(live);
    setIsEditLiveModalOpen(true);
  };

  const confirmDeleteLive = async () => {
    if (!user || !liveToDelete) return;

    try {
      const success = await deleteLive(liveToDelete, user.id);
      if (success) {
        toast({
          title: '削除しました',
          description: 'ライブ情報を削除しました',
          variant: 'success',
        });
        // Close LiveAttendees modal if the deleted live is currently selected
        if (selectedLive?.id === liveToDelete) {
          setSelectedLive(null);
          setAttendeeUserIds([]);
        }
        if (profileModalSelectedLive?.id === liveToDelete) {
          setProfileModalSelectedLive(null);
          setProfileModalAttendeeUserIds([]);
        }
        // Remove the deleted live from the local state immediately
        setLives(prevLives => prevLives.filter(live => live.id !== liveToDelete));
      } else {
        throw new Error('削除に失敗しました');
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ライブ情報の削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLiveToDelete(null);
    }
  };

  const handleCloseAddLiveModal = () => {
    setIsAddLiveModalOpen(false);
  };

  const handleOpenProfile = () => {
    // Open own profile modal (no URL change)
    setShowProfile(true);
  };

  const handleViewUserProfile = async (userId: string) => {
    // View another user's profile (full-screen with URL change)
    console.log('🔍 handleViewUserProfile called with userId:', userId);
    try {
      const userData = await getUserByUserId(userId);
      console.log('👤 getUserByUserId result:', userData);

      if (!userData) {
        console.error('❌ User not found:', userId);
        toast({
          title: 'エラー',
          description: 'ユーザーが見つかりませんでした',
          variant: 'destructive',
        });
        return;
      }

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

    // Fetch attendees for this live event (with caching)
    try {
      let attendees: string[];

      // Check cache first
      const cached = attendeesCache.current.get(live.id);
      if (cached) {
        console.log('handleLiveClick: Using cached attendees for live:', live.id);
        attendees = cached;
      } else {
        console.log('handleLiveClick: Fetching attendees for live:', live.id);
        attendees = await getUsersAttendingSameLive(live);
        // Store in cache
        attendeesCache.current.set(live.id, attendees);
      }

      console.log('handleLiveClick: Retrieved attendees:', attendees);
      console.log('handleLiveClick: Current user.id (UUID):', user?.id);
      console.log('handleLiveClick: Current user.user_id (string):', user?.user_id);

      // 自分自身が参加者リストに含まれている場合、必ず先頭に配置（UUIDを使用）
      if (user) {
        const isUserAttending = attendees.some(id => id === user.id);
        console.log('handleLiveClick: Is user attending?', isUserAttending);

        if (isUserAttending) {
          // 自分を先頭に、それ以外を元の順序で配置
          const otherAttendees = attendees.filter(id => id !== user.id);
          const sortedAttendees = [user.id, ...otherAttendees];
          console.log('handleLiveClick: Sorted attendees (user at front):', sortedAttendees);
          setAttendeeUserIds(sortedAttendees);
        } else {
          console.log('handleLiveClick: User not attending, using original list:', attendees);
          setAttendeeUserIds(attendees);
        }
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

    // Fetch attendees for this live event (with caching)
    try {
      let attendees: string[];

      // Check cache first
      const cached = attendeesCache.current.get(live.id);
      if (cached) {
        console.log('handleProfileLiveClick: Using cached attendees for live:', live.id);
        attendees = cached;
      } else {
        console.log('handleProfileLiveClick: Fetching attendees for live:', live.id);
        attendees = await getUsersAttendingSameLive(live);
        // Store in cache
        attendeesCache.current.set(live.id, attendees);
      }

      console.log('handleProfileLiveClick: Retrieved attendees:', attendees);
      console.log('handleProfileLiveClick: Current user.id (UUID):', user?.id);

      // 自分自身が参加者リストに含まれている場合、必ず先頭に配置（UUIDを使用）
      if (user) {
        const isUserAttending = attendees.some(id => id === user.id);
        console.log('handleProfileLiveClick: Is user attending?', isUserAttending);

        if (isUserAttending) {
          // 自分を先頭に、それ以外を元の順序で配置
          const otherAttendees = attendees.filter(id => id !== user.id);
          const sortedAttendees = [user.id, ...otherAttendees];
          console.log('handleProfileLiveClick: Sorted attendees (user at front):', sortedAttendees);
          setProfileModalAttendeeUserIds(sortedAttendees);
        } else {
          console.log('handleProfileLiveClick: User not attending, using original list:', attendees);
          setProfileModalAttendeeUserIds(attendees);
        }
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
          onViewProfile={handleViewUserProfile}
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

        {/* Advertisement */}
        <div
          className="hidden md:flex justify-center py-8"
          dangerouslySetInnerHTML={{
            __html: `
              <!-- admax -->
              <div class="admax-ads" data-admax-id="876840f38c1c0ad3c567c5c59bc376d0" style="display:inline-block;width:468px;height:60px;"></div>
              <script type="text/javascript">(admaxads = window.admaxads || []).push({admax_id: "876840f38c1c0ad3c567c5c59bc376d0",type: "banner"});</script>
              <script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async></script>
              <!-- admax -->
            `
          }}
        />

        {/* Footer */}
        <Footer
          onOpenPrivacy={() => setShowPrivacyPolicy(true)}
          onOpenTerms={() => setShowTermsOfService(true)}
        />

        {/* Privacy Policy */}
        {showPrivacyPolicy && (
          <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
        )}

        {/* Terms of Service */}
        {showTermsOfService && (
          <TermsOfService onClose={() => setShowTermsOfService(false)} />
        )}

        {/* Cookie Consent Banner */}
        <CookieConsent
          onAccept={() => {}}
          onOpenPrivacy={() => setShowPrivacyPolicy(true)}
        />

        <Toaster />
      </div>
    );
  }

  // ホーム画面
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-primary ios-safe-top">
        <div className="max-w-[546px] mx-auto px-4 py-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-[88px]">
              {/* 左側のスペーサー（右側のボタン2つ分の幅） */}
            </div>
            <picture>
              <source srcSet="/LiVME_2.webp" type="image/webp" />
              <img src="/LiVME_2.png" alt="LiVME" className="h-12 w-auto" loading="eager" decoding="async" />
            </picture>
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
              <AvatarImage src={user?.avatar || ''} />
              <AvatarFallback className="bg-gray-400 text-white text-3xl">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-2">
              <h2 className="text-[15.75px] font-semibold">{user?.name}</h2>
              <p className="text-[12.25px] text-gray-500">@ {user?.user_id}</p>
            </div>
            {user?.bio && (
              <p className="text-sm text-gray-600 max-w-xs mx-auto whitespace-pre-wrap break-words text-center">
                {user.bio}
              </p>
            )}
            {user?.link && (
              <a
                href={user.link.startsWith('http') ? user.link : `https://${user.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 underline break-all text-center"
              >
                {user.link}
              </a>
            )}

            {/* Follower/Following Stats */}
            <div className="flex justify-center gap-6 text-sm">
              <button
                onClick={() => {
                  setFollowListInitialTab('following');
                  setShowFollowListModal(true);
                }}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <div className="font-semibold text-black">{followingCount}</div>
                <div className="text-gray-500">フォロー中</div>
              </button>
              <button
                onClick={() => {
                  setFollowListInitialTab('followers');
                  setShowFollowListModal(true);
                }}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <div className="font-semibold text-black">{followerCount}</div>
                <div className="text-gray-500">フォロワー</div>
              </button>
            </div>

            <SocialIcons
              socialLinks={user?.socialLinks}
              onShare={() => setIsShareModalOpen(true)}
            />
          </div>

          {/* 参加公演 Section */}
          <div>
            <div className="relative flex items-center justify-center mb-4">
              <h2 className="text-[15.75px] font-semibold">参加公演</h2>
              <div className="absolute right-0 flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (!isSearchOpen) {
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    } else {
                      setSearchQuery('');
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-primary transition-colors"
                  aria-label="検索"
                >
                  <Search className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsAddLiveModalOpen(true)}
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary/90"
                  aria-label="ライブ追加"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isSearchOpen ? 'max-h-[50px] opacity-100 mb-4' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="アーティスト名・会場名で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[38px] pl-11 pr-4 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 bg-gray-50/50 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Lives List */}
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : lives.length === 0 ? (
              <EmptyState
                message={
                  <>
                    ライブ情報がありません。
                    <br />
                    追加してみましょう！
                  </>
                }
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
                            onDelete={handleDeleteLive}
                            onEdit={handleEditLive}
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
        onSuccess={async () => {
          // Refresh user profile to reflect changes immediately
          await refreshUserProfile();
        }}
        onLiveClick={handleProfileLiveClick}
        attendedLives={lives}
        onViewProfile={handleViewUserProfile}
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
      />

      {liveToEdit && (
        <EditLiveModal
          isOpen={isEditLiveModalOpen}
          onClose={() => {
            setIsEditLiveModalOpen(false);
            setLiveToEdit(null);
          }}
          userId={user.id}
          live={liveToEdit}
          onSuccess={loadLives}
        />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        userId={user.user_id}
      />

      {/* Follow List Modal */}
      <FollowListModal
        isOpen={showFollowListModal}
        onClose={() => setShowFollowListModal(false)}
        userId={user.id}
        currentUserId={user.id}
        initialTab={followListInitialTab}
        onUserClick={handleViewUserProfile}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setLiveToDelete(null);
        }}
        onConfirm={confirmDeleteLive}
        title="ライブを削除しますか？"
        description={"このライブへの参加を削除します。\nこの操作は取り消せません。"}
        confirmText="削除"
        cancelText="キャンセル"
        variant="danger"
      />

      {/* Advertisement */}
      <div
        className="hidden md:flex justify-center py-8"
        dangerouslySetInnerHTML={{
          __html: `
            <!-- admax -->
            <div class="admax-ads" data-admax-id="876840f38c1c0ad3c567c5c59bc376d0" style="display:inline-block;width:468px;height:60px;"></div>
            <script type="text/javascript">(admaxads = window.admaxads || []).push({admax_id: "876840f38c1c0ad3c567c5c59bc376d0",type: "banner"});</script>
            <script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async></script>
            <!-- admax -->
          `
        }}
      />

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setShowPrivacyPolicy(true)}
        onOpenTerms={() => setShowTermsOfService(true)}
      />

      {/* Privacy Policy */}
      {showPrivacyPolicy && (
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
      )}

      {/* Terms of Service */}
      {showTermsOfService && (
        <TermsOfService onClose={() => setShowTermsOfService(false)} />
      )}

      {/* Cookie Consent Banner */}
      <CookieConsent
        onAccept={() => {}}
        onOpenPrivacy={() => setShowPrivacyPolicy(true)}
      />

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
