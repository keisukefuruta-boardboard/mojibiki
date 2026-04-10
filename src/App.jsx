import React, { useState, useEffect, useRef } from "react";

// ひらがな文字札プール（頻度重み付き）
const POOL = [
  ...Array(9).fill("あ"),...Array(5).fill("い"),...Array(7).fill("う"),...Array(5).fill("え"),...Array(6).fill("お"),
  ...Array(6).fill("か"),...Array(4).fill("き"),...Array(5).fill("く"),...Array(4).fill("け"),...Array(5).fill("こ"),
  ...Array(5).fill("さ"),...Array(4).fill("し"),...Array(4).fill("す"),...Array(3).fill("せ"),...Array(4).fill("そ"),
  ...Array(6).fill("た"),...Array(4).fill("ち"),...Array(4).fill("つ"),...Array(4).fill("て"),...Array(6).fill("と"),
  ...Array(6).fill("な"),...Array(5).fill("に"),...Array(4).fill("ぬ"),...Array(3).fill("ね"),...Array(5).fill("の"),
  ...Array(5).fill("は"),...Array(3).fill("ひ"),...Array(3).fill("ふ"),...Array(2).fill("へ"),...Array(3).fill("ほ"),
  ...Array(5).fill("ま"),...Array(4).fill("み"),...Array(4).fill("む"),...Array(3).fill("め"),...Array(5).fill("も"),
  ...Array(5).fill("や"),...Array(4).fill("ゆ"),...Array(5).fill("よ"),
  ...Array(5).fill("ら"),...Array(5).fill("り"),...Array(5).fill("る"),...Array(4).fill("れ"),...Array(4).fill("ろ"),
  ...Array(5).fill("わ"),...Array(7).fill("ん"),
  ...Array(4).fill("が"),...Array(3).fill("ぎ"),...Array(4).fill("ぐ"),...Array(3).fill("げ"),...Array(4).fill("ご"),
  ...Array(4).fill("ざ"),...Array(3).fill("じ"),...Array(3).fill("ず"),...Array(2).fill("ぜ"),...Array(3).fill("ぞ"),
  ...Array(4).fill("だ"),...Array(3).fill("で"),...Array(4).fill("ど"),
  ...Array(4).fill("ば"),...Array(3).fill("び"),...Array(3).fill("ぶ"),...Array(3).fill("べ"),...Array(3).fill("ぼ"),
  ...Array(2).fill("ぱ"),...Array(1).fill("ぴ"),...Array(2).fill("ぷ"),...Array(1).fill("ぺ"),...Array(2).fill("ぽ"),
  ...Array(3).fill("っ"),...Array(2).fill("ょ"),...Array(2).fill("ゃ"),...Array(2).fill("ゅ"),
];

const TOTAL_ROUNDS = 5;
const HAND_SIZE = 15;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// お題のキーワードから「ベストアンサー」の文字を文字札に混ぜる
function dealHandForTheme(theme, keywords) {
  // キーワードの中からランダムに1つ選びベスト答えとして文字札に忍ばせる
  const themeWords = keywords[theme] || [];
  // 4〜6文字の単語を優先（ちょうどいい難易度）
  const candidates = themeWords.filter(w => {
    const len = [...w].length;
    return len >= 3 && len <= 6;
  });
  const bestWord = candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : themeWords[Math.floor(Math.random() * themeWords.length)] || "";

  const bestChars = [...bestWord];
  const remaining = HAND_SIZE - bestChars.length;

  // 残りはランダムプールから
  const randomChars = shuffle(POOL).slice(0, remaining + 10)
    // bestCharsと被りすぎないよう多少調整
    .slice(0, remaining);

  // 混ぜてシャッフル
  return shuffle([...bestChars, ...randomChars]);
}

// AI呼び出し：お題生成 + 判定
function pickTheme(usedThemes) {
  const themes = [
    "夏の思い出","冬の朝","怖いもの","美味しいもの","旅先で見た景色",
    "子供の頃の遊び","雨の日","夜の街","懐かしい場所","自然の中の生き物",
    "スポーツ","音楽","家族","仕事","恋愛","宇宙","海の中","山の上",
    "祭り","朝ごはん","夕焼け","秋の風景","春の花","友達","冒険",
  ];
  const available = themes.filter(t => !usedThemes.includes(t));
  const pool = available.length > 0 ? available : themes;
  return pool[Math.floor(Math.random() * pool.length)];
}

// お題と言葉のキーワードマッピング
const THEME_KEYWORDS = {
  "夏の思い出": ["うみ","すいか","はなび","かき","せみ","ひまわり","なつ","あさがお","そうめん","うちわ","かき","みずうみ","おまつり","ゆかた","せんこうはなび"],
  "冬の朝": ["ゆき","こおり","しも","さむさ","あさひ","はく","てぶくろ","こたつ","ゆきだるま","あられ","ふゆ","あさ","さむい"],
  "怖いもの": ["おばけ","くらやみ","かみなり","じしん","へび","くも","ゆうれい","まよなか","まじん","かいぶつ"],
  "美味しいもの": ["すし","らーめん","てんぷら","やきにく","すいーつ","けーき","おにぎり","たこやき","うどん","そば","さしみ","やきとり"],
  "旅先で見た景色": ["ふじさん","うみ","しぜん","やま","たき","こ","はら","しんりん","にじ","よあけ","ゆうひ"],
  "子供の頃の遊び": ["かくれんぼ","おにごっこ","なわとび","すなば","ぶらんこ","めんこ","こま","たこ","しゃぼんだま","おりがみ"],
  "雨の日": ["かさ","あめ","にじ","みず","ながぐつ","かみなり","しずく","ぬかるみ","くも","てるてるぼうず"],
  "夜の街": ["ひかり","ねおん","いざかや","ばー","よる","まち","ひと","おんがく","しんじゅく","どうとんぼり"],
  "懐かしい場所": ["こきょう","がっこう","こうえん","えき","しょうてんがい","じんじゃ","かわ","いえ","まち"],
  "自然の中の生き物": ["とり","むし","さかな","かえる","りす","くま","たぬき","きつね","しか","いのしし","ちょう"],
  "スポーツ": ["やきゅう","さっかー","じゅどう","すいえい","たいそう","まらそん","てにす","ばすけ","はしる","かつ"],
  "音楽": ["うた","おんがく","ぴあの","ぎたー","うたごえ","めろでぃ","りずむ","おんぷ","がっき","こんさーと"],
  "家族": ["ちち","はは","こ","そふ","そぼ","あに","いもうと","かぞく","あい","きずな","おや"],
  "仕事": ["かいぎ","しごと","きゃく","きぎょう","せいこう","のうりょく","もくひょう","がんばる","けいかく"],
  "恋愛": ["こい","あい","すき","きもち","てがみ","はな","ゆびわ","デート","こころ","ときめき"],
  "宇宙": ["ほし","つき","たいよう","うちゅう","ぎんが","わくせい","ひかり","くらやみ","はてな","うちゅうじん"],
  "海の中": ["さかな","たこ","いか","さんご","うみ","しお","なみ","せんすい","くじら","いるか"],
  "山の上": ["やま","くも","かぜ","ゆき","みち","みえる","ちょうじょう","きり","たいよう","きもちいい"],
  "祭り": ["おまつり","みこし","やたい","かこう","おどり","たいこ","はなび","ゆかた","さけ","にぎわい"],
  "朝ごはん": ["ごはん","みそしる","たまご","やさい","くだもの","ぱん","こーひー","おにぎり","さかな","あさ"],
  "夕焼け": ["そら","あかい","くも","うみ","かぜ","しずむ","きれい","やまなみ","ゆうひ","だいだい"],
  "秋の風景": ["もみじ","こうよう","かぜ","いちょう","くり","きのこ","あき","すすき","さつまいも","しずか"],
  "春の花": ["さくら","はな","うめ","たんぽぽ","れんげ","はる","はなびら","きれい","においよい","つぼみ"],
  "友達": ["ともだち","なかま","わらい","あそぶ","たのしい","しんらい","えがお","きずな","まもる","いっしょ"],
  "冒険": ["たび","みち","はっけん","ゆうき","ちず","おたから","ひみつ","もり","さばく","かいけつ"],
};

const VALID_WORDS = new Set([
  "あさ","あめ","いえ","うみ","えき","おに","かぜ","きり","くも","こい",
  "さか","しろ","すな","そら","たに","ちか","つき","てら","とり","なみ",
  "にわ","ぬの","ねこ","のり","はな","ひと","ふね","へや","ほし","まち",
  "みず","むし","めだか","もり","やま","ゆき","よる","らく","りく","るす",
  "れき","ろく","わた","ゐど","うた","おと","かわ","きね","くに","こえ",
  "さお","しお","すし","そば","たこ","ちず","つる","てぬぐい","とびら",
  "なつ","にじ","ぬりえ","ねだん","のはら","はし","ひかり","ふゆ","へいわ",
  "ほたる","まつり","みち","むかし","めがね","もみじ","やきとり","ゆびわ",
  "よあけ","らーめん","りんご","るすばん","れもん","ろうそく","わすれもの",
  "あおい","いそぎ","うれしい","えがお","おおきい","かなしい","きれい",
  "くらい","けむり","こわい","さびしい","しずか","すごい","せまい","そっと",
  "たのしい","ちいさい","つよい","てれる","とおい","なつかしい","にぎやか",
  "ぬくもり","ねむい","のんびり","はやい","ひろい","ふかい","へいき","ほそい",
  "まるい","みじかい","むずかしい","めずらしい","もったいない","やさしい",
  "ゆっくり","よろしい","らくだ","りっぱ","るすばん","れいぎ","ろくでもない",
  "あいさつ","いのち","うごき","えんぴつ","おみやげ","かぞく","きぼう","くらし",
  "けしき","こころ","さくら","しあわせ","すいか","せいかつ","そうじ","たからもの",
  "ちから","つながり","てがみ","とおまわり","なかま","にもつ","ぬいぐるみ",
  "ねがい","のぞみ","はじまり","ひびき","ふるさと","へんか","ほほえみ",
  "まなび","みらい","むすび","めぐみ","もとめる","やすらぎ","ゆめ","よろこび",
  "らいねん","りそう","るすばん","れいてん","ろうか","わかれ","いのり","うちゅう",
  "おどり","かがやき","きらめき","くらやみ","こうえん","さんぽ","しんりん",
  "すいみん","せいちょう","そだてる","たびびと","ちょうちょ","つばさ","てんき",
  "とびたつ","なみだ","にじいろ","ぬくい","ねっしん","のびのび","はなびら",
  "ひまわり","ふしぎ","へいげん","ほしぞら","まつかさ","みなと","むかで",
  "めいさく","もりのなか","やすみ","ゆうやけ","よあけまえ","らんぼう","りゅう",
  "さかな","ともだち","おんがく","もみじ","はなび","かみなり","しんかんせん",
  "たいよう","こうよう","すいえい","やきゅう","たんぽぽ","かたつむり","でんしゃ",
]);

async function judgeWord(word, theme) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `以下をJSONのみで返答してください。

お題:「${theme}」
言葉:「${word}」

判定:
1. valid: 日本語として実在する言葉か (true/false)。造語・でたらめは false。
2. score: お題との関連度 (0〜100の整数)
3. comment: 一言コメント（15文字以内）

{"valid": true, "score": 80, "comment": "コメント"} の形式のみで返答。`,
        }],
      }),
    });
    if (!res.ok) throw new Error("api error");
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("parse error");
    const result = JSON.parse(match[0]);
    return {
      valid: !!result.valid,
      score: Number(result.score) || 0,
      comment: result.comment || "…",
    };
  } catch {
    // APIエラー時はキーワードベースのフォールバック
    const keywords = THEME_KEYWORDS[theme] || [];
    const isValid = [...word].every(c => /^[ぁ-んァ-ンー]$/.test(c)) && [...word].length >= 3;
    const matched = keywords.some(k => word.includes(k) || k.includes(word));
    const score = matched ? 70 + Math.floor(Math.random() * 20) : 20 + Math.floor(Math.random() * 20);
    const comment = matched ? "お題に近い！" : "惜しい…";
    return { valid: isValid, score: isValid ? score : 0, comment };
  }
}

// スコア計算：最大100点。関連度がそのままベース、文字数ボーナスで上限100
function calcScore(apiScore, wordLength) {
  const lengthBonus = wordLength >= 6 ? 1.3 : wordLength >= 5 ? 1.15 : wordLength >= 4 ? 1.05 : 1.0;
  return Math.min(100, Math.round(apiScore * lengthBonus));
}

// スコアに応じた評価ラベル
function getScoreLabel(score) {
  if (score >= 90) return { label: "神業！", color: "#ffd700" };
  if (score >= 75) return { label: "すごい！", color: "#ff9500" };
  if (score >= 55) return { label: "いい感じ", color: "#34c759" };
  if (score >= 35) return { label: "まあまあ", color: "#5ac8fa" };
  if (score >= 15) return { label: "惜しい…", color: "#8e8e93" };
  return { label: "関係ない", color: "#636366" };
}

const C = {
  bg: "#0a0a12",
  card: "#12121e",
  cardBorder: "#1e1e32",
  tile: "#e8e0f0",
  tileSelected: "#c084fc",
  tileSelectedBg: "#1a0a2e",
  tileText: "#1a0a2e",
  text: "#e0ddf0",
  muted: "#4a4860",
  accent: "#c084fc",
  accentDark: "#7c3aed",
  gold: "#ffd700",
  green: "#34c759",
  red: "#ff453a",
  dim: "#2a2840",
};

// ランキング管理
const RANKING_KEY = "mojibiki_ranking";
const MAX_RANKING = 10;

function loadRanking() {
  try {
    return JSON.parse(localStorage.getItem(RANKING_KEY) || "[]");
  } catch { return []; }
}

function saveRanking(score, rank) {
  const ranking = loadRanking();
  const entry = {
    score,
    rank: rank.label,
    date: new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }),
  };
  const newRanking = [...ranking, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RANKING);
  localStorage.setItem(RANKING_KEY, JSON.stringify(newRanking));
  return newRanking;
}

export default function KotobaGame() {
  const [screen, setScreen] = useState("title"); // title | playing | roundResult | final
  const [round, setRound] = useState(1);
  const [theme, setTheme] = useState("");
  const [hand, setHand] = useState([]);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [usedThemes, setUsedThemes] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = React.useRef(null);
  const [ranking, setRanking] = useState([]);
  const [finalTab, setFinalTab] = useState("result"); // result | ranking

  async function startGame() {
    setTotalScore(0);
    setHistory([]);
    setRound(1);
    setUsedThemes([]);
    await startRound(1, []);
    setScreen("playing");
  }

  async function startRound(r, currentUsedThemes) {
    setLoadingTheme(true);
    setSelected([]);
    setRoundResult(null);
    setTimeLeft(30);
    if (timerRef.current) clearInterval(timerRef.current);
    const used = currentUsedThemes ?? usedThemes;
    const t = pickTheme(used);
    setTheme(t);
    setUsedThemes(prev => [...(currentUsedThemes ?? prev), t]);
    const newHand = dealHandForTheme(t, THEME_KEYWORDS);
    setHand(newHand);
    setLoadingTheme(false);
  }

  function toggleTile(idx) {
    if (submitting) return;
    setSelected(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  }

  const selectedWord = selected.map(i => hand[i]).join("");

  async function submitWord() {
    if (selected.length < 3 || submitting) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const result = await judgeWord(selectedWord, theme);
      const pts = result.valid ? calcScore(result.score, [...selectedWord].length) : 0;
      // ベストアンサー：手札の中でお題キーワードと一致する最長の単語
      const themeWords = THEME_KEYWORDS[theme] || [];
      const handStr = hand.join("");
      const bestAnswer = themeWords
        .filter(w => [...w].every(c => {
          // 手札の中に必要な文字が揃っているか（重複考慮）
          const handArr = [...handStr];
          return [...w].every(ch => {
            const idx = handArr.indexOf(ch);
            if (idx === -1) return false;
            handArr.splice(idx, 1);
            return true;
          });
        }))
        .sort((a, b) => b.length - a.length)[0] || null;

      const entry = {
        round, theme, word: selectedWord,
        valid: result.valid,
        apiScore: result.score,
        score: pts,
        comment: result.comment,
        wordLength: [...selectedWord].length,
        hand: [...hand],
        bestAnswer,
      };
      setRoundResult(entry);
      setTotalScore(prev => prev + pts);
      setHistory(prev => [...prev, entry]);
      setScreen("roundResult");
    } catch (e) {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  // ランキング保存（finalに遷移したとき）
  useEffect(() => {
    if (screen !== "final") return;
    const rank =
      totalScore >= 450 ? { label: "語彙の神" } :
      totalScore >= 350 ? { label: "言葉の達人" } :
      totalScore >= 250 ? { label: "なかなかの腕前" } :
      totalScore >= 150 ? { label: "まだまだこれから" } :
      { label: "語彙力を鍛えよう" };
    const newRanking = saveRanking(totalScore, rank);
    setRanking(newRanking);
    setFinalTab("result");
  }, [screen]);

  // タイマー制御
  useEffect(() => {
    if (screen !== "playing" || loadingTheme || submitting) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // 時間切れ → 無回答で0点
          const themeWords = THEME_KEYWORDS[theme] || [];
          const handStr = hand.join("");
          const bestAnswer = themeWords
            .filter(w => [...w].every(() => true) && (() => {
              const handArr = [...handStr];
              return [...w].every(ch => {
                const idx = handArr.indexOf(ch);
                if (idx === -1) return false;
                handArr.splice(idx, 1);
                return true;
              });
            })())
            .sort((a, b) => b.length - a.length)[0] || null;
          const entry = {
            round, theme, word: "（無回答）",
            valid: false, apiScore: 0, score: 0,
            comment: "時間切れ！次は早めに！",
            wordLength: 0, hand: [...hand], bestAnswer,
          };
          setRoundResult(entry);
          setHistory(prev2 => [...prev2, entry]);
          setScreen("roundResult");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, loadingTheme, submitting, theme]);

  async function nextRound() {
    if (round >= TOTAL_ROUNDS) {
      setScreen("final");
      return;
    }
    const next = round + 1;
    setRound(next);
    setScreen("playing");
    await startRound(next, null);
  }

  // タイトル画面
  if (screen === "title") {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
        color: C.text, padding: "48px 24px",
        userSelect: "none", overflowY: "auto",
        boxSizing: "border-box",
      }}>
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
          zIndex: 0,
        }}>
          {["あ","い","う","え","お","か","き","く","な","に","の","は","ま","も","や","ゆ","よ"].map((c, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${(i * 23 + 5) % 100}%`,
              top: `${(i * 17 + 10) % 100}%`,
              fontSize: `${16 + (i % 3) * 8}px`,
              color: "#9d7fe0",
              opacity: 0.35,
              fontWeight: "bold",
            }}>{c}</div>
          ))}
        </div>

        <div style={{ position: "relative", textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.accent, marginBottom: "12px" }}>
            WORD PUZZLE GAME
          </div>
          <h1 style={{
            margin: "0 0 4px", fontSize: "52px", fontWeight: "900",
            letterSpacing: "0.1em", lineHeight: "1.4", padding: "4px 0",
            background: `linear-gradient(135deg, ${C.accent} 0%, ${C.gold} 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text",
            WebkitTextFillColor: "transparent", color: "transparent",
          }}>もじびき</h1>
          <div style={{ fontSize: "13px", color: C.text, marginBottom: "40px", lineHeight: "1.8" }}>
            配られた文字札でお題に合う言葉を作ろう<br/>
            <span style={{ color: C.accent }}>お題に近いほど高得点</span>
          </div>

          {/* ルール */}
          <div style={{
            background: C.card, border: `1px solid ${C.cardBorder}`,
            borderRadius: "8px", padding: "20px 24px",
            maxWidth: "300px", margin: "0 auto 32px",
            textAlign: "left", fontSize: "12px", lineHeight: "2.2", color: C.muted,
          }}>
            <div style={{ color: C.text }}>🃏 15枚の文字札が配られる</div>
            <div style={{ color: C.text }}>💬 毎回ランダムなお題が発表される</div>
            <div style={{ color: C.text }}>✍️ 3文字以上選んで言葉を作る</div>
            <div style={{ color: C.accent }}>⭐ お題に近い言葉ほど高得点</div>
            <div style={{ color: C.text }}>🏆 5ラウンドの合計点を競う</div>
          </div>

          <button
            onClick={startGame}
            style={{
              padding: "16px 48px",
              background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
              color: "#fff", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: "16px", fontWeight: "bold",
              borderRadius: "40px", letterSpacing: "0.15em",
              boxShadow: `0 4px 24px ${C.accentDark}88`,
            }}
          >はじめる</button>
        </div>
      </div>
    );
  }

  // プレイ画面
  if (screen === "playing") {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "32px 16px 48px",
        fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
        color: C.text, userSelect: "none",
      }}>

        {/* ラウンド表示 */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <div key={i} style={{
              width: "32px", height: "4px", borderRadius: "2px",
              background: i < round ? C.accent : i === round - 1 ? C.accent : C.dim,
              opacity: i < round - 1 ? 0.4 : 1,
            }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
          <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "0.15em" }}>
            ROUND {round} / {TOTAL_ROUNDS}
          </div>
          <div style={{
            fontSize: "20px", fontWeight: "900",
            color: timeLeft <= 10 ? C.red : timeLeft <= 20 ? C.gold : C.text,
            letterSpacing: "0.05em",
            textShadow: timeLeft <= 10 ? `0 0 12px ${C.red}` : "none",
            transition: "color 0.3s",
            minWidth: "48px", textAlign: "center",
          }}>
            {timeLeft}
          </div>
        </div>

        {/* お題 */}
        <div style={{
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: "12px", padding: "20px 32px",
          marginBottom: "28px", textAlign: "center",
          width: "100%", maxWidth: "360px",
          boxShadow: `0 0 32px ${C.accentDark}33`,
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: C.muted, marginBottom: "8px" }}>
            お　題
          </div>
          {loadingTheme ? (
            <div style={{ fontSize: "20px", color: C.muted, letterSpacing: "0.1em" }}>考え中…</div>
          ) : (
            <div style={{
              fontSize: "26px", fontWeight: "900", color: C.accent,
              letterSpacing: "0.05em",
              textShadow: `0 0 20px ${C.accentDark}`,
            }}>{theme}</div>
          )}
        </div>

        {/* 文字札 */}
        <div style={{ marginBottom: "24px", width: "100%", maxWidth: "360px" }}>
          <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.2em", marginBottom: "12px", textAlign: "center" }}>
            文字札
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {hand.map((tile, i) => {
              const isSel = selected.includes(i);
              const selOrder = selected.indexOf(i);
              return (
                <div
                  key={i}
                  onClick={() => toggleTile(i)}
                  style={{
                    width: "52px", height: "68px",
                    background: isSel ? C.tileSelectedBg : "#1e1a2e",
                    border: `2px solid ${isSel ? C.tileSelected : C.cardBorder}`,
                    borderRadius: "6px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "24px", fontWeight: "bold",
                    color: isSel ? C.tileSelected : C.text,
                    cursor: "pointer",
                    transform: isSel ? "translateY(-10px) scale(1.05)" : "none",
                    transition: "all 0.15s ease",
                    boxShadow: isSel ? `0 8px 20px ${C.accentDark}66` : "none",
                    position: "relative",
                  }}
                >
                  {tile}
                  {isSel && (
                    <div style={{
                      position: "absolute", bottom: "4px",
                      fontSize: "9px", color: C.accent, fontWeight: "normal",
                    }}>{selOrder + 1}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 作った言葉プレビュー */}
        <div style={{
          minHeight: "56px",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "20px",
        }}>
          {selectedWord ? (
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "32px", fontWeight: "900",
                color: selected.length >= 3 ? C.text : C.muted,
                letterSpacing: "0.1em",
                textShadow: selected.length >= 3 ? `0 0 16px ${C.accent}44` : "none",
              }}>
                {selectedWord}
              </div>
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px" }}>
                {[...selectedWord].length}文字
                {[...selectedWord].length < 3 && " (あと" + (3 - [...selectedWord].length) + "文字)"}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: C.muted }}>文字札をタップして言葉を作ろう</div>
          )}
        </div>

        {/* 提出ボタン */}
        <button
          onClick={submitWord}
          disabled={selected.length < 3 || submitting || loadingTheme}
          style={{
            padding: "14px 48px",
            background: selected.length >= 3 && !submitting
              ? `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`
              : C.dim,
            color: selected.length >= 3 && !submitting ? "#fff" : C.muted,
            border: "none",
            cursor: selected.length >= 3 && !submitting ? "pointer" : "not-allowed",
            fontFamily: "inherit", fontSize: "14px", fontWeight: "bold",
            borderRadius: "40px", letterSpacing: "0.15em",
            transition: "all 0.2s",
            boxShadow: selected.length >= 3 && !submitting ? `0 4px 20px ${C.accentDark}66` : "none",
          }}
        >
          {submitting ? "判定中…" : "提出する"}
        </button>

        {/* 現在の合計点 */}
        <div style={{ marginTop: "24px", fontSize: "12px", color: C.muted }}>
          現在 <span style={{ color: C.gold, fontWeight: "bold" }}>{totalScore}点</span>
        </div>
      </div>
    );
  }

  // ラウンド結果
  if (screen === "roundResult" && roundResult) {
    const { label, color } = getScoreLabel(roundResult.score);
    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
        color: C.text, padding: "48px 24px",
        userSelect: "none", overflowY: "auto",
        boxSizing: "border-box",
      }}>
        <div style={{
          width: "100%", maxWidth: "360px",
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: "16px", padding: "32px 28px",
          textAlign: "center",
          animation: "fadeUp 0.4s ease",
          boxShadow: `0 0 48px ${C.accentDark}22`,
        }}>
          {/* お題 */}
          <div style={{ fontSize: "11px", color: C.muted, letterSpacing: "0.2em", marginBottom: "4px" }}>
            お題
          </div>
          <div style={{ fontSize: "18px", color: C.accent, fontWeight: "bold", marginBottom: "20px" }}>
            {roundResult.theme}
          </div>

          {/* 提出した言葉 */}
          <div style={{
            fontSize: "40px", fontWeight: "900",
            color: roundResult.valid ? C.text : C.muted,
            letterSpacing: "0.1em", marginBottom: "8px",
          }}>
            {roundResult.word}
          </div>

          {/* 有効/無効 */}
          <div style={{
            fontSize: "12px", marginBottom: "20px",
            color: roundResult.valid ? C.green : C.red,
          }}>
            {roundResult.valid ? "✓ 有効な言葉" : "✗ 辞書にない言葉"}
          </div>

          {roundResult.valid && (
            <>
              {/* スコアラベル */}
              <div style={{
                fontSize: "28px", fontWeight: "900",
                color, marginBottom: "4px",
                textShadow: `0 0 16px ${color}88`,
              }}>
                {label}
              </div>

              {/* 関連度バー */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: C.muted, marginBottom: "6px", letterSpacing: "0.1em" }}>
                  お題との関連度
                </div>
                <div style={{
                  height: "8px", background: C.dim, borderRadius: "4px", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${roundResult.apiScore}%`,
                    background: `linear-gradient(90deg, ${C.accentDark}, ${color})`,
                    borderRadius: "4px",
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px" }}>
                  {roundResult.apiScore} / 100
                  {roundResult.wordLength >= 5 && (
                    <span style={{ color: C.gold, marginLeft: "8px" }}>
                      長さボーナス ×{roundResult.wordLength >= 6 ? "2.0" : "1.5"}
                    </span>
                  )}
                </div>
              </div>

              {/* 獲得点 */}
              <div style={{
                fontSize: "48px", fontWeight: "900", color: C.gold,
                textShadow: `0 0 24px ${C.gold}88`,
                marginBottom: "4px",
              }}>
                +{roundResult.score}
              </div>
              <div style={{ fontSize: "11px", color: C.muted, marginBottom: "16px" }}>点</div>
            </>
          )}

          {/* AIコメント */}
          <div style={{
            background: "#0a0a18", borderRadius: "8px", padding: "10px 16px",
            fontSize: "12px", color: C.muted, marginBottom: "24px",
            fontStyle: "italic",
          }}>
            💬 {roundResult.comment}
          </div>

          {/* 合計点 */}
          <div style={{ fontSize: "12px", color: C.muted, marginBottom: "20px" }}>
            合計 <span style={{ color: C.gold, fontSize: "16px", fontWeight: "bold" }}>{totalScore}点</span>
          </div>

          <button
            onClick={nextRound}
            style={{
              width: "100%", padding: "14px",
              background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
              color: "#fff", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: "14px", fontWeight: "bold",
              borderRadius: "40px", letterSpacing: "0.1em",
            }}
          >
            {round >= TOTAL_ROUNDS ? "結果を見る" : `次のラウンドへ (${round + 1}/${TOTAL_ROUNDS})`}
          </button>
        </div>
      </div>
    );
  }

  // 最終結果
  if (screen === "final") {
    const avg = Math.round(totalScore / TOTAL_ROUNDS);
    const best = history.reduce((a, b) => a.score > b.score ? a : b, history[0]);
    const rank =
      totalScore >= 450 ? { label: "語彙の神", emoji: "👑" } :
      totalScore >= 350 ? { label: "言葉の達人", emoji: "🏆" } :
      totalScore >= 250 ? { label: "なかなかの腕前", emoji: "⭐" } :
      totalScore >= 150 ? { label: "まだまだこれから", emoji: "📚" } :
      { label: "語彙力を鍛えよう", emoji: "🌱" };

    const myRankPosition = ranking.findIndex(r => r.score === totalScore) + 1;

    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
        color: C.text, padding: "48px 24px",
        userSelect: "none", overflowY: "auto",
        boxSizing: "border-box",
      }}>
        <div style={{ width: "100%", maxWidth: "360px", animation: "fadeUp 0.5s ease" }}>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>{rank.emoji}</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: C.accent, marginBottom: "4px" }}>
              {rank.label}
            </div>
            <div style={{
              fontSize: "64px", fontWeight: "900", color: C.gold,
              textShadow: `0 0 32px ${C.gold}88`, lineHeight: 1,
            }}>
              {totalScore}
            </div>
            <div style={{ fontSize: "12px", color: C.muted }}>点 (平均 {avg}点/ラウンド)</div>
            {myRankPosition > 0 && (
              <div style={{ fontSize: "12px", color: C.accent, marginTop: "4px" }}>
                このデバイスで {myRankPosition}位！
              </div>
            )}
          </div>

          {/* タブ切り替え */}
          <div style={{ display: "flex", gap: "0", marginBottom: "16px", border: `1px solid ${C.cardBorder}`, borderRadius: "8px", overflow: "hidden" }}>
            {[["result", "結果"], ["ranking", "ランキング"]].map(([tab, label]) => (
              <button key={tab} onClick={() => setFinalTab(tab)} style={{
                flex: 1, padding: "10px",
                background: finalTab === tab ? C.accentDark : "transparent",
                color: finalTab === tab ? "#fff" : C.muted,
                border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: "12px", letterSpacing: "0.1em",
              }}>{label}</button>
            ))}
          </div>

          {/* 履歴 */}
          <div style={{
            background: C.card, border: `1px solid ${C.cardBorder}`,
            borderRadius: "12px", padding: "16px 20px", marginBottom: "20px",
          }}>
            <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.2em", marginBottom: "12px" }}>
              ラウンド履歴
            </div>
            {history.map((h, i) => (
              <div key={i} style={{
                padding: "10px 0",
                borderBottom: i < history.length - 1 ? `1px solid ${C.dim}` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: C.muted, marginBottom: "2px" }}>{h.theme}</div>
                    <div style={{
                      fontSize: "16px", fontWeight: "bold",
                      color: h.valid ? C.text : C.muted,
                    }}>{h.word}</div>
                  </div>
                  <div style={{
                    fontSize: "18px", fontWeight: "900",
                    color: h.score >= 100 ? C.gold : h.score >= 50 ? C.accent : C.muted,
                  }}>
                    {h.valid ? `+${h.score}` : "—"}
                  </div>
                </div>
                {h.bestAnswer && h.bestAnswer !== h.word && (
                  <div style={{
                    marginTop: "6px", display: "flex", alignItems: "center", gap: "6px",
                    background: "#0a0a18", borderRadius: "6px", padding: "5px 10px",
                  }}>
                    <span style={{ fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>ベスト例</span>
                    <span style={{ fontSize: "14px", color: C.accent, fontWeight: "bold" }}>
                      {h.bestAnswer}
                    </span>
                    <span style={{ fontSize: "9px", color: C.muted }}>
                      ({calcScore(85, [...h.bestAnswer].length)}点相当)
                    </span>
                  </div>
                )}
                {h.bestAnswer && h.bestAnswer === h.word && (
                  <div style={{
                    marginTop: "6px", fontSize: "10px", color: C.green,
                  }}>✓ ベストアンサー！</div>
                )}
              </div>
            ))}
          </div>

          {best && (
            <div style={{
              textAlign: "center", fontSize: "11px", color: C.muted, marginBottom: "20px",
            }}>
              ベスト: 「<span style={{ color: C.accent }}>{best.word}</span>」({best.score}点)
            </div>
          )}

          {/* ランキング表示 */}
          {finalTab === "ranking" && (
            <div style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: "12px", padding: "16px 20px", marginBottom: "20px",
            }}>
              <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.2em", marginBottom: "12px" }}>
                このデバイスのランキング TOP{MAX_RANKING}
              </div>
              {ranking.length === 0 ? (
                <div style={{ fontSize: "12px", color: C.muted, textAlign: "center", padding: "12px" }}>
                  まだ記録がありません
                </div>
              ) : ranking.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "8px 0",
                  borderBottom: i < ranking.length - 1 ? `1px solid ${C.dim}` : "none",
                  background: r.score === totalScore && i === myRankPosition - 1 ? "#1a1a2e" : "transparent",
                  borderRadius: "4px", paddingLeft: "4px",
                }}>
                  <div style={{
                    width: "24px", fontSize: "14px", fontWeight: "900", textAlign: "center",
                    color: i === 0 ? C.gold : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : C.muted,
                  }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", fontWeight: "900", color: i < 3 ? C.text : C.muted }}>
                      {r.score}<span style={{ fontSize: "10px", marginLeft: "2px" }}>点</span>
                    </div>
                    <div style={{ fontSize: "9px", color: C.muted }}>{r.date} · {r.rank}</div>
                  </div>
                  {r.score === totalScore && i === myRankPosition - 1 && (
                    <div style={{ fontSize: "10px", color: C.accent }}>← 今回</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => { setScreen("title"); }}
            style={{
              width: "100%", padding: "14px",
              background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
              color: "#fff", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: "14px", fontWeight: "bold",
              borderRadius: "40px", letterSpacing: "0.15em",
            }}
          >もう一度遊ぶ</button>
        </div>

        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
      </div>
    );
  }

  return null;
}
