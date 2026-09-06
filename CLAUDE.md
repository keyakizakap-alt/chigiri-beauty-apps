@AGENTS.md

## 方針の正本

このリポジトリの進め方と設計判断は、2 つのスキルに集約してある。
複製せず参照する（複製すると更新時に内容がずれるため）。

- **`work-directives`** — 作業の進め方、確認を取る操作、成果物の禁則、リサーチの裏取り
- **`ai-product-playbook`** — LLM の境界、API の防御、出荷と品質ゲート

正本: [keyakizakap-alt/dxworkrepository](https://github.com/keyakizakap-alt/dxworkrepository) の
`.claude/skills/`（全プロジェクトで自動ロードさせる手順は同リポジトリの `README.md`）。

**作業を始める前に `work-directives`、設計を変える前に `ai-product-playbook` を読むこと。**

## このリポジトリで壊してはいけないもの

- **所有者スコープ**：相談履歴・コンディション・画像は、匿名 Cookie または検証済み Google
  メールのハッシュで分離する。画像は DB で所有権を確認してから private Blob を配信する。
- **商品情報は公式確認済みデータに限定**。LLM には候補 ID しか渡さず、候補外の商品情報を
  生成させない。口コミ本文は転載しない。
- **AI 障害時もフォールバックで会話が続く**（`server/orca.ts` → ローカル応答）。
  初期聞き取りと安全停止は固定ルールで返す。
- 秘密値は Vercel の Environment Variables。`NEXT_PUBLIC_` を付けない。
- DB スキーマ変更は追加的・後方互換を原則とする。

`AGENTS.md` は `next dev` が再生成するため、その BEGIN/END マーカーの中身は編集しない。