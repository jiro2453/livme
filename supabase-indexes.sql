-- ===================================
-- Supabase Database Indexes for livme
-- ===================================
-- このSQLをSupabase SQL Editorで実行してください
-- パフォーマンスが大幅に向上します

-- 1. usersテーブルのインデックス
-- ===================================

-- user_idでの検索を高速化（ログイン、プロフィール検索）
CREATE INDEX IF NOT EXISTS idx_users_user_id
ON users(user_id);

-- auth.uid()との比較を高速化（RLSポリシー用）
-- idフィールドは既にPRIMARY KEYなのでインデックス不要


-- 2. livesテーブルのインデックス
-- ===================================

-- 日付順ソートを高速化
CREATE INDEX IF NOT EXISTS idx_lives_date
ON lives(date DESC);

-- created_byでの検索を高速化（ユーザーが作成したライブ検索）
CREATE INDEX IF NOT EXISTS idx_lives_created_by
ON lives(created_by);

-- アーティスト名での検索を高速化（LIKE検索用）
CREATE INDEX IF NOT EXISTS idx_lives_artist
ON lives(artist);

-- 会場名での検索を高速化（LIKE検索用）
CREATE INDEX IF NOT EXISTS idx_lives_venue
ON lives(venue);


-- 3. live_attendeesテーブルのインデックス
-- ===================================

-- user_idでの検索を高速化（ユーザーが参加しているライブ検索）
CREATE INDEX IF NOT EXISTS idx_live_attendees_user_id
ON live_attendees(user_id);

-- live_idでの検索を高速化（ライブの参加者検索）
CREATE INDEX IF NOT EXISTS idx_live_attendees_live_id
ON live_attendees(live_id);

-- user_idとlive_idの組み合わせで高速化（重複チェック）
CREATE INDEX IF NOT EXISTS idx_live_attendees_user_live
ON live_attendees(user_id, live_id);


-- 4. followsテーブルのインデックス
-- ===================================

-- follower_idでの検索を高速化（フォローしているユーザー検索）
CREATE INDEX IF NOT EXISTS idx_follows_follower_id
ON follows(follower_id);

-- following_idでの検索を高速化（フォロワー検索）
CREATE INDEX IF NOT EXISTS idx_follows_following_id
ON follows(following_id);

-- フォロー関係の確認を高速化
CREATE INDEX IF NOT EXISTS idx_follows_follower_following
ON follows(follower_id, following_id);


-- 5. 統計情報の更新
-- ===================================
-- クエリプランナーの最適化のため、統計情報を更新

ANALYZE users;
ANALYZE lives;
ANALYZE live_attendees;
ANALYZE follows;


-- 6. 確認: 作成されたインデックスを表示
-- ===================================

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'lives', 'live_attendees', 'follows')
  AND schemaname = 'public'
ORDER BY tablename, indexname;
