# CHIGIRI Beauty Architecture

## リクエストフロー

1. ブラウザが相談文、担当者、直近履歴、構造化メモリを `/api/chat` へ送信する。
2. API境界で入力長、担当者、履歴件数、画像の所有権を検証する。
3. 会話エンジンが確認済み条件、質問済み項目、提案段階、安全停止条件を決定する。
4. 初期聞き取りと安全停止は固定ルールで返す。
5. 提案段階だけOrcaRouterへ必要最小限の文脈と公式確認済み候補を渡す。
6. OrcaRouterが未設定・失敗・空応答の場合はローカル応答へフォールバックする。
7. 相談履歴とコンディションはTursoへ、所有者画像はprivate Vercel Blobへ保存する。

## コンポーネント

| コンポーネント | 責務 |
| --- | --- |
| `components/ChigiriApp.tsx` | UI、端末内キャッシュ、相談・履歴・画像操作 |
| `app/api/chat` | 入力検証、所有画像の取得、会話エンジン呼び出し |
| `server/chat-engine.ts` | 会話フェーズ、安全停止、質問済み条件の決定 |
| `server/orca.ts` | OrcaRouter呼び出しとフォールバック |
| `app/api/consultations` | 所有者スコープの相談履歴CRUD |
| `app/api/check-ins` | コンディションCRUD |
| `app/api/uploads` | private Blobのアップロード・認可付き配信・削除 |
| `server/account-auth.ts` | Google ID token検証、署名セッション |
| `db/index.ts` | libSQL接続と冪等な初期スキーマ作成 |

## Trust boundary

| Boundary | Control |
| --- | --- |
| Browser → API | 種別・長さ・件数・許可値を検証 |
| Image ID → Blob | DBで現在利用者の所有権を確認後、private Blobを配信 |
| App → LLM | APIキーはサーバー環境変数、公式商品候補だけを渡す |
| LLM → User | 医療診断・効果保証・未確認商品情報を禁止 |
| App → Turso | 匿名Cookieまたは検証済みGoogleメールのハッシュで所有者を分離 |

## トレードオフ

| 観点 | 採用構成 | トレードオフ |
| --- | --- | --- |
| コスト | Turso + Blobの従量／無料枠を活用 | 利用量増加時は両サービスの課金監視が必要 |
| 可用性 | AI障害時もルールベースで会話可能 | DBまたはBlob障害時は履歴・画像機能が制限される |
| 運用負荷 | SQLite互換でD1から移行しやすい | Vercel、Turso、Blobの3サービスを管理 |
| セキュリティ | private Blob + 所有者照合 | 署名秘密鍵・DB・Blob tokenのローテーションが必要 |

## ロールバック

- Vercelの直前正常DeploymentへRollbackする。
- DBスキーマ変更は追加的・後方互換を原則とし、破壊的変更は別マイグレーションとバックアップを用意する。
- 障害トリガーは本番ビルド失敗、主要APIの継続的5xx、ログイン不能、履歴の読書き不能。
