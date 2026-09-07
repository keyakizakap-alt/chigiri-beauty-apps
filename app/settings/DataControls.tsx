"use client";
import { useState } from "react";
export default function DataControls({ storageId }: { storageId: string }) {
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function clear() {
    if (!confirmed || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/account/data", { method: "DELETE", headers: { "X-Chigiri-Confirm": "delete-consultations" } });
      if (!response.ok) throw new Error();
      for (const prefix of ["chigiri-consultation-cache-v2:", "chigiri-consultation-outbox-v2:"]) localStorage.removeItem(prefix + storageId);
      setNotice("保存済みの相談履歴を削除しました。画像とコンディションの記録は残っています。");
      setConfirmed(false);
    } catch { setNotice("処理を完了できませんでした。時間をおいて再度お試しください。"); }
    finally { setBusy(false); }
  }
  return <section><h2>相談履歴の一括削除</h2><p>保存済みの相談本文を削除します。画像・コンディションは対象外です。他のタブで相談中の場合は、先に閉じてください。この操作は取り消せません。</p><label><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />相談履歴を削除することを確認しました</label><p><button disabled={!confirmed || busy} onClick={() => void clear()}>{busy ? "削除中…" : "相談履歴を削除"}</button></p><p role="status">{notice}</p></section>;
}
