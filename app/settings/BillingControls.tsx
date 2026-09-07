"use client";
import { useState } from "react";
export default function BillingControls({ enabled }: { enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function open(action: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await response.json();
      if (!response.ok || !data.url) { setNotice(data.error ?? "現在利用できません。"); return; }
      const url = new URL(data.url);
      if (url.protocol !== "https:" || !["checkout.stripe.com", "billing.stripe.com"].includes(url.hostname)) throw new Error();
      window.location.assign(url.href);
    } catch { setNotice("契約画面を開けませんでした。再度お試しください。"); }
    finally { setBusy(false); }
  }
  return <><p><button disabled={!enabled || busy} onClick={() => void open("checkout")}>料金を確認して申し込む</button>{" "}<button disabled={!enabled || busy} onClick={() => void open("portal")}>契約・支払い・解約を管理</button></p><p role="status">{notice}</p></>;
}
