# iOS Universal Links セットアップガイド

このドキュメントでは、iOSアプリでUniversal Linksを有効にする手順を説明します。

## 概要

Universal Linksを設定すると、`https://livme.net/user_id` のようなWebのURLがiOSアプリで開けるようになります。

## 前提条件

- Appleの開発者アカウント
- Team ID（Apple Developer Portalで確認）

## セットアップ手順

### 1. apple-app-site-associationファイルの設定

`public/.well-known/apple-app-site-association` ファイルは既に作成されています。

**重要**: このファイルを編集して、`TEAMID` を実際のApple Team IDに置き換えてください。

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.com.livme.app",
        "paths": [
          "/*"
        ]
      }
    ]
  }
}
```

Team IDの確認方法：
- Apple Developer Portal（https://developer.apple.com/account）にログイン
- Membership → Team ID を確認

### 2. Webサーバーへのデプロイ

`apple-app-site-association` ファイルを以下のURLで公開する必要があります：

```
https://livme.net/.well-known/apple-app-site-association
```

**要件**:
- HTTPSで配信すること
- Content-Type: `application/json` または `text/plain`
- リダイレクトなしでアクセス可能

確認方法：
```bash
curl https://livme.net/.well-known/apple-app-site-association
```

### 3. Xcodeでの設定

1. **Xcodeでプロジェクトを開く**:
   ```bash
   open ios/App/App.xcworkspace
   ```

2. **プロジェクトナビゲーター**で `App` (最上部の青いアイコン) を選択

3. **Signing & Capabilities** タブを開く

4. **+ Capability** をクリック

5. **Associated Domains** を追加

6. **Domains** に以下を追加:
   ```
   applinks:livme.net
   ```

   - `www`サブドメインも対応する場合:
   ```
   applinks:livme.net
   applinks:www.livme.net
   ```

7. **Team** を選択（まだ設定していない場合）

### 4. ビルド＆テスト

```bash
cd /Users/uta/Documents/livme
npm run build
npx cap sync ios
```

Xcodeで **⌘ + R** を押してビルド＆実行

## テスト方法

### 1. カスタムURLスキーム (livme://)

Safariで以下を開く：
```
livme://jiro2453
```

→ アプリが開いて `jiro2453` のプロフィールに遷移

### 2. Universal Links (https://)

Safariで以下を開く：
```
https://livme.net/jiro2453
```

→ アプリがインストールされている場合、アプリで開く
→ アプリがない場合、ブラウザで表示

**注意**: iOSシミュレーターでUniversal Linksをテストする場合:
- NotesアプリやMessagesアプリにURLを入力してタップ
- または、Safariで長押し → 「"Livme"で開く」を選択

## トラブルシューティング

### Universal Linksが動作しない場合

1. **apple-app-site-associationの確認**:
   ```bash
   curl -I https://livme.net/.well-known/apple-app-site-association
   ```
   - ステータスコードが200であること
   - Content-Typeが正しいこと

2. **Team IDの確認**:
   - `apple-app-site-association`のTEAMIDが正しいか確認

3. **Associated Domainsの確認**:
   - Xcodeの Signing & Capabilities で正しく設定されているか確認

4. **アプリの再インストール**:
   - iOSはアプリインストール時にapple-app-site-associationを取得します
   - 設定を変更した後は、アプリを再インストールしてください

5. **デバイスでテスト**:
   - シミュレーターではUniversal Linksが不安定な場合があります
   - 実機でテストすることをお勧めします

## 対応URL形式

### カスタムURLスキーム
- `livme://` → ホーム
- `livme://user_id` → ユーザープロフィール

### Universal Links
- `https://livme.net/` → ホーム
- `https://livme.net/user_id` → ユーザープロフィール

## 参考資料

- [Apple - Universal Links](https://developer.apple.com/ios/universal-links/)
- [Capacitor - Deep Links](https://capacitorjs.com/docs/guides/deep-links)
