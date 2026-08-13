# ChatGPT Sites（D1/R2）からVercelへのデータ移行

## 重要事項

このリポジトリに含まれるのは、UI・API・DBスキーマ・公式商品データです。ChatGPT Sites の本番D1に保存された相談履歴や、R2に保存された利用者画像そのものはソース管理外であり、自動的にはGitHubへ複製されません。

## D1 → Turso

スキーマはSQLite互換のため、D1のSQL exportをTursoへ投入できます。

1. 移行中の書き込みを止めるか、短いメンテナンス時間を設ける。
2. Cloudflare側で対象D1をSQL exportする。
3. exportに秘密情報が含まれない安全な作業端末でバックアップを暗号化保管する。
4. Tursoの空DBへSQLを投入する。
5. テーブル件数を比較し、匿名所有者・ログイン所有者ごとにサンプルを照合する。
6. Vercelの `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を切り替える。

例:

```bash
wrangler d1 export <D1_DATABASE_NAME_OR_ID> --remote --output chigiri-d1.sql
turso db shell <TURSO_DATABASE_NAME> < chigiri-d1.sql
```

本番データをGitHub、Issue、CI artifact、チャットへ添付しないでください。

## R2 → private Vercel Blob

1. `uploaded_assets.object_key` に対応するR2オブジェクトを所有者情報付きで列挙する。
2. private Blobへ同じpathnameでアップロードする。
3. Blob取得結果とDBメタデータを照合する。
4. 相談ログ内の旧 `/api/uploads?key=...` 参照を、必要に応じて新しい `id` 参照へ変換する。
5. 全相談から画像を開けることを確認するまでR2を削除しない。

## 受け入れ確認

| 項目 | 合格条件 |
| --- | --- |
| chat_sessions | Sites側とTurso側の件数が一致 |
| deleted_chat_sessions | tombstone件数が一致し、削除済み相談が復活しない |
| beauty_check_ins | 所有者ごとの件数と最新日時が一致 |
| uploaded_assets | DB件数、Blob件数、サンプル画像の取得が一致 |
| Googleログイン | 匿名履歴をログイン所有者へ移行できる |

移行が完了するまで旧D1/R2は読み取り可能な状態で保持し、Vercelの本番確認後に廃止判断を行います。
