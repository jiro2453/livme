# Claude Code セッション セットアップガイド

このガイドは、新しいClaude Codeセッションを開始する際に「Claude Code execution failed」エラーを防ぐための手順です。

## 🚀 新しいセッションの開始方法（推奨）

### 方法1：GitHubから直接開始（最も確実）

1. ブラウザで https://github.com/jiro2453/livme にアクセス
2. リポジトリページで「Code」ボタンをクリック
3. 「Open with Claude Code」を選択
4. 新しいセッションが開始されたら、下記の「環境確認手順」を実行

### 方法2：Claude Codeアプリから開始

1. Claude Codeアプリを開く
2. 新しいセッションを開始
3. **最初に必ず以下を依頼：**

```
GitHubのjiro2453/livmeリポジトリで作業してください。
まず以下を確認してください：
1. pwd コマンドで現在のディレクトリを確認
2. git status でリポジトリの状態を確認
3. ls -la で package.json ファイルが存在するか確認
```

## ✅ 環境確認手順（全ての新しいセッションで実行）

新しいセッションを開始したら、**必ず最初に**以下を依頼してください：

```
環境をセットアップしてください：

1. 現在のディレクトリを確認（pwd）
2. package.jsonがあることを確認（ls package.json）
3. npm install を実行
4. npm run build を実行して、ビルドが成功することを確認

すべて成功したら準備完了と報告してください。
```

## 🔍 エラーが出た時の対処法

### エラー：「Claude Code execution failed」

**原因1：間違ったディレクトリにいる**

依頼内容：
```
pwd コマンドを実行してください。
/home/user/livme にいない場合は、cd /home/user/livme を実行してください。
```

**原因2：node_modulesがない**

依頼内容：
```
ls -la node_modules を実行してください。
存在しない場合は npm install を実行してください。
```

**原因3：package.jsonがない**

依頼内容：
```
git clone https://github.com/jiro2453/livme.git を実行してください。
その後、cd livme を実行してください。
```

### エラー：「npm installを実行してください」自体が失敗する

**これが起きた場合、そのセッションに根本的な問題があります。**

**対処法：**
1. そのセッションを閉じる
2. 上記の「新しいセッションの開始方法（推奨）」に従って、新しいセッションを開始
3. 環境確認手順を最初に実行

## 📋 作業開始前のチェックリスト

新しいセッションで作業を開始する前に、以下を確認：

- [ ] 正しいディレクトリにいる（/home/user/livme）
- [ ] package.jsonファイルが存在する
- [ ] node_modulesディレクトリが存在する
- [ ] `npm run build` が成功する
- [ ] TypeScriptエラーがない（`tsc --noEmit` が成功する）

## 🎯 パターンA：Claude Codeに全て任せる方式

**あなたのPCにlivmeフォルダは不要です。**

すべての作業はClaude Codeがリモートサーバー（/home/user/livme）で行います。

### 作業の流れ

1. **依頼する**（このガイドの手順に従ってセッションをセットアップ後）
   ```
   [やりたいこと]をお願いします。
   ```

2. **Claude Codeが作業**
   - コードを編集
   - テスト実行
   - GitHubにプッシュ

3. **結果を確認**
   - Netlify: https://app.netlify.com/
   - GitHub: https://github.com/jiro2453/livme

## 🚨 よくある間違い

### ❌ やってはいけないこと

1. **「ローカルでnpm installを実行して」と言う**
   - Claude Codeはリモートで作業するので、「ローカル」という言葉は混乱を招きます
   - 正しくは：「npm installを実行してください」

2. **WindowsのパスC:\...を指定する**
   - Claude CodeはLinuxサーバーで動作
   - パスは常に `/home/user/livme` です

3. **複数のセッションで同時に同じファイルを編集**
   - Gitコンフリクトが発生する可能性があります
   - 1つのセッションで作業を完結させましょう

## 📞 それでも問題が解決しない場合

以下の情報を収集してください：

```
以下を実行して結果を教えてください：
1. pwd
2. ls -la
3. git status
4. node --version
5. npm --version
```

この情報があれば、問題を特定できます。

## 🔗 関連ドキュメント

- [README.md](../README.md) - プロジェクト全体のドキュメント
- [Netlifyデプロイガイド](../README.md#デプロイ) - デプロイ方法の詳細
