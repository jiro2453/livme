# LIVME v1.0.0

日本のライブエンターテインメント向けモバイルWebアプリケーション。アーティスト・パフォーマーがライブ・公演情報を管理し、ファンとつながるためのソーシャルプラットフォームです。

## 主要機能

- **ユーザー認証**: Supabase Authによるメール・パスワード認証
- **プロフィール管理**: アバター、名前、ユーザーID、自己紹介、SNSリンク、ギャラリー（最大6枚）
- **ライブ管理**: ライブ・公演の追加・編集・削除、日付による自動色分け（未来=緑、過去=グレー）
- **フォローシステム**: Instagramライクなフォロー・アンフォロー機能
- **プロフィール共有**: URLによるプロフィール共有機能
- **画像処理**: react-image-cropによる画像クロップ、react-dndによるドラッグ&ドロップ並び替え
- **Google AdSense**: 広告統合（Publisher ID: ca-pub-9899334610612784）

## 技術スタック

### コアフレームワーク
- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Tailwind CSS v4.0** (スタイリング)
- **shadcn/ui** (UIコンポーネントライブラリ)

### バックエンド
- **Supabase** (BaaS)
  - PostgreSQL データベース
  - 認証システム
  - Row Level Security (RLS)

### 主要ライブラリ
- motion/react (Framer Motion)
- react-dnd (ドラッグ&ドロップ)
- react-image-crop (画像クロップ)
- react-hook-form (フォーム管理)
- sonner (トースト通知)
- lucide-react (アイコン)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の内容を設定してください：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `docs/livme-complete-database-setup.sql`ファイルの内容をSupabase SQL Editorで実行
3. Storageセクションで`images`バケットを作成（Public: true, File size limit: 5MB）

### 4. 開発サーバーの起動

```bash
npm run dev
```

### 5. ビルド

```bash
npm run build
```

## プロジェクト構造

```
LIVME/
├── App.tsx                    # メインアプリケーション
├── index.html                 # HTMLエントリーポイント
├── package.json               # 依存関係
├── vite.config.ts             # Vite設定
├── tailwind.config.js         # Tailwind CSS設定
├── postcss.config.js          # PostCSS設定
├── netlify.toml               # Netlify設定
├── src/
│   └── main.tsx               # Reactエントリーポイント
├── components/                # Reactコンポーネント
│   ├── auth/                  # 認証関連
│   ├── ui/                    # UIコンポーネント
│   └── ...
├── contexts/                  # Reactコンテキスト
├── hooks/                     # カスタムフック
├── lib/                       # ユーティリティライブラリ
├── types/                     # TypeScript型定義
├── utils/                     # ユーティリティ関数
├── styles/                    # グローバルCSS
├── public/                    # 静的ファイル
└── docs/                      # ドキュメント
```

## デプロイ

### Netlify

#### 初回デプロイ手順

1. **GitHubリポジトリにプッシュ**
2. **Netlifyで新しいサイトを作成**
   - [Netlify](https://app.netlify.com/)にログイン
   - "Add new site" > "Import an existing project" を選択
3. **リポジトリを接続**
   - GitHubを選択し、リポジトリを選択
4. **ビルド設定を確認**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20 (自動的に設定されます)
5. **環境変数を設定**
   - Site settings > Environment variables に移動
   - 以下の環境変数を追加：
     - `VITE_SUPABASE_URL`: あなたのSupabaseプロジェクトURL
     - `VITE_SUPABASE_ANON_KEY`: あなたのSupabase匿名キー
6. **デプロイ**
   - "Deploy site"をクリック

#### 環境変数について

**重要**: 環境変数が設定されていなくてもビルドは成功します（プレースホルダー値が使用されます）。ただし、実際にアプリケーションを動作させるには、Netlifyで正しい環境変数を設定する必要があります。

環境変数の取得方法:
1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. プロジェクトを選択
3. Settings > API に移動
4. "Project URL" と "anon/public" キーをコピー

#### トラブルシューティング

**ビルドが失敗する場合:**
1. `npm install` が実行されているか確認
2. Node.jsバージョンが20以上か確認（netlify.tomlで指定済み）
3. ビルドログで具体的なエラーメッセージを確認

**アプリが動作しない場合:**
1. Netlifyで環境変数が正しく設定されているか確認
2. ブラウザのコンソールでエラーメッセージを確認
3. Supabaseプロジェクトのデータベースとストレージが正しく設定されているか確認

## ライセンス

MIT License

## バージョン

v1.0.0
