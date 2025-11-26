import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') {
  console.error('❌ Error: Supabase environment variables are not set.');
  console.error('Please create a .env file in the project root with the following variables:');
  console.error('VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('\nYou can copy .env.example to .env and fill in your Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample user data
const sampleUsers = [
  {
    name: '田中 健太',
    user_id: 'kenta_music',
    bio: '音楽が生きがい🎵 ライブハウス巡りが趣味です。Suchmosファン歴5年！',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kenta',
    social_links: { twitter: 'kenta_music', instagram: 'kenta.live' },
  },
  {
    name: '佐藤 美咲',
    user_id: 'misaki_live',
    bio: '都内のライブによく行きます！同じアーティストが好きな人と繋がりたい✨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=misaki',
    social_links: { instagram: 'misaki_live' },
  },
  {
    name: '鈴木 大輔',
    user_id: 'daisuke_fan',
    bio: 'ロック好き🎸 週末はライブで汗かいてます！',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daisuke',
    social_links: { twitter: 'daisuke_rock' },
  },
  {
    name: '高橋 あかり',
    user_id: 'akari_music',
    bio: 'フェス＆ライブ参戦記録🎪 音楽と旅行が好きです',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=akari',
    social_links: { instagram: 'akari.festivals', twitter: 'akari_fes' },
  },
  {
    name: '伊藤 翔太',
    user_id: 'shota_beats',
    bio: 'ビートメイカー / ライブ好き / 音楽で繋がろう🎧',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shota',
    social_links: { twitter: 'shota_beats' },
  },
  {
    name: '渡辺 ゆい',
    user_id: 'yui_livelife',
    bio: '月10本ライブ参戦🔥 音楽友達募集中！',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yui',
    social_links: { instagram: 'yui.livelife' },
  },
  {
    name: '中村 隆',
    user_id: 'takashi_sounds',
    bio: 'ジャズからロックまで幅広く聴きます。ライブ情報交換しましょう！',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takashi',
    social_links: { twitter: 'takashi_music' },
  },
  {
    name: '小林 さくら',
    user_id: 'sakura_melody',
    bio: '音楽が人生🌸 ライブで新しい出会いを楽しんでいます',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sakura',
    social_links: { instagram: 'sakura.melody', tiktok: 'sakura_music' },
  },
  {
    name: '加藤 リョウ',
    user_id: 'ryo_groove',
    bio: 'グルーヴを求めて🎵 Zepp常連です',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryo',
    social_links: { twitter: 'ryo_groove' },
  },
  {
    name: '山本 ナナ',
    user_id: 'nana_vibes',
    bio: 'いい音楽には国境がない🌏 ライブで会いましょう！',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nana',
    social_links: { instagram: 'nana.vibes', twitter: 'nana_music' },
  },
];

async function seedUsers() {
  console.log('🌱 Starting to seed users...');

  try {
    // Create users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select('id, user_id, name');

    if (usersError) {
      console.error('❌ Error creating users:', usersError);
      return;
    }

    console.log(`✅ Created ${users?.length} users`);
    users?.forEach(user => {
      console.log(`   - ${user.name} (@${user.user_id})`);
    });

    // Create Suchmos live event
    console.log('\n🎵 Creating Suchmos live event...');
    const { data: liveEvent, error: liveError } = await supabase
      .from('lives')
      .insert({
        artist: 'Suchmos',
        venue: 'Zepp Haneda',
        date: '2024-12-13',
        image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
        created_by: users?.[0]?.id || '',
      })
      .select('id, artist, venue, date')
      .single();

    if (liveError) {
      console.error('❌ Error creating live event:', liveError);
      return;
    }

    console.log(`✅ Created live event: ${liveEvent.artist} @ ${liveEvent.venue} (${liveEvent.date})`);

    // Add all users to the live event
    console.log('\n👥 Adding users to live event...');
    const attendees = users?.map(user => ({
      live_id: liveEvent.id,
      user_id: user.id,
    })) || [];

    const { error: attendeesError } = await supabase
      .from('live_attendees')
      .insert(attendees);

    if (attendeesError) {
      console.error('❌ Error adding attendees:', attendeesError);
      return;
    }

    console.log(`✅ Added ${attendees.length} users to the live event`);
    console.log('\n🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the seeding function
seedUsers();
