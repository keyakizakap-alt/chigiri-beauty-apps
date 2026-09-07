import { billingConfigured, legalLinks } from "@/server/billing";
import BillingControls from "./BillingControls";
import Link from "next/link";
import { getAccountUser } from "@/server/account-auth";
import DataControls from "./DataControls";

export const dynamic = "force-dynamic";
export default async function Settings() {
  const user = await getAccountUser();
  const links = legalLinks();
  return <main className="settings-page">
    <Link href="/">← 相談に戻る</Link>
    <h1>データ管理</h1>
    <p>{user ? `${user.displayName}さんのアカウント` : "このブラウザのゲストデータ"}を管理します。</p>
    <section><h2>データの書き出し</h2><p>サーバーに保存した相談履歴・コンディション・画像の一覧をJSONで保存できます。画像本体は含まれず、画像リンクは同じアカウントでのみ開けます。</p><a href="/api/account/data" download>データをダウンロード</a></section>
    <section><h2>有料プラン</h2><p>有料プランでは、相談の送信上限が1日100回から500回になります（UTC日付でリセット）。短時間の連続送信制限やサービス全体の混雑制限は引き続き適用されます。金額・更新周期は決済画面で確認できます。</p><p>{billingConfigured() ? "契約は自動更新です。支払い方法・解約は契約管理画面で変更できます。" : "現在、有料プランの販売準備中です。"}</p>{!user ? <a href="/login?returnTo=/settings">Googleでログイン</a> : null}<BillingControls enabled={Boolean(user) && billingConfigured()} /><p>{links.terms ? <a href={links.terms}>利用規約</a> : null}{"　"}{links.privacy ? <a href={links.privacy}>プライバシーポリシー</a> : null}{"　"}{links.commerce ? <a href={links.commerce}>特定商取引法に基づく表記</a> : null}</p></section>
    <DataControls storageId={user?.subject ?? "guest"} />
    <section><h2>相談内容の取り扱い</h2><p>詳しいAI相談では、入力内容、直近の会話、選択した画像、手持ち商品、コンディションをOrcaRouter経由でAIモデルへ送信します。相談履歴とコンディションはデータベース、画像は非公開の画像ストレージへ保存します。</p><p>氏名・住所・連絡先など、相談に不要な個人情報は入力しないでください。AIの案内は美容情報の整理を目的としており、診断や治療を行うものではありません。</p></section>
  </main>;
}
