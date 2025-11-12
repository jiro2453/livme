import { supabase } from './supabase';
import type { User, Live } from '../types';

// User API
export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, user_id, name, bio, avatar, link, social_links, images, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  // Convert snake_case to camelCase for UI
  return {
    ...data,
    socialLinks: data.social_links,
    galleryImages: data.images,
  };
};

export const getUserByUserId = async (userId: string): Promise<User | null> => {
  console.log('getUserByUserId呼び出し:', userId);

  // Single optimized query using OR condition
  const { data, error } = await supabase
    .from('users')
    .select('id, user_id, name, bio, avatar, link, social_links, images, created_at, updated_at')
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }

  if (data) {
    console.log(`取得したuser ${userId}:`, data);
    // Convert snake_case to camelCase for UI
    return {
      ...data,
      socialLinks: data.social_links,
      galleryImages: data.images,
    };
  }

  console.error(`User not found: ${userId}`);
  return null;
};

// Get multiple users by their IDs in a single query
// Supports both UUID (id column) and string (user_id column)
export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  if (!userIds || userIds.length === 0) {
    console.log('getUsersByIds: No user IDs provided');
    return [];
  }

  console.log('getUsersByIds呼び出し:', userIds);
  console.log('getUsersByIds: Number of IDs:', userIds.length);

  // Single optimized query using OR condition
  const { data, error } = await supabase
    .from('users')
    .select('id, user_id, name, bio, avatar, social_links, images, created_at, updated_at')
    .or(`id.in.(${userIds.join(',')}),user_id.in.(${userIds.join(',')})`);

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  const users = data || [];
  console.log('getUsersByIds: Total found:', users.length);

  // Convert snake_case to camelCase for UI
  return users.map(user => ({
    ...user,
    socialLinks: user.social_links,
    galleryImages: user.images,
  }));
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  console.log('=== updateUser called ===');
  console.log('userId:', userId);
  console.log('updates:', updates);
  console.log('updates.bio:', updates.bio);

  // Convert camelCase to snake_case for database
  const dbUpdates: any = { ...updates };

  // Handle socialLinks conversion
  if (updates.socialLinks) {
    dbUpdates.social_links = updates.socialLinks;
    delete dbUpdates.socialLinks;
  }

  // Handle galleryImages conversion - store in images field as jsonb
  if (updates.galleryImages !== undefined) {
    dbUpdates.images = updates.galleryImages;
    delete dbUpdates.galleryImages;
  }

  console.log('dbUpdates (for database):', dbUpdates);
  console.log('dbUpdates.bio:', dbUpdates.bio);

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select('id, user_id, name, bio, avatar, link, social_links, images, created_at, updated_at')
    .single();

  if (error) {
    console.error('=== Error updating user ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    throw new Error(`プロフィールの更新に失敗しました: ${error.message}`);
  }

  console.log('Update successful, data:', data);
  console.log('data.bio:', data.bio);

  // Convert snake_case to camelCase for UI
  const result = {
    ...data,
    socialLinks: data.social_links,
    galleryImages: data.images,
  };

  console.log('Returning result:', result);
  console.log('result.bio:', result.bio);

  return result;
};

// Alias for profile modal
export const updateUserProfile = updateUser;

// Check if user ID is available
export const checkUserIdAvailability = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking user ID availability:', error);
    return false;
  }

  // If no user found, the ID is available
  return !data;
};

// Live API
export const getLivesByUserId = async (userId: string): Promise<Live[]> => {
  const { data, error } = await supabase
    .from('lives')
    .select('id, artist, date, venue, image_url, created_by, created_at, updated_at')
    .eq('created_by', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching lives:', error);
    return [];
  }

  return data || [];
};

export const getAllLives = async (): Promise<Live[]> => {
  const { data, error } = await supabase
    .from('lives')
    .select('id, artist, date, venue, image_url, created_by, created_at, updated_at')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching all lives:', error);
    return [];
  }

  return data || [];
};

export const createLive = async (live: Omit<Live, 'id' | 'created_at' | 'updated_at'>): Promise<Live | null> => {
  const { data, error } = await supabase
    .from('lives')
    .insert(live)
    .select('id, artist, date, venue, image_url, created_by, created_at, updated_at')
    .single();

  if (error) {
    console.error('Error creating live:', error);
    return null;
  }

  // Add the creator to live_attendees table
  const { error: attendeeError } = await supabase
    .from('live_attendees')
    .insert({
      live_id: data.id,
      user_id: live.created_by
    });

  if (attendeeError) {
    console.error('Error adding creator to live_attendees:', attendeeError);
    // Note: We don't return null here because the live was created successfully
    // The attendee entry is a secondary operation
  }

  return data;
};

export const updateLive = async (liveId: string, updates: Partial<Live>): Promise<Live | null> => {
  const { data, error } = await supabase
    .from('lives')
    .update(updates)
    .eq('id', liveId)
    .select('id, artist, date, venue, image_url, created_by, created_at, updated_at')
    .single();

  if (error) {
    console.error('Error updating live:', error);
    return null;
  }

  return data;
};

export const deleteLive = async (liveId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('live_attendees')
    .delete()
    .eq('live_id', liveId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting live attendee:', error);
    return false;
  }

  return true;
};

// Get users attending the same live event
export const getUsersAttendingSameLive = async (live: Live): Promise<string[]> => {
  console.log('=== live_attendeesテーブルから参加者を取得 ===');
  console.log('ライブID:', live.id);
  console.log('ライブ情報:', {
    artist: live.artist,
    venue: live.venue,
    date: live.date
  });

  // live_attendeesテーブルから該当ライブの全参加者を取得
  const { data, error } = await supabase
    .from('live_attendees')
    .select('user_id')
    .eq('live_id', live.id);

  if (error) {
    console.error('参加者取得エラー:', error);
    return [];
  }

  console.log('取得した参加者データ:', data);
  console.log('参加者数:', data?.length || 0);

  // user_idのリストを返す
  const userIds = data?.map(attendee => attendee.user_id) || [];
  console.log('参加者のuser_idリスト:', userIds);

  return userIds;
};

// Get lives that a user is attending
export const getAttendedLivesByUserId = async (userId: string): Promise<Live[]> => {
  console.log('=== Getting attended lives for user UUID (optimized JOIN) ===', userId);

  // Single query with JOIN to get both attendee and live data
  const { data, error } = await supabase
    .from('live_attendees')
    .select(`
      live_id,
      lives (
        id,
        artist,
        date,
        venue,
        image_url,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching attended lives:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('No attended lives found');
    return [];
  }

  // Extract lives from the joined data and filter out any null entries
  // Note: Supabase JOIN returns lives as a single object (not array) for many-to-one relationships
  // Using 'unknown' intermediate cast due to Supabase type inference limitations
  const livesData = data
    .map(item => item.lives as unknown as Live | null)
    .filter((live): live is Live => live !== null);

  // Sort by date (most recent first) - doing this in-memory since JOIN doesn't support direct ordering
  livesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log('Fetched attended lives (optimized):', livesData.length);
  return livesData;
};

// Follow API
export const followUser = async (followerId: string, followingId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });

  if (error) {
    console.error('Error following user:', error);
    return false;
  }

  return true;
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .match({ follower_id: followerId, following_id: followingId });

  if (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }

  return true;
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .match({ follower_id: followerId, following_id: followingId })
    .single();

  if (error) {
    return false;
  }

  return !!data;
};

export const getFollowerCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) {
    console.error('Error getting follower count:', error);
    return 0;
  }

  return count || 0;
};

export const getFollowingCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (error) {
    console.error('Error getting following count:', error);
    return 0;
  }

  return count || 0;
};

// Storage API
export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const deleteImage = async (path: string): Promise<boolean> => {
  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
};
