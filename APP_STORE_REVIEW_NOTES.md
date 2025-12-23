# App Store 審査に関する注記（Review Notes）

App Store Connectの「審査に関する注記」欄に以下の内容を記載してください。

---

## 日本語版

Apple審査チーム御中

ご指摘いただいた3点について対応が完了いたしましたので、ご報告申し上げます。

### 1. Guideline 2.1 - アプリクラッシュ（カメラアクセス時）

**対応内容：**
Info.plistにカメラおよびフォトライブラリのアクセス許可説明を追加しました。

- NSCameraUsageDescription: 「プロフィール画像を撮影するためにカメラへのアクセスが必要です」
- NSPhotoLibraryUsageDescription: 「プロフィール画像を選択するためにフォトライブラリへのアクセスが必要です」
- NSPhotoLibraryAddUsageDescription: 「プロフィール画像を保存するためにフォトライブラリへのアクセスが必要です」

**動作確認：**
プロフィール画面 → 「プロフィール画像を変更」→「画像をアップロード」→「Take Photo」を選択してもクラッシュしないことを確認済みです。

### 2. Guideline 1.2 - ユーザー生成コンテンツのモデレーション

**対応内容：**
ユーザー通報機能とブロック機能を実装しました。

**通報機能：**
- 他のユーザーのプロフィール画面にて、フォローボタンの横の「︙」（3点メニュー）から「通報」を選択できます
- 通報理由（スパム、不適切な内容、ハラスメント、その他）を選択可能
- 通報内容はデータベースに保存され、運営者が確認・対応します

**ブロック機能：**
- 他のユーザーのプロフィール画面にて、フォローボタンの横の「︙」（3点メニュー）から「ブロック」を選択できます
- ブロックしたユーザーは以下から即座に非表示になります：
  - ホーム画面のライブリスト
  - 参加者リスト
  - フォロワー/フォロイングリスト
  - ユーザー検索結果
- ブロックはいつでも解除可能です

**データベース構造：**
- reportsテーブル：通報情報を記録
- blocksテーブル：ブロック情報を記録
- Row Level Security（RLS）により、ユーザーは自身のデータのみアクセス可能

**モデレーション体制：**
- 通報があった場合、24時間以内に確認・対応します
- 不適切なコンテンツは速やかに削除します
- 利用規約に違反するユーザーにはアカウント停止などの措置を取ります

### 3. Guideline 5.1.2 - App Tracking Transparency

**対応内容：**
このアプリはユーザーのトラッキングを一切行っておりません。

**技術的詳細：**
- サードパーティの広告SDKやトラッキングツールは使用していません
- 分析ツール（Google Analytics、Firebase Analyticsなど）も使用していません
- ユーザーデータは自社のSupabaseデータベースにのみ保存され、第三者と共有することはありません
- アプリの機能：
  - ライブイベント情報の管理
  - ユーザー間のフォロー機能
  - プロフィール管理
  - イベント参加者の確認

**クッキーについて：**
アプリ内でアクセス可能なWebコンテンツは、アプリ自体の機能（プライバシーポリシー、利用規約の表示）のみであり、トラッキング目的のクッキーは使用していません。

**プライバシーポリシー：**
プライバシーポリシーにもトラッキングを行わないことを明記しております。

---

## テスト手順

審査時に以下の手順で機能をご確認いただけます：

### カメラアクセスのテスト：
1. アプリにログイン
2. 右上のアバターをタップしてプロフィール画面を開く
3. 「プロフィール画像を変更」をタップ
4. 「画像をアップロード」をタップ
5. 「Take Photo」をタップ
6. カメラ権限のダイアログが表示され、許可後にカメラが起動（クラッシュしない）

### 通報機能のテスト：
1. ホーム画面でライブイベントの参加者アイコンをタップ
2. 参加者リストから他のユーザーをタップ
3. フォローボタンの横の「︙」（3点メニュー）をタップ
4. 「通報」をタップ
5. 通報理由を選択し、「通報する」をタップ

### ブロック機能のテスト：
1. ホーム画面でライブイベントの参加者アイコンをタップ
2. 参加者リストから他のユーザーをタップ
3. フォローボタンの横の「︙」（3点メニュー）をタップ
4. 「ブロック」をタップ
5. 確認ダイアログで「ブロック」を選択
6. ブロックしたユーザーがリストから消えることを確認

---

何卒よろしくお願い申し上げます。

---

## English Version

Dear Apple Review Team,

We have completed the implementation of all requested changes regarding the three issues you identified. Please find the details below.

### 1. Guideline 2.1 - App Crash (Camera Access)

**Resolution:**
Added camera and photo library access permission descriptions to Info.plist:

- NSCameraUsageDescription: "Camera access is required to take profile pictures"
- NSPhotoLibraryUsageDescription: "Photo library access is required to select profile pictures"
- NSPhotoLibraryAddUsageDescription: "Photo library access is required to save profile pictures"

**Verification:**
The app no longer crashes when accessing the camera: Profile → "Change Profile Picture" → "Upload Image" → "Take Photo"

### 2. Guideline 1.2 - User-Generated Content Moderation

**Resolution:**
Implemented user reporting and blocking features.

**Report Feature:**
- Users can report other users from their profile screen via the "⋮" (three-dot menu) next to the Follow button
- Report reasons: Spam, Inappropriate Content, Harassment, Other
- Reports are stored in the database for review and action by administrators

**Block Feature:**
- Users can block other users from their profile screen via the "⋮" (three-dot menu) next to the Follow button
- Blocked users are immediately hidden from:
  - Home screen live list
  - Attendees list
  - Followers/Following list
  - User search results
- Users can unblock at any time

**Database Structure:**
- reports table: Stores report information
- blocks table: Stores block information
- Row Level Security (RLS) ensures users can only access their own data

**Moderation System:**
- Reports are reviewed and addressed within 24 hours
- Inappropriate content is promptly removed
- Users violating Terms of Service may face account suspension

### 3. Guideline 5.1.2 - App Tracking Transparency

**Resolution:**
This app does not track users in any way.

**Technical Details:**
- No third-party advertising SDKs or tracking tools are used
- No analytics tools (Google Analytics, Firebase Analytics, etc.) are used
- User data is stored only in our own Supabase database and is never shared with third parties
- App functionality:
  - Live event information management
  - User follow functionality
  - Profile management
  - Event attendee verification

**About Cookies:**
Web content accessible within the app is limited to the app's own features (Privacy Policy, Terms of Service display) and does not use cookies for tracking purposes.

**Privacy Policy:**
Our Privacy Policy clearly states that we do not track users.

---

## Testing Instructions

You can verify the features using the following steps:

### Camera Access Test:
1. Log in to the app
2. Tap the avatar in the top right to open the profile screen
3. Tap "Change Profile Picture"
4. Tap "Upload Image"
5. Tap "Take Photo"
6. Camera permission dialog appears, and camera launches after permission is granted (no crash)

### Report Feature Test:
1. From the home screen, tap an attendee icon on a live event
2. Tap another user from the attendees list
3. Tap "⋮" (three-dot menu) next to the Follow button
4. Tap "Report"
5. Select a reason and tap "Submit Report"

### Block Feature Test:
1. From the home screen, tap an attendee icon on a live event
2. Tap another user from the attendees list
3. Tap "⋮" (three-dot menu) next to the Follow button
4. Tap "Block"
5. Confirm by tapping "Block" in the confirmation dialog
6. Verify the blocked user disappears from the list

---

Thank you for your review.
