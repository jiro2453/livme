-- ユーザーが自分自身のアカウントを削除できるようにするRLSポリシー

-- 1. usersテーブル: 自分のユーザーレコードを削除可能
CREATE POLICY "Users can delete their own account"
ON users
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- 2. livesテーブル: 自分が作成したライブを削除可能
CREATE POLICY "Users can delete their own lives"
ON lives
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- 3. live_attendeesテーブル: 自分の参加履歴を削除可能
CREATE POLICY "Users can delete their own attendance records"
ON live_attendees
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. followsテーブル: 自分が関わるフォロー関係を削除可能
CREATE POLICY "Users can delete their own follow relationships"
ON follows
FOR DELETE
TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);
