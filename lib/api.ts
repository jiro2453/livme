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

  // Check if userId is a UUID format
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  let query = supabase
    .from('users')
    .select('id, user_id, name, bio, avatar, link, social_links, images, created_at, updated_at');

  // Use appropriate column based on format
  if (isUUID) {
    // If UUID format, search by id column
    query = query.eq('id', userId);
  } else {
    // Otherwise, search by user_id column
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.maybeSingle();

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

// Search users by user_id with prefix matching
export const searchUsersByUserId = async (query: string): Promise<User[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  console.log('searchUsersByUserId呼び出し:', query);

  const { data, error } = await supabase
    .from('users')
    .select('id, user_id, name, bio, avatar, link, social_links, images, created_at, updated_at')
    .ilike('user_id', `${query.trim()}%`)
    .limit(20);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('No users found for query:', query);
    return [];
  }

  console.log(`Found ${data.length} users for query:`, query);

  // Convert snake_case to camelCase for UI
  return data.map(user => ({
    ...user,
    socialLinks: user.social_links,
    galleryImages: user.images,
  }));
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

  // Check if all IDs are UUIDs or user_ids
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const uuidIds = userIds.filter(id => uuidRegex.test(id));
  const stringIds = userIds.filter(id => !uuidRegex.test(id));

  let query = supabase
    .from('users')
    .select('id, user_id, name, bio, avatar, link, social_links, images, created_at, updated_at');

  // Build OR condition only for the types of IDs we have
  const conditions: string[] = [];
  if (uuidIds.length > 0) {
    conditions.push(`id.in.(${uuidIds.join(',')})`);
  }
  if (stringIds.length > 0) {
    conditions.push(`user_id.in.(${stringIds.join(',')})`);
  }

  if (conditions.length > 0) {
    query = query.or(conditions.join(','));
  } else {
    return [];
  }

  const { data, error } = await query;

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

  // Build database updates object with only valid fields
  const dbUpdates: any = {};

  // Map allowed fields explicitly
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.user_id !== undefined) dbUpdates.user_id = updates.user_id;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.link !== undefined) dbUpdates.link = updates.link;
  if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;

  // Handle socialLinks conversion to social_links
  if (updates.socialLinks !== undefined) {
    dbUpdates.social_links = updates.socialLinks;
  }

  // Handle galleryImages conversion to images
  if (updates.galleryImages !== undefined) {
    dbUpdates.images = updates.galleryImages;
  }

  console.log('dbUpdates (for database):', dbUpdates);
  console.log('dbUpdates.bio:', dbUpdates.bio);
  console.log('Number of fields to update:', Object.keys(dbUpdates).length);

  if (Object.keys(dbUpdates).length === 0) {
    console.warn('No fields to update');
    throw new Error('更新するフィールドがありません');
  }

  // Step 1: Perform update without select to avoid RLS double-check
  console.log('Executing update...');
  const { error: updateError } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId);

  if (updateError) {
    console.error('=== Error updating user ===');
    console.error('Error object:', updateError);
    console.error('Error message:', updateError.message);
    console.error('Error code:', updateError.code);
    console.error('Error details:', updateError.details);
    console.error('Error hint:', updateError.hint);
    throw new Error(`プロフィールの更新に失敗しました: ${updateError.message}`);
  }

  console.log('Update successful, fetching updated data...');

  // Step 2: Fetch the updated data separately
  const { data, error: fetchError } = await supabase
    .from('users')
    .select('id, user_id, name, bio, avatar, link, social_links, images, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (fetchError || !data) {
    console.error('Error fetching updated user:', fetchError);
    throw new Error('更新は成功しましたが、データの取得に失敗しました');
  }

  console.log('Fetched updated data:', data);
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

// Get artist suggestions based on search query
export const getArtistSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 1) return [];

  const { data, error } = await supabase
    .from('lives')
    .select('artist')
    .ilike('artist', `%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error fetching artist suggestions:', error);
    return [];
  }

  // Get unique artist names
  const uniqueArtists = [...new Set(data.map(live => live.artist))];
  return uniqueArtists;
};

// Get venue suggestions based on search query
export const getVenueSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 1) return [];

  const { data, error } = await supabase
    .from('lives')
    .select('venue')
    .ilike('venue', `%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error fetching venue suggestions:', error);
    return [];
  }

  // Get unique venue names
  const uniqueVenues = [...new Set(data.map(live => live.venue))];
  return uniqueVenues;
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

// Find existing live by artist, venue, and date
export const findExistingLive = async (artist: string, venue: string, date: string): Promise<Live | null> => {
  const { data, error } = await supabase
    .from('lives')
    .select('id, artist, date, venue, image_url, created_by, created_at, updated_at')
    .eq('artist', artist)
    .eq('venue', venue)
    .eq('date', date)
    .maybeSingle();

  if (error) {
    console.error('Error finding existing live:', error);
    return null;
  }

  return data;
};

// Update user's live attendance (move from old live to new live)
export const updateUserLiveAttendance = async (
  userId: string,
  oldLiveId: string,
  newLiveId: string
): Promise<boolean> => {
  // Delete old attendance
  const { error: deleteError } = await supabase
    .from('live_attendees')
    .delete()
    .eq('live_id', oldLiveId)
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error deleting old live attendance:', deleteError);
    return false;
  }

  // Check if already attending the new live
  const { data: existingAttendance } = await supabase
    .from('live_attendees')
    .select('live_id')
    .eq('live_id', newLiveId)
    .eq('user_id', userId)
    .maybeSingle();

  // Add new attendance only if not already attending
  if (!existingAttendance) {
    const { error: insertError } = await supabase
      .from('live_attendees')
      .insert({
        live_id: newLiveId,
        user_id: userId
      });

    if (insertError) {
      console.error('Error adding new live attendance:', insertError);
      return false;
    }
  }

  return true;
};

// Add user attendance to an existing live
export const addLiveAttendance = async (liveId: string, userId: string): Promise<boolean> => {
  // Check if already attending
  const { data: existingAttendance } = await supabase
    .from('live_attendees')
    .select('live_id')
    .eq('live_id', liveId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingAttendance) {
    // Already attending this live
    return true;
  }

  // Add new attendance
  const { error } = await supabase
    .from('live_attendees')
    .insert({
      live_id: liveId,
      user_id: userId
    });

  if (error) {
    console.error('Error adding live attendance:', error);
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

// Get list of followers (users who follow this user)
export const getFollowers = async (userId: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', userId);

  if (error) {
    console.error('Error getting followers:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const followerIds = data.map((follow) => follow.follower_id);
  return getUsersByIds(followerIds);
};

// Get list of users this user is following
export const getFollowing = async (userId: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (error) {
    console.error('Error getting following:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const followingIds = data.map((follow) => follow.following_id);
  return getUsersByIds(followingIds);
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

// Account Deletion API
export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  try {
    console.log('=== deleteUserAccount called ===');
    console.log('userId:', userId);

    // 1. Delete from live_attendees
    const { error: attendeesError } = await supabase
      .from('live_attendees')
      .delete()
      .eq('user_id', userId);

    if (attendeesError) {
      console.error('Error deleting live_attendees:', attendeesError);
      throw attendeesError;
    }

    // 2. Delete lives created by this user
    const { error: livesError } = await supabase
      .from('lives')
      .delete()
      .eq('created_by', userId);

    if (livesError) {
      console.error('Error deleting lives:', livesError);
      throw livesError;
    }

    // 3. Delete from follows (as follower)
    const { error: followersError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId);

    if (followersError) {
      console.error('Error deleting followers:', followersError);
      throw followersError;
    }

    // 4. Delete from follows (as following)
    const { error: followingError } = await supabase
      .from('follows')
      .delete()
      .eq('following_id', userId);

    if (followingError) {
      console.error('Error deleting following:', followingError);
      throw followingError;
    }

    // 5. Delete user profile
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Error deleting user:', userError);
      throw userError;
    }

    // 6. Sign out from Supabase Auth
    await supabase.auth.signOut();

    console.log('Account deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    return false;
  }
};
