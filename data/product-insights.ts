import type { ProductCategory, VerifiedProduct } from "./official-products";

export type IngredientNote = {
  name: string;
  role: string;
};

export type ProductInsight = {
  ingredientNotes: IngredientNote[];
  ingredientIntro: string;
  checkPoints: string[];
  firstCheck: string;
  nextCheck: string;
  timingNote: string;
};

const categoryChecks: Record<ProductCategory, string[]> = {
  cleanser: ["洗顔直後のつっぱりや赤み", "すすいだ後のぬるつき", "使い始めた時期と不調の重なり"],
  lotion: ["塗った直後の刺激感", "時間がたった後の乾燥・ベタつき", "香りやエタノールを含む製品との重ね使い"],
  serum: ["塗った直後の刺激感", "同時に使い始めた美容液や角質ケア", "使用頻度を下げたときの変化"],
  moisturizer: ["塗った後のムレ・ベタつき", "乾燥する部分と皮脂が出る部分の違い", "朝と夜で量を変えたときの使用感"],
  sunscreen: ["目まわりのしみやすさ", "乾燥・きしみ・白浮き", "落とし方との組み合わせ"],
  hair_shampoo: ["洗った直後の頭皮のつっぱり・かゆみ", "翌日のベタつき", "洗浄料の量とすすぎ時間"],
  hair_treatment: ["毛先の重さ・乾きにくさ", "頭皮についたときの違和感", "乾かした直後と翌朝のまとまり"],
  scalp_care: ["塗布直後の刺激や清涼感", "フケ・かゆみが出るタイミング", "カラーや整髪料を使った日との重なり"],
  body_moisturizer: ["塗布後のベタつき・かゆみ", "衣類が触れる部位との違い", "入浴後すぐ塗った場合の使用感"],
  body_uv: ["乾燥・きしみ・白残り", "汗をかいた後の刺激感", "落とし方と塗り直しの負担"],
  makeup_base: ["時間がたった後の乾燥・テカリ", "ファンデーションとの相性", "落とした後の違和感"],
  face_powder: ["粉っぽさ・乾燥", "皮脂が出る部分との仕上がり差", "ブラシやパフの清潔さ"],
  lip_color: ["唇の乾燥・皮むけ", "香りや清涼感", "食事後と塗り直し後の状態"],
  nail_oil: ["爪まわりの刺激・赤み", "香りの強さ", "塗った後の作業のしにくさ"],
  nail_color: ["爪表面の乾燥・変色", "除光液を使う頻度", "塗布中のにおいや刺激"],
  hand_cream: ["手洗い後の刺激感", "ベタつきと保湿感のバランス", "指先・手の甲での使用感の違い"],
  cuticle_care: ["甘皮まわりの刺激・赤み", "使用量とこする強さ", "ささくれや傷がある状態で使っていないか"],
};

const observationWindows: Record<ProductCategory, Pick<ProductInsight, "firstCheck" | "nextCheck" | "timingNote">> = {
  cleanser: { firstCheck: "当日〜3日", nextCheck: "1〜2週間", timingNote: "洗い上がりはすぐ、乾燥やベタつきとの相性は朝晩の使用を続けて確認します。" },
  lotion: { firstCheck: "当日〜7日", nextCheck: "2〜4週間", timingNote: "うるおい感は早めに、毎日のケアとの相性は肌状態が安定した期間で見ます。" },
  serum: { firstCheck: "1〜2週間", nextCheck: "4〜8週間", timingNote: "使用感と刺激の有無を先に確認し、見た目の変化は急いで判断しません。" },
  moisturizer: { firstCheck: "当日〜7日", nextCheck: "2〜4週間", timingNote: "塗った後の快適さは当日、乾燥しやすい時間帯の変化は数週間で振り返ります。" },
  sunscreen: { firstCheck: "初回〜7日", nextCheck: "2週間", timingNote: "仕上がり・落としやすさ・塗り直しやすさを日常の外出で確認します。" },
  hair_shampoo: { firstCheck: "初回〜7日", nextCheck: "2〜4週間", timingNote: "洗い上がりと翌日の頭皮・髪の状態を分けて見ます。" },
  hair_treatment: { firstCheck: "初回〜3日", nextCheck: "2〜4週間", timingNote: "手触りは早く分かりますが、熱や湿気がある日のまとまりも含めて判断します。" },
  scalp_care: { firstCheck: "3〜7日", nextCheck: "2〜4週間", timingNote: "刺激や違和感を先に確認し、頭皮の快適さは生活リズムと合わせて見ます。" },
  body_moisturizer: { firstCheck: "当日〜7日", nextCheck: "2〜4週間", timingNote: "入浴後の快適さは早めに、粉ふきやざらつきは部位ごとに数週間で確認します。" },
  body_uv: { firstCheck: "初回〜7日", nextCheck: "2週間", timingNote: "塗りやすさ・汗との相性・落としやすさを外出日に確認します。" },
  makeup_base: { firstCheck: "初回", nextCheck: "3〜7回の使用", timingNote: "仕上がりは当日、天気や一緒に使うベースメイクを変えて再現性を見ます。" },
  face_powder: { firstCheck: "初回", nextCheck: "3〜7回の使用", timingNote: "塗布直後と夕方の仕上がりを比べ、肌状態が違う日も確認します。" },
  lip_color: { firstCheck: "初回", nextCheck: "3〜7回の使用", timingNote: "色・乾燥・落ち方を、食事の有無も含めて確認します。" },
  nail_oil: { firstCheck: "当日〜7日", nextCheck: "4〜8週間", timingNote: "塗った直後の柔らかさと、爪が伸びる間の欠けやすさを分けて見ます。" },
  nail_color: { firstCheck: "初回〜7日", nextCheck: "2〜3回の付け替え", timingNote: "発色と持ちは初回、爪への負担は落とす工程まで含めて確認します。" },
  hand_cream: { firstCheck: "当日〜7日", nextCheck: "2〜4週間", timingNote: "手洗い後の快適さは早めに、乾燥や荒れやすさは生活の中で振り返ります。" },
  cuticle_care: { firstCheck: "当日〜7日", nextCheck: "2〜4週間", timingNote: "甘皮まわりの柔らかさと刺激の有無を先に確認し、無理に処理しません。" },
};

const nailCategories = new Set<ProductCategory>(["nail_oil", "nail_color", "cuticle_care"]);

function ingredientRole(ingredient: string, category: ProductCategory) {
  // 医薬部外品の効能は、成分名だけで広げず商品ページの表示範囲に限定する。
  if (/グリチルリチン酸2K/.test(ingredient)) return "医薬部外品では、肌荒れを防ぐ目的で用いられる有効成分です。実際の効能は、この商品の公式表示を確認してください。";
  if (/グリチルレチン酸ステアリル|消炎剤/.test(ingredient)) return "医薬部外品では、肌荒れを防ぐ目的で用いられる消炎有効成分です。刺激や赤みが続くときは使用を中止します。";
  if (/トラネキサム酸/.test(ingredient)) return "医薬部外品では、メラニンの生成を抑えてシミ・そばかすを防ぐ目的などで用いられる有効成分です。承認された効能は商品ごとに確認します。";
  if (/ナイアシンアミド.*有効成分/.test(ingredient)) return "医薬部外品で有効成分として配合される場合があります。美白・シワ改善などの承認効能は商品ごとに異なるため、公式表示で確認します。";
  if (/安定型ビタミンC.*有効成分/.test(ingredient)) return "医薬部外品では、メラニンの生成を抑えシミ・そばかすを防ぐ目的で用いられることがある有効成分です。公式の効能表示を優先します。";
  if (/有効成分/.test(ingredient)) return "医薬部外品として効能が表示された成分です。ここでは成分名が特定できないため、個別の役割は公式の商品情報で確認します。";

  if (/アベンヌ温泉水/.test(ingredient)) return "アベンヌの製品のベースに使われる温泉水です。ブランドではミネラルを含む水として紹介され、肌をすこやかに整える処方の土台になります。";
  if (/ヒアルロン酸発酵液|乳酸球菌/.test(ingredient)) return "乳酸菌由来の発酵液とヒアルロン酸に着目した保湿成分です。角層にうるおいを与え、化粧水のみずみずしい使用感にも関わります。";
  if (/ヒアルロン/.test(ingredient)) return "水分を抱え込む性質を利用した保湿成分です。種類や分子の大きさは、うるおい感や使用感を調整するための設計要素になります。";
  if (/セラミド機能成分/.test(ingredient)) return "角層のうるおいに着目した、メーカー独自の保湿成分です。乾燥しやすい肌のうるおいを補う目的で、シリーズに配合されています。";
  if (/セラミド/.test(ingredient)) return "角層のうるおいを保つ働きに着目した保湿成分です。乾燥によるカサつきを防ぎ、なめらかな使用感を支える目的で配合されます。";
  if (/コラーゲン|コラジェネシス/.test(ingredient)) return "肌表面にうるおいを与え、なめらかに整える目的で配合される保湿成分です。ハリ感は使用感を含む化粧品上の表現として確認します。";
  if (/アミノ酸/.test(ingredient)) return "角層のうるおいに関わる成分群に着目した保湿成分です。洗浄料の場合は、洗い上がりのやさしさを考えた洗浄設計にも使われます。";
  if (/グリセリン|エクトイン|パンテノール|PCA亜鉛/.test(ingredient)) return "水分を保ち、肌をすこやかに整える目的で配合される保湿・整肌成分です。使用感は濃度や処方全体によって変わります。";
  if (/スクワラン|シア|ホホバ|ダイズ油|植物.*オイル|美容保湿オイル|オイル/.test(ingredient)) return "肌表面をやわらかく整え、水分が逃げにくい状態を支えるエモリエント成分です。乾燥部位の保護や、のびのよい使用感に関わります。";
  if (/コレステロール/.test(ingredient)) return "角層のうるおいに着目した保湿成分です。油分や保湿成分と組み合わせて、乾燥しやすい肌をなめらかに整える目的で使われます。";

  if (/ココイルグリシンNa|アミノ酸系洗浄|うるおいキープ洗浄|弱酸性pH/.test(ingredient)) return "皮脂や汚れを落としながら、洗い上がりのつっぱり感に配慮するための洗浄設計です。洗浄力は単一成分ではなく処方全体で決まります。";
  if (/酸化亜鉛|酸化チタン/.test(ingredient)) return "紫外線を防ぐ目的で使われる無機系の紫外線散乱剤です。紫外線防御の程度は、必ずこの商品のSPF・PA表示で確認します。";
  if (/シリカ/.test(ingredient)) return "余分な皮脂を吸着し、さらっとした質感や毛穴をぼかしたように見せる仕上がりを支える粉体です。乾燥しやすい部位では量を調整します。";
  if (/天然ミネラル/.test(ingredient)) return "肌や髪をなめらかに見せるためのミネラル由来の処方要素です。具体的な成分名は公式の全成分表示で確認します。";
  if (/ツボクサ|ドクダミ|アロエ|モモ|プロポリス|ハチミツ|ユーカリ|植物/.test(ingredient)) return "植物由来の保湿・整肌成分として公式に訴求されています。植物由来でも肌との相性には個人差があるため、違和感があれば使用を止めます。";
  if (/ガラクトミセス|ビフィズス|米ぬか発酵|発酵|培養/.test(ingredient)) return "発酵由来の保湿・整肌成分です。なめらかさやうるおい感を与える目的で配合され、使用感は処方全体によって決まります。";
  if (/PDRN|カタツムリ|グルタチオン|ビタミン/.test(ingredient)) return "メーカーが保湿・整肌を目的に訴求している成分です。配合量や感じ方には個人差があるため、成分名だけで変化を約束するものではありません。";
  if (/補修成分/.test(ingredient)) return "髪の手触りやまとまりを整える目的で、メーカーが補修成分として訴求している処方要素です。乾かした直後だけでなく翌朝の状態も確認します。";
  if (/色持ち|酸素透過|ナイト美容カプセル/.test(ingredient)) return "成分そのものというより、仕上がり・持続性・使用感を支えるメーカー独自の処方技術です。実感は使う量や重ねるアイテムでも変わります。";
  if (/保湿|美容液|うるおい|美肌サンエッセンス/.test(ingredient)) return "メーカーが保湿・整肌目的として示している成分または処方の呼び名です。内訳や配合量は、公式の商品情報・全成分表示で確認できます。";

  const byCategory: Partial<Record<ProductCategory, string>> = {
    cleanser: "洗浄と洗い上がりのバランスに関わる処方要素です。肌状態に合わせて、つっぱり感やすすぎ後の感触を確認します。",
    hair_shampoo: "頭皮と髪の洗い上がりに関わる処方要素です。洗浄感だけでなく、翌日の頭皮や髪の状態も見ます。",
    hair_treatment: "髪の手触りやまとまりを整えるための処方要素です。乾かした直後と翌朝の違いを確認します。",
    scalp_care: "頭皮をすこやかに整えるための処方要素です。刺激感やかゆみがないかを優先して確認します。",
    makeup_base: "ベースメイクののび・密着感・仕上がりに関わる処方要素です。乾燥やテカリは時間帯で比べてみます。",
    face_powder: "さらっとした質感や仕上がりの持続に関わる処方要素です。粉っぽさや乾燥を感じるときは量を調整します。",
    lip_color: "色・ツヤ・密着感を支える処方要素です。乾燥や皮むけが出ないかを確認しながら使います。",
  };
  return byCategory[category] ?? "この商品の特徴を支える処方要素です。配合量や組み合わせで使用感が変わるため、肌・髪の状態を見ながら確認します。";
}

export function productInsight(product: VerifiedProduct): ProductInsight {
  return {
    ingredientNotes: product.ingredientHighlights.map((name) => ({ name, role: ingredientRole(name, product.category) })),
    ingredientIntro: nailCategories.has(product.category)
      ? "ネイル製品は、色・ツヤ・密着感などの仕上がりに関わる表示を中心に確認しています。"
      : "公式ページで注目されている成分・処方を、化粧品としての一般的な役割とあわせて紹介します。",
    checkPoints: categoryChecks[product.category],
    ...observationWindows[product.category],
  };
}

export function productDifference(base: VerifiedProduct, candidate: VerifiedProduct) {
  const sameCategory = base.category === candidate.category;
  const priceDifference = base.price != null && candidate.price != null
    ? candidate.price - base.price
    : null;
  return {
    sameCategory,
    summary: sameCategory
      ? `${base.name}と同じ種類のアイテムとして、公式説明と注目成分の違いを比べています。`
      : `${base.name}とは役割が異なるため、置き換えではなく追加する必要があるかを比べます。`,
    priceDifference,
  };
}
