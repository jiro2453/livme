import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  AlertCircle,
  Loader2,
  Camera,
  Upload,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useToast } from '../hooks/useToast';
import { getUserByUserId, updateUserProfile, checkUserIdAvailability, getAttendedLivesByUserId, followUser, unfollowUser, isFollowing, getFollowerCount, getFollowingCount } from '../lib/api';
import { Icons } from './assets/Icons';
import { LiveCard } from './LiveCard';
import { SocialIcons } from './SocialIcons';
import { ImageCropModal } from './ImageCropModal';
import { FollowListModal } from './FollowListModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { groupLivesByMonth } from '../utils/liveGrouping';
import type { User, Live } from '../types';

// Validation Rules
const VALIDATION_RULES = {
  MAX_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 200,
  MAX_GALLERY_IMAGES: 3,
  MIN_USER_ID_LENGTH: 3,
  MAX_USER_ID_LENGTH: 30,
  USER_ID_REGEX: /^[a-zA-Z0-9_]+$/,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// User ID Status Type
type UserIdStatus = 'available' | 'taken' | 'checking' | 'invalid' | 'idle';

// Form Data Interface
interface FormData {
  name: string;
  user_id: string;
  bio: string;
  link: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  avatar: string;
  galleryImages: string[];
}

// Errors Interface
interface FormErrors {
  name?: string;
  user_id?: string;
  bio?: string;
  link?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  currentUserId?: string;
  isOwnProfile: boolean;
  onSuccess?: () => void;
  onLiveClick?: (live: Live) => void;
  attendedLives?: Live[]; // Pass pre-fetched lives to avoid redundant API calls
  onViewProfile?: (userId: string) => void; // Navigate to another user's profile
}

// Preset avatar URLs - 9 images (3 animals, 3 landscapes, 3 abstract)
// Optimized with smaller size (200x200) and quality parameter
const presetAvatars = [
  // Cute Animals (3)
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&q=80', // Cat
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop&q=80', // Dog
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&q=80', // Rabbit
  // Landscapes (3)
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&q=80', // Mountain
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop&q=80', // Beach
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop&q=80', // Forest
  // Abstract (3)
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=200&fit=crop&q=80', // Abstract colors
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=200&fit=crop&q=80', // Abstract pattern
  'https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=200&h=200&fit=crop&q=80', // Abstract art
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentUserId,
  isOwnProfile,
  onSuccess,
  onLiveClick,
  attendedLives: preFetchedLives,
  onViewProfile,
}) => {
  const [displayUser, setDisplayUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [attendedLives, setAttendedLives] = useState<Live[]>([]);

  // Follow-related state
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Follow list modal state
  const [showFollowListModal, setShowFollowListModal] = useState(false);
  const [followListInitialTab, setFollowListInitialTab] = useState<'followers' | 'following'>('followers');

  // Image crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>('');
  const [cropMode, setCropMode] = useState<'avatar' | 'gallery' | 'gallery-edit'>('avatar');
  const [editingGalleryIndex, setEditingGalleryIndex] = useState<number>(-1);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    user_id: '',
    bio: '',
    link: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    avatar: '',
    galleryImages: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [userIdStatus, setUserIdStatus] = useState<UserIdStatus>('idle');
  const [isCheckingUserId, setIsCheckingUserId] = useState(false);

  const { toast } = useToast();
  const userIdCheckTimeout = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const originalUserId = useRef<string>('');

  // Load profile data
  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    }
  }, [isOpen, userId]);

  const loadProfile = async () => {
    if (!userId) return;

    console.log('=== loadProfile called ===');
    console.log('userId:', userId);
    console.log('isOwnProfile:', isOwnProfile);
    console.log('Has preFetchedLives:', !!preFetchedLives);

    setLoading(true);
    try {
      // Always fetch full profile data when opening ProfileModal
      // (bio, link, social_links, images are not loaded during initial app startup for performance)
      console.log('Fetching full profile data from API');
      const userData = await getUserByUserId(userId);
      console.log('userData from API:', userData);
      console.log('userData.bio:', userData?.bio);

      if (userData) {
        setDisplayUser(userData);
        originalUserId.current = userData.user_id;
        setFormData({
          name: userData.name || '',
          user_id: userData.user_id || '',
          bio: userData.bio || '',
          link: userData.link || '',
          instagram: userData.socialLinks?.instagram || '',
          twitter: userData.socialLinks?.twitter || '',
          tiktok: userData.socialLinks?.tiktok || '',
          avatar: userData.avatar || '',
          galleryImages: userData.galleryImages || [],
        });
        setSelectedAvatar(userData.avatar || '');
        console.log('formData set with bio:', userData.bio || '');

        // Use pre-fetched lives if available, otherwise fetch from API
        if (preFetchedLives) {
          console.log('Using pre-fetched lives data (no API call):', preFetchedLives.length);
          setAttendedLives(preFetchedLives);
        } else {
          console.log('Fetching lives data from API');
          const lives = await getAttendedLivesByUserId(userData.id);
          setAttendedLives(lives);
          console.log('Loaded attended lives:', lives.length);
        }

        // Load follower/following counts for both own profile and other profiles
        const [followers, following_count] = await Promise.all([
          getFollowerCount(userData.id),
          getFollowingCount(userData.id),
        ]);
        setFollowerCount(followers);
        setFollowingCount(following_count);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'エラー',
        description: 'プロフィールの読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load follow status and counts for other user profiles
  const loadFollowData = async () => {
    if (!displayUser?.id || !currentUserId || isOwnProfile) return;

    try {
      // Load follow status - use displayUser.id (UUID) instead of userId (string)
      const following = await isFollowing(currentUserId, displayUser.id);
      setIsFollowingUser(following);

      // Load follower and following counts
      const [followers, following_count] = await Promise.all([
        getFollowerCount(displayUser.id),
        getFollowingCount(displayUser.id),
      ]);
      setFollowerCount(followers);
      setFollowingCount(following_count);
    } catch (error) {
      console.error('Error loading follow data:', error);
    }
  };

  // Load follow data when viewing other user's profile
  useEffect(() => {
    if (isOpen && !isOwnProfile && displayUser?.id && currentUserId && !loading) {
      loadFollowData();
    }
  }, [isOpen, isOwnProfile, displayUser?.id, currentUserId, loading]);

  // Handle follow/unfollow action
  const handleFollowToggle = async () => {
    if (!currentUserId || !displayUser?.id || isFollowLoading) return;

    setIsFollowLoading(true);
    try {
      if (isFollowingUser) {
        // Unfollow - use displayUser.id (UUID) instead of userId (string)
        const success = await unfollowUser(currentUserId, displayUser.id);
        if (success) {
          setIsFollowingUser(false);
          setFollowerCount((prev) => Math.max(0, prev - 1));
          toast({
            title: 'フォロー解除しました',
            description: `${displayUser?.name}のフォローを解除しました`,
          });
        } else {
          toast({
            title: 'エラー',
            description: 'フォロー解除に失敗しました',
            variant: 'destructive',
          });
        }
      } else {
        // Follow - use displayUser.id (UUID) instead of userId (string)
        const success = await followUser(currentUserId, displayUser.id);
        if (success) {
          setIsFollowingUser(true);
          setFollowerCount((prev) => prev + 1);
          toast({
            title: 'フォローしました',
            description: `${displayUser?.name}をフォローしました`,
          });
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
      setIsFollowLoading(false);
    }
  };

  // User ID Status Helpers
  const getUserIdStatusColor = (status: UserIdStatus): string => {
    switch (status) {
      case 'available':
        return 'text-green-500';
      case 'taken':
        return 'text-red-500';
      case 'checking':
        return 'text-blue-500';
      case 'invalid':
        return 'text-orange-500';
      default:
        return 'text-gray-400';
    }
  };

  const getUserIdStatusIcon = (status: UserIdStatus): JSX.Element | null => {
    switch (status) {
      case 'available':
        return <Check className="w-3 h-3" />;
      case 'taken':
        return <X className="w-3 h-3" />;
      case 'invalid':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Validation
  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return '名前は必須です';
        if (value.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
          return `名前は${VALIDATION_RULES.MAX_NAME_LENGTH}文字以内で入力してください`;
        }
        break;

      case 'user_id':
        if (!value.trim()) return 'ユーザーIDは必須です';
        if (value.length < VALIDATION_RULES.MIN_USER_ID_LENGTH) {
          return `ユーザーIDは${VALIDATION_RULES.MIN_USER_ID_LENGTH}文字以上で入力してください`;
        }
        if (value.length > VALIDATION_RULES.MAX_USER_ID_LENGTH) {
          return `ユーザーIDは${VALIDATION_RULES.MAX_USER_ID_LENGTH}文字以内で入力してください`;
        }
        if (!VALIDATION_RULES.USER_ID_REGEX.test(value)) {
          return 'ユーザーIDは英数字とアンダースコアのみ使用できます';
        }
        break;

      case 'bio':
        if (value.length > VALIDATION_RULES.MAX_BIO_LENGTH) {
          return `自己紹介は${VALIDATION_RULES.MAX_BIO_LENGTH}文字以内で入力してください`;
        }
        break;

      case 'link':
        if (value && !value.match(/^https?:\/\/.+/)) {
          return '有効なURLを入力してください（https://...）';
        }
        break;
    }
    return undefined;
  };

  // Check User ID Availability (debounced)
  const checkUserId = useCallback(async (userId: string) => {
    if (userId === originalUserId.current) {
      setUserIdStatus('idle');
      return;
    }

    setIsCheckingUserId(true);
    setUserIdStatus('checking');

    try {
      const isAvailable = await checkUserIdAvailability(userId);
      setUserIdStatus(isAvailable ? 'available' : 'taken');
    } catch (error) {
      setUserIdStatus('invalid');
    } finally {
      setIsCheckingUserId(false);
    }
  }, []);

  // Handle Input Change
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate field
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));

    // Check user ID availability
    if (field === 'user_id') {
      if (userIdCheckTimeout.current) {
        clearTimeout(userIdCheckTimeout.current);
      }

      const validationError = validateField('user_id', value);
      if (!validationError && value !== originalUserId.current) {
        userIdCheckTimeout.current = setTimeout(() => {
          checkUserId(value);
        }, 500);
      } else {
        setUserIdStatus(validationError ? 'invalid' : 'idle');
      }
    }
  };

  // Handle Avatar Selection
  const handleSelectAvatar = (avatar: string) => {
    console.log('=== handleSelectAvatar called ===');
    console.log('Selected avatar:', avatar);
    setSelectedAvatar(avatar);
    setFormData(prev => ({ ...prev, avatar }));
    console.log('Updated selectedAvatar and formData.avatar');
    setShowAvatarSelector(false);
  };

  // Trigger File Upload
  const triggerFileUpload = () => {
    console.log('=== triggerFileUpload called ===');
    console.log('fileInputRef.current:', fileInputRef.current);
    fileInputRef.current?.click();
  };

  const triggerGalleryUpload = () => {
    galleryInputRef.current?.click();
  };

  // Handle Avatar File Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
      toast({
        title: 'エラー',
        description: 'ファイルサイズは5MB以下にしてください',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCropImageUrl(result);
      setCropMode('avatar');
      setShowAvatarSelector(false);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Handle Gallery Upload
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentCount = formData.galleryImages.length;
    const availableSlots = VALIDATION_RULES.MAX_GALLERY_IMAGES - currentCount;

    if (files.length > availableSlots) {
      toast({
        title: 'エラー',
        description: `ギャラリーは最大${VALIDATION_RULES.MAX_GALLERY_IMAGES}枚までです`,
        variant: 'destructive',
      });
      return;
    }

    // Process first file with crop modal
    const file = files[0];
    if (!file) return;

    if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
      toast({
        title: 'エラー',
        description: 'ファイルサイズは5MB以下にしてください',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCropImageUrl(result);
      setCropMode('gallery');
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  // Handle crop complete
  const handleCropComplete = (croppedImageBase64: string) => {
    if (cropMode === 'avatar') {
      setSelectedAvatar(croppedImageBase64);
      // formData.avatarも更新して、保存時に反映されるようにする
      setFormData(prev => ({ ...prev, avatar: croppedImageBase64 }));
    } else if (cropMode === 'gallery') {
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, croppedImageBase64],
      }));
    } else if (cropMode === 'gallery-edit' && editingGalleryIndex >= 0) {
      setFormData(prev => {
        const newImages = [...prev.galleryImages];
        newImages[editingGalleryIndex] = croppedImageBase64;
        return { ...prev, galleryImages: newImages };
      });
    }

    // クロップモーダルを閉じて、プロフィール編集画面に戻る
    setShowCropModal(false);
    setShowAvatarSelector(false);
  };

  // Edit Gallery Image
  const handleEditGalleryImage = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
        toast({
          title: 'エラー',
          description: 'ファイルサイズは5MB以下にしてください',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCropImageUrl(result);
        setCropMode('gallery-edit');
        setEditingGalleryIndex(index);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Save Profile
  const handleSave = async () => {
    console.log('=== handleSave called ===');
    console.log('currentUserId:', currentUserId);
    console.log('formData:', formData);
    console.log('userIdStatus:', userIdStatus);

    // Validate all fields
    const newErrors: FormErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof FormData, formData[key as keyof FormData] as string);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      toast({
        title: 'エラー',
        description: '入力内容を確認してください',
        variant: 'destructive',
      });
      return;
    }

    if (userIdStatus === 'taken') {
      console.log('User ID is taken');
      toast({
        title: 'エラー',
        description: 'このユーザーIDは既に使用されています',
        variant: 'destructive',
      });
      return;
    }

    console.log('Validation passed, attempting to save...');
    setIsSaving(true);
    try {
      if (currentUserId) {
        console.log('Calling updateUserProfile with:', {
          currentUserId,
          updates: {
            name: formData.name,
            user_id: formData.user_id,
            bio: formData.bio,
            link: formData.link,
            avatar: formData.avatar,
            galleryImages: formData.galleryImages,
            socialLinks: {
              instagram: formData.instagram,
              twitter: formData.twitter,
              tiktok: formData.tiktok,
            },
          }
        });

        const result = await updateUserProfile(currentUserId, {
          name: formData.name,
          user_id: formData.user_id,
          bio: formData.bio,
          link: formData.link,
          avatar: formData.avatar,
          galleryImages: formData.galleryImages,
          socialLinks: {
            instagram: formData.instagram,
            twitter: formData.twitter,
            tiktok: formData.tiktok,
          },
        });

        console.log('updateUserProfile result:', result);

        if (!result) {
          throw new Error('更新結果が空です');
        }

        toast({
          title: '保存しました',
          description: 'プロフィールを更新しました',
          variant: 'success',
        });

        setIsEditing(false);
        await loadProfile();

        // Notify parent component to refresh profile data
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('currentUserId is not defined!');
        toast({
          title: 'エラー',
          description: 'ユーザーIDが見つかりません',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('=== Error saving profile ===');
      console.error('Error object:', error);

      let errorMessage = 'プロフィールの保存に失敗しました';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel Editing
  const handleCancel = () => {
    if (displayUser) {
      setFormData({
        name: displayUser.name || '',
        user_id: displayUser.user_id || '',
        bio: displayUser.bio || '',
        link: displayUser.link || '',
        instagram: displayUser.socialLinks?.instagram || '',
        twitter: displayUser.socialLinks?.twitter || '',
        tiktok: displayUser.socialLinks?.tiktok || '',
        avatar: displayUser.avatar || '',
        galleryImages: displayUser.galleryImages || [],
      });
      setSelectedAvatar(displayUser.avatar || '');
    }
    setErrors({});
    setUserIdStatus('idle');
    setIsEditing(false);
  };

  // Handle modal close - reset edit mode
  const handleClose = () => {
    console.log('=== handleClose called ===');
    console.log('showAvatarSelector:', showAvatarSelector);

    // Don't close main modal if avatar selector is open
    if (showAvatarSelector) {
      console.log('Avatar selector is open, preventing main modal close');
      return;
    }

    console.log('Resetting isEditing to false');
    setIsEditing(false);
    setErrors({});
    setUserIdStatus('idle');
    onClose();
  };

  if (loading || !displayUser) {
    return (
      <Dialog open={isOpen && !showAvatarSelector} onOpenChange={handleClose}>
        <DialogContent>
          <VisuallyHidden>
            <DialogTitle>プロフィール読み込み中</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  console.log('=== ProfileModal render ===');
  console.log('isOpen:', isOpen);
  console.log('isEditing:', isEditing);
  console.log('isOwnProfile:', isOwnProfile);
  console.log('currentUserId:', currentUserId);
  console.log('userId:', userId);
  console.log('displayUser:', displayUser);
  console.log('selectedAvatar:', selectedAvatar);
  console.log('formData.avatar:', formData.avatar);
  console.log('Avatar will display:', isEditing ? selectedAvatar : displayUser?.avatar);

  // 他ユーザー用のコンテンツ（ホーム画面のようなUI）
  const otherUserContent = (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="flex flex-col items-center space-y-4 px-4 pt-8">
        <Avatar className="h-28 w-28">
          <AvatarImage src={displayUser?.avatar || ''} />
          <AvatarFallback className="bg-gray-400 text-white text-3xl">
            {displayUser?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="text-center space-y-2 w-full">
          <h2 className="text-[15.75px] font-medium text-black">{displayUser?.name || 'Unknown'}</h2>

          {displayUser?.user_id && (
            <p className="text-xs text-gray-500">
              @{displayUser.user_id}
            </p>
          )}

          {displayUser?.bio && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap break-words px-4">
              {displayUser.bio}
            </p>
          )}

          {/* Follower/Following Stats and Follow Button */}
          {currentUserId && (
            <div className="space-y-3 pt-2">
              {/* Stats */}
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

              {/* Follow Button */}
              <Button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`w-full max-w-xs mx-auto rounded-full text-sm font-medium transition-all ${
                  isFollowingUser
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {isFollowLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowingUser ? (
                  'フォロー中'
                ) : (
                  'フォロー'
                )}
              </Button>
            </div>
          )}

          {/* Social Links */}
          <div className="flex justify-center pt-2">
            <SocialIcons
              socialLinks={{
                instagram: displayUser?.socialLinks?.instagram,
                twitter: displayUser?.socialLinks?.twitter,
                tiktok: displayUser?.socialLinks?.tiktok,
              }}
            />
          </div>
        </div>
      </div>

      {/* Attended Lives Section */}
      <div className="px-4 space-y-4">
        <h3 className="text-[15.75px] font-medium text-black text-center">参加公演</h3>

        {attendedLives.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>参加公演がありません</p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full" defaultValue={Object.keys(groupLivesByMonth(attendedLives))}>
            {Object.entries(groupLivesByMonth(attendedLives)).map(([month, monthLives]) => (
              <AccordionItem key={month} value={month}>
                <AccordionTrigger>{month}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {monthLives.map((live) => (
                      <LiveCard
                        key={live.id}
                        live={live}
                        onClick={() => onLiveClick?.(live)}
                        showMenuButton={false}
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
  );

  // 自分用のコンテンツ（従来のプロフィール編集UI）- ボタン部分は除く
  const ownProfileContentMain = (
    <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-28 h-28 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => isEditing && setShowAvatarSelector(true)}>
                <AvatarImage src={isEditing ? selectedAvatar : displayUser.avatar} />
                <AvatarFallback className="bg-gray-400 text-white text-3xl">
                  {(isEditing ? formData.name : displayUser.name)?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <Button
                  onClick={() => {
                    console.log('=== Profile image change button clicked ===');
                    console.log('Setting showAvatarSelector to true');
                    setShowAvatarSelector(true);
                  }}
                  variant="outline"
                  className="rounded-full border-2 border-primary bg-white text-primary text-sm hover:bg-primary/5 px-6 py-2"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  プロフィール画像を変更
                </Button>
              )}

              {/* Edit Button - shown when not editing and is own profile */}
              {!isEditing && isOwnProfile && (
                <button
                  type="button"
                  onClick={() => {
                    console.log('=== Edit button clicked ===');
                    console.log('Current avatar:', displayUser?.avatar);
                    console.log('formData.avatar:', formData.avatar);
                    // Initialize selectedAvatar with current avatar when entering edit mode
                    setSelectedAvatar(displayUser?.avatar || formData.avatar || '');
                    // Reset userIdStatus to idle when entering edit mode
                    setUserIdStatus('idle');
                    // Clear any previous errors
                    setErrors({});
                    console.log('Setting isEditing to true');
                    setIsEditing(true);
                  }}
                  className="w-full bg-primary text-white text-sm rounded-full px-4 py-2 hover:bg-primary/90 max-w-xs"
                >
                  プロフィール編集
                </button>
              )}

              {/* Follower/Following Stats - shown when not editing */}
              {!isEditing && (
                <div className="flex justify-center gap-6 text-sm pt-2">
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
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label className="text-black font-medium text-center block text-sm">名前</Label>
              {isEditing ? (
                <>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-12 rounded-lg border-2 border-primary bg-white text-black text-sm placeholder:text-gray-500"
                    placeholder="NAME"
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-destructive text-sm"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </>
              ) : (
                <div className="h-12 rounded-lg border-2 border-primary bg-white flex items-center justify-center px-4 text-black text-sm">
                  {displayUser.name}
                </div>
              )}
            </div>

            {/* User ID Field */}
            <div className="space-y-2">
              <Label className="text-black font-medium text-center block text-sm">ユーザーID *</Label>
              {isEditing ? (
                <>
                  <div className="relative">
                    {/* @ Mark */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                      @
                    </div>

                    {/* Input Field */}
                    <Input
                      value={formData.user_id}
                      onChange={(e) => handleInputChange('user_id', e.target.value)}
                      className="h-12 pl-12 pr-12 rounded-lg border-2 border-primary bg-white text-black text-sm placeholder:text-gray-500"
                      placeholder="例: music_lover123"
                    />

                    {/* Status Icon */}
                    {formData.user_id && (
                      <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center ${getUserIdStatusColor(userIdStatus)}`}>
                        {userIdStatus === 'checking' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          getUserIdStatusIcon(userIdStatus)
                        )}
                      </div>
                    )}
                  </div>
                  {errors.user_id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-destructive text-sm text-center"
                    >
                      {errors.user_id}
                    </motion.p>
                  )}
                </>
              ) : (
                <div className="h-12 rounded-lg border-2 border-primary bg-white flex items-center justify-center px-4 text-sm">
                  <span className="text-gray-500 font-medium mr-2">@</span>
                  <span className={displayUser.user_id ? "text-black" : "text-gray-500"}>
                    {displayUser.user_id || '未設定'}
                  </span>
                </div>
              )}
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label className="text-black font-medium text-center block text-sm">自己紹介</Label>
              {isEditing ? (
                <>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="自己紹介を入力してください"
                    className="min-h-20 rounded-lg border-2 border-primary bg-white text-black text-sm placeholder:text-gray-400"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{formData.bio.length}/{VALIDATION_RULES.MAX_BIO_LENGTH}文字</span>
                    {errors.bio && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-destructive"
                      >
                        {errors.bio}
                      </motion.span>
                    )}
                  </div>
                </>
              ) : (
                <div className="min-h-20 rounded-lg border-2 border-primary bg-white px-4 py-3 text-sm">
                  <span className={displayUser.bio ? "text-black whitespace-pre-wrap break-words" : "text-gray-500"}>
                    {displayUser.bio || '未設定'}
                  </span>
                </div>
              )}
            </div>

            {/* Link Field */}
            <div className="space-y-2">
              <Label className="text-black font-medium text-center block text-sm">リンク</Label>
              {isEditing ? (
                <>
                  <Input
                    value={formData.link}
                    onChange={(e) => handleInputChange('link', e.target.value)}
                    placeholder="例: https://example.com"
                    className="h-12 rounded-lg border-2 border-primary bg-white text-black text-sm placeholder:text-gray-500"
                  />
                  {errors.link && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-destructive text-sm text-center"
                    >
                      {errors.link}
                    </motion.p>
                  )}
                </>
              ) : (
                <div className="h-12 rounded-lg border-2 border-primary bg-white flex items-center justify-center px-4 text-sm">
                  {displayUser.link ? (
                    <a
                      href={displayUser.link.startsWith('http') ? displayUser.link : `https://${displayUser.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {displayUser.link}
                    </a>
                  ) : (
                    <span className="text-gray-500">未設定</span>
                  )}
                </div>
              )}
            </div>

            {/* Gallery Section */}
            <div className="space-y-2">
              <Label className="text-black font-medium text-center block text-sm">
                {isEditing ? `ギャラリー（最大${VALIDATION_RULES.MAX_GALLERY_IMAGES}枚）` : 'ギャラリー'}
              </Label>

              {isEditing ? (
                <>
                  {/* Gallery Upload Button */}
                  <Button
                    onClick={triggerGalleryUpload}
                    variant="outline"
                    className="w-full h-12 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary text-primary hover:bg-primary/5"
                    disabled={formData.galleryImages.length >= VALIDATION_RULES.MAX_GALLERY_IMAGES}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    ギャラリーを追加
                  </Button>

                  {/* Gallery Images Grid/Flex */}
                  {formData.galleryImages.length > 0 && (
                    formData.galleryImages.length >= 3 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.galleryImages.map((image, index) => (
                          <GalleryImageItem
                            key={`${image}-${index}`}
                            image={image}
                            index={index}
                            onRemove={handleRemoveGalleryImage}
                            onEdit={handleEditGalleryImage}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        {formData.galleryImages.map((image, index) => (
                          <div key={`${image}-${index}`} className="w-20 h-20">
                            <GalleryImageItem
                              image={image}
                              index={index}
                              onRemove={handleRemoveGalleryImage}
                              onEdit={handleEditGalleryImage}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </>
              ) : (
                <>
                  {displayUser.galleryImages && displayUser.galleryImages.length > 0 ? (
                    displayUser.galleryImages.length >= 3 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {displayUser.galleryImages.map((image, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-primary">
                            <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        {displayUser.galleryImages.map((image, index) => (
                          <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary">
                            <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="h-20 rounded-lg border-2 border-primary bg-white flex items-center justify-center">
                      <span className="text-gray-500 text-sm">未設定</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* SNS Links Section */}
            <div className="space-y-4">
              <Label className="text-black font-medium text-center block text-sm">SNSリンク</Label>

              {/* Instagram */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="relative">
                    {/* SNS Icon */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <picture>
                        <source srcSet={Icons.instagramWebp} type="image/webp" />
                        <img src={Icons.instagram} alt="Instagram" className="w-8 h-8" loading="lazy" decoding="async" />
                      </picture>
                    </div>

                    {/* Input Field */}
                    <Input
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@livme"
                      className="h-12 pl-16 rounded-lg border-2 border-primary bg-white text-black text-sm placeholder:text-gray-500"
                    />
                  </div>
                ) : (
                  <div className="h-12 rounded-lg border-2 border-primary bg-white flex items-center justify-center px-4 text-sm">
                    <picture>
                      <source srcSet={Icons.instagramWebp} type="image/webp" />
                      <img src={Icons.instagram} alt="Instagram" className="w-8 h-8 mr-4" loading="lazy" decoding="async" />
                    </picture>
                    <span className={displayUser.socialLinks?.instagram ? "text-black" : "text-gray-500"}>
                      {displayUser.socialLinks?.instagram || '未設定'}
                    </span>
                  </div>
                )}
              </div>

              {/* X (Twitter) */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <picture>
                        <source srcSet={Icons.xWebp} type="image/webp" />
                        <img src={Icons.x} alt="X" className="w-8 h-8" loading="lazy" decoding="async" />
                      </picture>
                    </div>
                    <Input
                      value={formData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@livme"
                      className="h-12 pl-16 rounded-lg border-2 border-primary bg-white text-black text-sm placeholder:text-gray-500"
                    />
                  </div>
                ) : (
                  <div className="h-12 rounded-lg border-2 border-primary bg-white flex items-center justify-center px-4 text-sm">
                    <picture>
                      <source srcSet={Icons.xWebp} type="image/webp" />
                      <img src={Icons.x} alt="X" className="w-8 h-8 mr-4" loading="lazy" decoding="async" />
                    </picture>
                    <span className={displayUser.socialLinks?.twitter ? "text-black" : "text-gray-500"}>
                      {displayUser.socialLinks?.twitter || '未設定'}
                    </span>
                  </div>
                )}
              </div>

              {/* TikTok */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <picture>
                        <source srcSet={Icons.tiktokWebp} type="image/webp" />
                        <img src={Icons.tiktok} alt="TikTok" className="w-8 h-8" loading="lazy" decoding="async" />
                      </picture>
                    </div>
                    <Input
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange('tiktok', e.target.value)}
                      placeholder="@livme"
                      className="h-12 pl-16 rounded-lg border-2 border-primary bg-white text-black text-sm placeholder:text-gray-500"
                    />
                  </div>
                ) : (
                  <div className="h-12 rounded-lg border-2 border-primary bg-white flex items-center justify-center px-4 text-sm">
                    <picture>
                      <source srcSet={Icons.tiktokWebp} type="image/webp" />
                      <img src={Icons.tiktok} alt="TikTok" className="w-8 h-8 mr-4" loading="lazy" decoding="async" />
                    </picture>
                    <span className={displayUser.socialLinks?.tiktok ? "text-black" : "text-gray-500"}>
                      {displayUser.socialLinks?.tiktok || '未設定'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Attended Lives Section */}
            {!isEditing && (
              <div className="space-y-2 pb-4">
                <Label className="text-black font-medium text-center block text-sm">参加公演</Label>
                {attendedLives.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {attendedLives.map((live) => {
                      const date = new Date(live.date);
                      const year = date.getFullYear();
                      const month = date.getMonth() + 1;
                      const day = date.getDate();
                      const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

                      // 今日の日付と比較（時刻を無視）
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const liveDate = new Date(live.date);
                      liveDate.setHours(0, 0, 0, 0);
                      const isPastLive = liveDate < today;

                      // 過去のライブはグレー、未来のライブは緑
                      const badgeColor = isPastLive ? 'bg-gray-400' : 'bg-primary';
                      const borderColor = isPastLive ? 'border-gray-300' : 'border-primary';

                      return (
                        <div
                          key={live.id}
                          className={`p-3 rounded-lg border-2 ${borderColor} bg-white cursor-pointer hover:bg-gray-50 transition-colors`}
                          onClick={() => onLiveClick?.(live)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`${badgeColor} text-white px-2 py-1 rounded text-center min-w-[60px]`}>
                              <div className="text-[10px] opacity-80 leading-tight">{year}</div>
                              <div className="text-xs font-medium leading-tight">{month}/{day}({weekday})</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-800 truncate">{live.artist}</h4>
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{live.venue}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-20 rounded-lg border-2 border-primary bg-white flex items-center justify-center">
                    <span className="text-gray-500 text-sm">参加公演がありません</span>
                  </div>
                )}
              </div>
            )}

            {/* 編集モード時の下部スペース確保 */}
            {isEditing && <div className="pb-4" />}
          </div>
  );

  // 編集モードのボタン部分
  const editModeButtons = isOwnProfile && isEditing ? (
    <div className="flex-shrink-0 w-full bg-white border-t border-gray-200 px-4 py-3 sm:py-4 flex gap-3">
      <button
        type="button"
        onClick={() => {
          console.log('=== Save button clicked ===');
          console.log('isSaving:', isSaving);
          console.log('isCheckingUserId:', isCheckingUserId);
          console.log('userIdStatus:', userIdStatus);
          console.log('Button disabled?:', isSaving || isCheckingUserId || userIdStatus === 'taken');
          handleSave();
        }}
        className="flex-1 bg-primary text-white text-sm rounded-full px-6 py-2.5 sm:px-8 sm:py-3 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={isSaving || isCheckingUserId || userIdStatus === 'taken'}
      >
        {isSaving ? '保存中...' : '保存する'}
      </button>
      <button
        type="button"
        onClick={handleCancel}
        className="flex-1 text-sm rounded-full px-5 py-2.5 sm:px-6 sm:py-3 border border-input bg-white hover:bg-gray-100 disabled:opacity-50 transition-colors"
        disabled={isSaving}
      >
        キャンセル
      </button>
    </div>
  ) : null;

  return (
    <>
      {/* 自分のプロフィール: モーダル表示 */}
      {isOwnProfile ? (
        <Dialog open={isOpen && !showAvatarSelector} onOpenChange={handleClose}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[70vh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 bg-white sm:w-full !top-[10vh] !translate-y-0 sm:!top-[50%] sm:!translate-y-[-50%] overflow-hidden">
            <VisuallyHidden>
              <DialogTitle>{isEditing ? 'プロフィール編集' : 'プロフィール'}</DialogTitle>
            </VisuallyHidden>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
              {ownProfileContentMain}
            </div>
            {editModeButtons}
          </DialogContent>
        </Dialog>
      ) : (
        /* 他ユーザーのプロフィール: 通常のページとして表示 */
        isOpen && (
          <div className="min-h-screen bg-[#f8f9fa] pb-8">
            {/* 戻るボタン */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
              <div className="max-w-[546px] mx-auto px-4 py-3">
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="戻る"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">戻る</span>
                </button>
              </div>
            </div>
            <div className="w-full max-w-md mx-auto">
              {otherUserContent}
            </div>
          </div>
        )
      )}

      {/* Avatar Selector Modal - Rendered via Portal to avoid z-index conflicts */}
      {showAvatarSelector && !showCropModal && (() => {
        console.log('=== Rendering Avatar Selector Modal via Portal ===');
        return createPortal(
          <div
            data-testid="avatar-selector-backdrop"
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
            onClick={() => {
              console.log('=== Background clicked ===');
              setShowAvatarSelector(false);
            }}
            style={{
              pointerEvents: 'auto',
              zIndex: 99999,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
          <div
            data-testid="avatar-selector-modal"
            className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => {
              console.log('=== Modal content clicked ===');
              e.stopPropagation();
            }}
            style={{
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 100000
            }}
          >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold">プロフィール画像を選択</h3>
                <button
                  type="button"
                  onClick={() => {
                    console.log('=== Close avatar selector clicked ===');
                    setShowAvatarSelector(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Button */}
              <button
                type="button"
                onClick={(e) => {
                  console.log('=== Upload button clicked ===');
                  e.preventDefault();
                  e.stopPropagation();
                  triggerFileUpload();
                }}
                className="w-full p-4 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">画像をアップロード</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF (最大5MB)</p>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {/* Preset Avatars */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-3">プリセット画像</p>
                <div className="grid grid-cols-3 gap-3">
                  {presetAvatars.map((avatar, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={(e) => {
                        console.log('=== Preset avatar clicked ===', index);
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectAvatar(avatar);
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 hover:border-primary transition-all hover:scale-105 active:scale-95"
                      style={{
                        borderColor: selectedAvatar === avatar ? '#78B159' : 'transparent'
                      }}
                    >
                      <img
                        src={avatar}
                        alt={`Avatar option ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      {selectedAvatar === avatar && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Image Crop Modal */}
      {!showAvatarSelector && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          onCropComplete={handleCropComplete}
          imageUrl={cropImageUrl}
          aspectRatio={cropMode === 'avatar' ? 1 : undefined}
          title={cropMode === 'avatar' ? 'アバター画像をクロップ' : 'ギャラリー画像をクロップ'}
        />
      )}

      {/* Follow List Modal */}
      {displayUser && (
        <FollowListModal
          isOpen={showFollowListModal}
          onClose={() => setShowFollowListModal(false)}
          userId={displayUser.id}
          initialTab={followListInitialTab}
          onUserClick={onViewProfile}
        />
      )}
    </>
  );
};

// Gallery Image Item Component
interface GalleryImageItemProps {
  image: string;
  index: number;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
}

const GalleryImageItem: React.FC<GalleryImageItemProps> = ({
  image,
  index,
  onRemove,
  onEdit,
}) => {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary group">
      <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />

      {/* Overlay with actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={() => onEdit(index)}
          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
        >
          <Edit2 className="w-4 h-4 text-black" />
        </button>
        <button
          onClick={() => onRemove(index)}
          className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
};
