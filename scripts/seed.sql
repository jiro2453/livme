-- Seed script for LIVME
-- Creates 10 sample users and a Suchmos live event

-- Insert sample users
INSERT INTO users (name, user_id, bio, avatar, social_links, images, created_at, updated_at) VALUES
('田中 健太', 'kenta_music', '音楽が生きがい🎵 ライブハウス巡りが趣味です。Suchmosファン歴5年！', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kenta', '{"twitter": "kenta_music", "instagram": "kenta.live"}', '[]', now(), now()),
('佐藤 美咲', 'misaki_live', '都内のライブによく行きます！同じアーティストが好きな人と繋がりたい✨', 'https://api.dicebear.com/7.x/avataaars/svg?seed=misaki', '{"instagram": "misaki_live"}', '[]', now(), now()),
('鈴木 大輔', 'daisuke_fan', 'ロック好き🎸 週末はライブで汗かいてます！', 'https://api.dicebear.com/7.x/avataaars/svg?seed=daisuke', '{"twitter": "daisuke_rock"}', '[]', now(), now()),
('高橋 あかり', 'akari_music', 'フェス＆ライブ参戦記録🎪 音楽と旅行が好きです', 'https://api.dicebear.com/7.x/avataaars/svg?seed=akari', '{"instagram": "akari.festivals", "twitter": "akari_fes"}', '[]', now(), now()),
('伊藤 翔太', 'shota_beats', 'ビートメイカー / ライブ好き / 音楽で繋がろう🎧', 'https://api.dicebear.com/7.x/avataaars/svg?seed=shota', '{"twitter": "shota_beats"}', '[]', now(), now()),
('渡辺 ゆい', 'yui_livelife', '月10本ライブ参戦🔥 音楽友達募集中！', 'https://api.dicebear.com/7.x/avataaars/svg?seed=yui', '{"instagram": "yui.livelife"}', '[]', now(), now()),
('中村 隆', 'takashi_sounds', 'ジャズからロックまで幅広く聴きます。ライブ情報交換しましょう！', 'https://api.dicebear.com/7.x/avataaars/svg?seed=takashi', '{"twitter": "takashi_music"}', '[]', now(), now()),
('小林 さくら', 'sakura_melody', '音楽が人生🌸 ライブで新しい出会いを楽しんでいます', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sakura', '{"instagram": "sakura.melody", "tiktok": "sakura_music"}', '[]', now(), now()),
('加藤 リョウ', 'ryo_groove', 'グルーヴを求めて🎵 Zepp常連です', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryo', '{"twitter": "ryo_groove"}', '[]', now(), now()),
('山本 ナナ', 'nana_vibes', 'いい音楽には国境がない🌏 ライブで会いましょう！', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nana', '{"instagram": "nana.vibes", "twitter": "nana_music"}', '[]', now(), now());

-- Create Suchmos live event (using the first created user as creator)
WITH first_user AS (
  SELECT id FROM users WHERE user_id = 'kenta_music' LIMIT 1
)
INSERT INTO lives (artist, venue, date, image_url, created_by)
SELECT
  'Suchmos',
  'Zepp Haneda',
  '2024-12-13',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
  id
FROM first_user;

-- Add all users to the live event
WITH suchmos_live AS (
  SELECT id FROM lives WHERE artist = 'Suchmos' AND venue = 'Zepp Haneda' AND date = '2024-12-13' LIMIT 1
),
all_users AS (
  SELECT id FROM users WHERE user_id IN (
    'kenta_music', 'misaki_live', 'daisuke_fan', 'akari_music', 'shota_beats',
    'yui_livelife', 'takashi_sounds', 'sakura_melody', 'ryo_groove', 'nana_vibes'
  )
)
INSERT INTO live_attendees (live_id, user_id)
SELECT suchmos_live.id, all_users.id
FROM suchmos_live, all_users;

-- Summary
SELECT
  (SELECT COUNT(*) FROM users WHERE user_id IN ('kenta_music', 'misaki_live', 'daisuke_fan', 'akari_music', 'shota_beats', 'yui_livelife', 'takashi_sounds', 'sakura_melody', 'ryo_groove', 'nana_vibes')) as users_created,
  (SELECT COUNT(*) FROM lives WHERE artist = 'Suchmos' AND venue = 'Zepp Haneda') as lives_created,
  (SELECT COUNT(*) FROM live_attendees WHERE live_id IN (SELECT id FROM lives WHERE artist = 'Suchmos' AND venue = 'Zepp Haneda')) as attendees_added;
