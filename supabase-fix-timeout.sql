-- ===================================
-- Supabase タイムアウト設定の修正
-- ===================================
-- このSQLをSupabase SQL Editorで実行してください

-- 1. statement_timeoutを延長（デフォルト: 3秒 → 30秒）
-- ===================================
ALTER DATABASE postgres SET statement_timeout = '30s';

-- 現在のセッションにも適用
SET statement_timeout = '30s';

-- 2. タイムアウト設定を確認
-- ===================================
SHOW statement_timeout;

-- 3. 実行中のクエリを確認（デバッグ用）
-- ===================================
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '1 seconds'
  AND state != 'idle'
ORDER BY duration DESC;
