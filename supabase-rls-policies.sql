-- ===================================
-- Supabase RLS Policies for livme
-- ===================================
-- このSQLをSupabase SQL Editorで実行してください

-- 0. タイムアウト設定を延長（重要！）
-- ===================================
ALTER DATABASE postgres SET statement_timeout = '30s';
SET statement_timeout = '30s';

-- 1. usersテーブルのRLSポリシー
-- ===================================

-- RLSを一時的に無効化してポリシーを再作成
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- RLSを再有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 読み取り: 全員が閲覧可能（シンプル）
CREATE POLICY "Users are viewable by everyone"
ON users FOR SELECT
USING (true);

-- 更新: ログイン中のユーザーが自分のプロフィールのみ更新可能（シンプル）
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- 挿入: ログイン中のユーザーが自分のプロフィールのみ作成可能
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);


-- 2. livesテーブルのRLSポリシー
-- ===================================

DROP POLICY IF EXISTS "Lives are viewable by everyone" ON lives;
DROP POLICY IF EXISTS "Users can create lives" ON lives;
DROP POLICY IF EXISTS "Users can update own lives" ON lives;
DROP POLICY IF EXISTS "Users can delete own lives" ON lives;

-- 読み取り: 全員が閲覧可能
CREATE POLICY "Lives are viewable by everyone"
ON lives FOR SELECT
USING (true);

-- 挿入: ログイン中のユーザーがライブを作成可能
CREATE POLICY "Users can create lives"
ON lives FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- 更新: 作成者のみ更新可能
CREATE POLICY "Users can update own lives"
ON lives FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 削除: 作成者のみ削除可能
CREATE POLICY "Users can delete own lives"
ON lives FOR DELETE
USING (auth.uid() = created_by);


-- 3. live_attendeesテーブルのRLSポリシー
-- ===================================

DROP POLICY IF EXISTS "Attendees are viewable by everyone" ON live_attendees;
DROP POLICY IF EXISTS "Users can add themselves as attendees" ON live_attendees;
DROP POLICY IF EXISTS "Users can remove themselves as attendees" ON live_attendees;

-- 読み取り: 全員が閲覧可能
CREATE POLICY "Attendees are viewable by everyone"
ON live_attendees FOR SELECT
USING (true);

-- 挿入: ログイン中のユーザーが自分を参加者として登録可能
CREATE POLICY "Users can add themselves as attendees"
ON live_attendees FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 削除: ログイン中のユーザーが自分の参加を削除可能
CREATE POLICY "Users can remove themselves as attendees"
ON live_attendees FOR DELETE
USING (auth.uid() = user_id);


-- 4. followsテーブルのRLSポリシー
-- ===================================

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON follows;

-- 読み取り: 全員が閲覧可能
CREATE POLICY "Follows are viewable by everyone"
ON follows FOR SELECT
USING (true);

-- 挿入: ログイン中のユーザーが他のユーザーをフォロー可能
CREATE POLICY "Users can follow others"
ON follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- 削除: ログイン中のユーザーが自分のフォローを削除可能
CREATE POLICY "Users can unfollow others"
ON follows FOR DELETE
USING (auth.uid() = follower_id);


-- 5. RLSを有効化
-- ===================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;


-- 6. 確認: 現在のポリシーを表示
-- ===================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('users', 'lives', 'live_attendees', 'follows')
ORDER BY tablename, policyname;
