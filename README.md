# CHIGIRI Beauty

5人の美容コンシェルジュが、スキンケア・ヘア／頭皮・ボディ・メイク・ネイル／ハンドの相談を担当するAI美容アプリです。現行の ChatGPT Sites 版を、Vercel で動作する標準 Next.js App Router 構成へ移植しています。

## 主な機能

- 5領域に分かれた美容相談と、領域別の安全なローカルフォールバック
- OrcaRouter を使った自然文生成
- 公式確認済み商品データに限定した商品提案
- 端末匿名IDまたはGoogleログイン単位の相談履歴
- 天気・睡眠・任意メモを使うコンディション記録
- 所有者だけが取得できる非公開画像アップロード
- レスポンシブUI、相談履歴、商品詳細、楽天市場／@cosme確認導線

## Vercel向け構成

| 領域 | 実装 |
| --- | --- |
| Web / API | Next.js 16 App Router（Vercel Functions） |
| DB | Turso / libSQL + Drizzle ORM |
| 画像 | Vercel Blob（private） |
| AI | OrcaRouter。未設定・障害時はローカル応答 |
| ログイン | Google Identity Services + HttpOnly署名セッション |

Cloudflare 固有の Vinext、Worker、D1、R2 バインディングには依存しません。

## 必要な環境変数

| Key | 用途 | 必須範囲 |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | 相談履歴・コンディション・画像メタデータ | 本番の永続化 |
| `TURSO_AUTH_TOKEN` | Turso認証 | リモートTurso利用時 |
| `BLOB_READ_WRITE_TOKEN` | private Vercel Blob | 画像アップロード利用時 |
| `ORCAROUTER_API_KEY` | OrcaRouter会話生成 | AI生成利用時 |
| `ORCAROUTER_MODEL` | 利用モデル。既定 `orcarouter/auto` | 任意 |
| `GOOGLE_CLIENT_ID` | Googleログイン | ログイン利用時 |
| `AUTH_SECRET` | セッション署名（32文字以上） | ログイン利用時 |
| `RAKUTEN_APPLICATION_ID` | 楽天市場の評価取得 | 任意 |
| `RAKUTEN_ACCESS_KEY` | 楽天市場API認証 | 任意 |

秘密値は Vercel の Environment Variables に登録し、リポジトリへコミットしません。

## ローカル実行

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`TURSO_DATABASE_URL` が未設定のローカル環境では `local.db` を使用します。本番では未設定を許可せず、履歴APIは安全にエラーを返します。

## 品質確認

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

GitHub Actions でも同じ検証を実行します。

## Vercelデプロイ

1. VercelでこのGitHubリポジトリをImportします。
2. MarketplaceからTursoを接続し、private Vercel Blob storeを作成します。
3. `.env.example` の変数を Production / Preview に登録します。
4. Googleログインを使う場合は、Vercel本番URLを Authorized JavaScript origins に、`https://<host>/api/auth/google/callback` を Authorized redirect URIs に追加します。
5. main ブランチをProductionへデプロイします。

DBテーブルは初回アクセス時に `CREATE TABLE IF NOT EXISTS` で初期化されます。既存 ChatGPT Sites 版の利用者データを移す場合は [D1データ移行手順](docs/DATA_MIGRATION.md) を使用してください。

## 設計・運用資料

- [アーキテクチャ](docs/ARCHITECTURE.md)
- [既存D1/R2データの移行](docs/DATA_MIGRATION.md)
- [セキュリティ方針](SECURITY.md)
- [審査基準への対応](docs/JUDGING.md)
