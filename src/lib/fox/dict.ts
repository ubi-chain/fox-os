export const KINDS = ["日常", "米語", "英語", "ビジネス", "学術", "IT", "旅行", "医療"] as const;
export type EnglishKind = (typeof KINDS)[number];

export type DictEntry = {
  ja: string;
  reading: string;
  en: string;
  pos: string;
  example: string;
  cats: EnglishKind[];
};

type Lex = {
  ja: string;
  yomi: string;
  pos: string;
  en: string;
  cats: EnglishKind[];
  alt: Partial<Record<EnglishKind, string>>;
};

const RAW = `
こんにちは	こんにちは	挨拶	hello	日常:hi|ビジネス:good morning|英語:hello
ありがとう	ありがとう	挨拶	thank you	日常:thanks|ビジネス:thank you
さようなら	さようなら	挨拶	goodbye	日常:see you|ビジネス:goodbye
おはよう	おはよう	挨拶	good morning	日常:morning
こんばんは	こんばんは	挨拶	good evening
すみません	すみません	挨拶	excuse me	ビジネス:I am sorry
お願いします	おねがいします	挨拶	please	ビジネス:kindly
はい	はい	応答	yes
いいえ	いいえ	応答	no
私	わたし	代	I	ビジネス:I
あなた	あなた	代	you
彼	かれ	代	he
彼女	かのじょ	代	she
私たち	わたしたち	代	we
彼ら	かれら	代	they
これ	これ	代	this
それ	それ	代	that
あれ	あれ	代	that
何	なに	代	what
誰	だれ	代	who
どこ	どこ	代	where
いつ	いつ	代	when
なぜ	なぜ	代	why
どう	どう	代	how
ここ	ここ	代	here
そこ	そこ	代	there
水	みず	名	water	旅行|医療
火	ひ	名	fire
空	そら	名	sky
本	ほん	名	book	学術
猫	ねこ	名	cat
犬	いぬ	名	dog
狐	きつね	名	fox
人	ひと	名	person	ビジネス:individual|学術:individual
友達	ともだち	名	friend
学校	がっこう	名	school	学術:institution
会社	かいしゃ	名	company	ビジネス:firm
時間	じかん	名	time	ビジネス:schedule
今日	きょう	名	today
明日	あした	名	tomorrow	英語:tomorrow
昨日	きのう	名	yesterday
朝	あさ	名	morning
夜	よる	名	night
今	いま	名	now
名前	なまえ	名	name
言葉	ことば	名	word	学術:term
意味	いみ	名	meaning
辞書	じしょ	名	dictionary
翻訳	ほんやく	名	translation	学術
文法	ぶんぽう	名	grammar	学術
例文	れいぶん	名	example	学術:example sentence
英語	えいご	名	English
日本語	にほんご	名	Japanese
質問	しつもん	名	question	ビジネス:inquiry
答え	こたえ	名	answer	学術:response
問題	もんだい	名	problem	IT:issue|ビジネス:issue
仕事	しごと	名	work	ビジネス:business|IT:task
家	いえ	名	home	英語:home|米語:home
部屋	へや	名	room	旅行:room
駅	えき	名	station	旅行
電車	でんしゃ	名	train	旅行|英語:train
車	くるま	名	car	米語:car|英語:car
道	みち	名	road	英語:road
街	まち	名	town	米語:town|英語:town
国	くに	名	country
日本	にほん	名	Japan
アメリカ	アメリカ	名	the United States	英語:America
イギリス	イギリス	名	Britain
空港	くうこう	名	airport	旅行
切符	きっぷ	名	ticket	旅行
ホテル	ホテル	名	hotel	旅行
予約	よやく	名	reservation	旅行|ビジネス:booking
荷物	にもつ	名	luggage	旅行|米語:baggage|英語:luggage
地図	ちず	名	map	旅行
お金	おかね	名	money	ビジネス:funds
円	えん	名	yen
食事	しょくじ	名	meal	旅行
水をください	みずをください	句	water, please	旅行
いくら	いくら	句	how much	旅行
助けて	たすけて	句	help	旅行:help me|医療:I need help
トイレ	トイレ	名	restroom	米語:restroom|英語:toilet|旅行:restroom
医者	いしゃ	名	doctor	医療
病院	びょういん	名	hospital	医療
薬	くすり	名	medicine	医療|学術:medication
痛み	いたみ	名	pain	医療
熱	ねつ	名	fever	医療
咳	せき	名	cough	医療
頭	あたま	名	head	医療
お腹	おなか	名	stomach	医療
血	ち	名	blood	医療
心臓	しんぞう	名	heart	医療
検査	けんさ	名	examination	医療:exam|学術:examination
症状	しょうじょう	名	symptom	医療
治療	ちりょう	名	treatment	医療
患者	かんじゃ	名	patient	医療
看護	かんご	名	nursing	医療
健康	けんこう	名	health	医療
病気	びょうき	名	illness	医療|学術:disease
コンピュータ	コンピュータ	名	computer	IT
画面	がめん	名	screen	IT
ファイル	ファイル	名	file	IT
フォルダ	フォルダ	名	folder	IT|英語:folder
検索	けんさく	名	search	IT
ブラウザ	ブラウザ	名	browser	IT
タブ	タブ	名	tab	IT
パスワード	パスワード	名	password	IT
サーバー	サーバー	名	server	IT
ネットワーク	ネットワーク	名	network	IT
プログラム	プログラム	名	program	IT|英語:programme
コード	コード	名	code	IT
バグ	バグ	名	bug	IT
データ	データ	名	data	IT|学術:data
安全	あんぜん	名	safe	IT:security|ビジネス:safety
秘密	ひみつ	名	secret	IT:confidential
更新	こうしん	名	update	IT
設定	せってい	名	settings	IT
ダウンロード	ダウンロード	名	download	IT
契約	けいやく	名	contract	ビジネス
会議	かいぎ	名	meeting	ビジネス
提案	ていあん	名	proposal	ビジネス|学術:proposal
報告	ほうこく	名	report	ビジネス|学術:report
売上	うりあげ	名	sales	ビジネス
顧客	こきゃく	名	customer	ビジネス:client
価格	かかく	名	price	ビジネス
請求	せいきゅう	名	invoice	ビジネス
承認	しょうにん	名	approval	ビジネス
締め切り	しめきり	名	deadline	ビジネス
資料	しりょう	名	document	ビジネス|学術:material
研究	けんきゅう	名	research	学術
論文	ろんぶん	名	paper	学術
仮説	かせつ	名	hypothesis	学術
実験	じっけん	名	experiment	学術
結果	けっか	名	result	学術|ビジネス:result
理論	りろん	名	theory	学術
証拠	しょうこ	名	evidence	学術
分析	ぶんせき	名	analysis	学術|ビジネス:analysis
方法	ほうほう	名	method	学術
結論	けつろん	名	conclusion	学術
引用	いんよう	名	citation	学術
色	いろ	名	color	英語:colour
好き	すき	形	favorite	英語:favourite
中心	ちゅうしん	名	center	英語:centre
アパート	アパート	名	apartment	英語:flat
エレベーター	エレベーター	名	elevator	英語:lift
トラック	トラック	名	truck	英語:lorry
地下鉄	ちかてつ	名	subway	英語:underground|米語:subway
映画	えいが	名	movie	英語:film
店	みせ	名	store	英語:shop
秋	あき	名	fall	英語:autumn
ガソリン	ガソリン	名	gas	英語:petrol|米語:gas
郵便番号	ゆうびんばんごう	名	zip code	英語:postcode
食べる	たべる	動	eat
飲む	のむ	動	drink
行く	いく	動	go
来る	くる	動	come
見る	みる	動	see	学術:observe
聞く	きく	動	hear
話す	はなす	動	speak	ビジネス:discuss
読む	よむ	動	read
書く	かく	動	write	学術:write
買う	かう	動	buy	ビジネス:purchase
売る	うる	動	sell
作る	つくる	動	make	IT:build|学術:construct
使う	つかう	動	use	学術:utilize
知る	しる	動	know
思う	おもう	動	think	学術:consider|ビジネス:consider
言う	いう	動	say
する	する	動	do
なる	なる	動	become
ある	ある	動	be
いる	いる	動	be
くれる	くれる	動	give
あげる	あげる	動	give
待つ	まつ	動	wait	旅行
乗る	のる	動	ride	旅行:take
泊まる	とまる	動	stay	旅行
予約する	よやくする	動	reserve	旅行:book|ビジネス:book
開く	ひらく	動	open	IT
閉じる	とじる	動	close	IT
保存する	ほぞんする	動	save	IT
送る	おくる	動	send	ビジネス
受け取る	うけとる	動	receive	ビジネス
説明する	せつめいする	動	explain	学術
調べる	しらべる	動	look up	学術:investigate|IT:search
直す	なおす	動	fix	IT:fix|医療:treat
大きい	おおきい	形	big	学術:significant|ビジネス:major
小さい	ちいさい	形	small	学術:minor
新しい	あたらしい	形	new
古い	ふるい	形	old
良い	よい	形	good	ビジネス:favorable|英語:good
悪い	わるい	形	bad
速い	はやい	形	fast	IT:fast
遅い	おそい	形	slow
高い	たかい	形	expensive	旅行|ビジネス:high
安い	やすい	形	cheap	旅行
暑い	あつい	形	hot
寒い	さむい	形	cold	医療:cold
痛い	いたい	形	painful	医療
必要な	ひつような	形	necessary	ビジネス:required
簡単	かんたん	形	easy	学術:straightforward
難しい	むずかしい	形	difficult	学術:complex
赤	あか	名	red
青	あお	名	blue
白	しろ	名	white
黒	くろ	名	black
一	いち	数	one
二	に	数	two
三	さん	数	three
四	よん	数	four
五	ご	数	five
六	ろく	数	six
七	なな	数	seven
八	はち	数	eight
九	きゅう	数	nine
十	じゅう	数	ten
百	ひゃく	数	hundred
千	せん	数	thousand
米	こめ	名	rice
パン	パン	名	bread
茶	ちゃ	名	tea	英語:tea
コーヒー	コーヒー	名	coffee
りんご	りんご	名	apple
魚	さかな	名	fish
肉	にく	名	meat
朝ごはん	あさごはん	名	breakfast	旅行
天気	てんき	名	weather	旅行
雨	あめ	名	rain
雪	ゆき	名	snow
海	うみ	名	sea	英語:sea
山	やま	名	mountain
川	かわ	名	river
花	はな	名	flower
木	き	名	tree
手	て	名	hand
目	め	名	eye
口	くち	名	mouth
足	あし	名	leg	医療:leg
心	こころ	名	mind	学術:mind
愛	あい	名	love
平和	へいわ	名	peace
自由	じゆう	名	freedom	学術
権利	けんり	名	right	学術|ビジネス:right
法律	ほうりつ	名	law	学術|ビジネス:law
社会	しゃかい	名	society	学術
経済	けいざい	名	economy	ビジネス|学術
政治	せいじ	名	politics	学術
教育	きょういく	名	education	学術
歴史	れきし	名	history	学術
科学	かがく	名	science	学術
数学	すうがく	名	mathematics	学術
言語	げんご	名	language	学術
文化	ぶんか	名	culture	学術
世界	せかい	名	world
未来	みらい	名	future
過去	かこ	名	past
理由	りゆう	名	reason	学術
目的	もくてき	名	purpose	ビジネス:objective
計画	けいかく	名	plan	ビジネス
成功	せいこう	名	success	ビジネス
失敗	しっぱい	名	failure
努力	どりょく	名	effort	ビジネス
経験	けいけん	名	experience	ビジネス
知識	ちしき	名	knowledge	学術
意見	いけん	名	opinion	ビジネス:view
事実	じじつ	名	fact	学術
嘘	うそ	名	lie
本当	ほんとう	名	truth	学術:truth
可能	かのう	形	possible	学術
不可能	ふかのう	形	impossible
重要	じゅうよう	形	important	ビジネス:important|学術:significant
緊急	きんきゅう	形	urgent	医療|ビジネス
危険	きけん	名	danger	医療:risk
助け	たすけ	名	help	ビジネス:assistance
情報	じょうほう	名	information	IT|ビジネス
連絡	れんらく	名	contact	ビジネス
メール	メール	名	email	ビジネス|IT
電話	でんわ	名	phone	ビジネス:telephone
会議する	かいぎする	動	meet	ビジネス:hold a meeting
確認する	かくにんする	動	confirm	ビジネス
同意する	どういする	動	agree	ビジネス
拒否する	きょひする	動	refuse	ビジネス:decline
始める	はじめる	動	start	ビジネス:commence|学術:initiate
終わる	おわる	動	finish	ビジネス:complete
続く	つづく	動	continue
変わる	かわる	動	change
増える	ふえる	動	increase	ビジネス
減る	へる	動	decrease	ビジネス
学ぶ	まなぶ	動	learn	学術:study
教える	おしえる	動	teach	学術
覚える	おぼえる	動	remember
忘れる	わすれる	動	forget
分かる	わかる	動	understand	学術:comprehend
出来る	できる	動	can
欲しい	ほしい	形	want
好きです	すきです	句	I like it	日常:I like it|ビジネス:I prefer it
元気	げんき	形	fine	旅行:fine|医療:well
疲れ	つかれ	名	fatigue	医療
休み	やすみ	名	rest	旅行:holiday|英語:holiday|米語:vacation
誕生日	たんじょうび	名	birthday
家族	かぞく	名	family
父	ちち	名	father
母	はは	名	mother
兄	あに	名	older brother
弟	おとうと	名	younger brother
子ども	こども	名	child
先生	せんせい	名	teacher	学術
学生	がくせい	名	student	学術
朝です	あさです	句	It is morning
私は学生です	わたしはがくせいです	句	I am a student	学術:I am a student|ビジネス:I am a student
これは本です	これはほんです	句	This is a book
どこですか	どこですか	句	Where is it?	旅行:Where is it?
いくらですか	いくらですか	句	How much is it?	旅行
助けてください	たすけてください	句	Please help me	医療:Please help me|ビジネス:Could you assist me
おはようございます	おはようございます	句	Good morning	ビジネス:Good morning
よろしくお願いします	よろしくおねがいします	句	Nice to meet you	ビジネス:I look forward to working with you
`;

function parse(): Lex[] {
  const rows: Lex[] = [];
  for (const line of RAW.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [ja, yomi, pos, en, extra = ""] = trimmed.split("\t");
    const alt: Partial<Record<EnglishKind, string>> = {};
    const cats: EnglishKind[] = [];
    for (const part of extra.split("|").filter(Boolean)) {
      const [key, value] = part.split(":");
      if ((KINDS as readonly string[]).includes(key) && value) alt[key as EnglishKind] = value;
      else if ((KINDS as readonly string[]).includes(key)) cats.push(key as EnglishKind);
    }
    rows.push({ ja, yomi, pos, en, cats, alt });
  }
  return rows;
}

const LEX = parse();

const BRITISH: Record<string, string> = {
  color: "colour",
  favorite: "favourite",
  center: "centre",
  theater: "theatre",
  apartment: "flat",
  elevator: "lift",
  truck: "lorry",
  subway: "underground",
  movie: "film",
  store: "shop",
  fall: "autumn",
  gas: "petrol",
  vacation: "holiday",
  restroom: "toilet",
  zip: "postcode",
  program: "programme",
};

const BUSINESS: Record<string, string> = {
  hello: "good morning",
  hi: "good morning",
  thanks: "thank you",
  buy: "purchase",
  help: "assistance",
  start: "commence",
  need: "require",
  about: "regarding",
  problem: "issue",
  cheap: "low-cost",
};

const ACADEMIC: Record<string, string> = {
  think: "consider",
  show: "demonstrate",
  big: "significant",
  so: "therefore",
  about: "concerning",
  help: "aid",
  use: "utilize",
  look: "examine",
};

const CASUAL: Record<string, string> = {
  hello: "hi",
  "thank you": "thanks",
  goodbye: "see ya",
  "I would like": "I want",
  purchase: "buy",
  commence: "start",
};

function glossEn(entry: Lex, kind: EnglishKind) {
  return entry.alt[kind] ?? entry.en;
}

function restyle(text: string, kind: EnglishKind) {
  const table = kind === "英語" ? BRITISH : kind === "ビジネス" ? BUSINESS : kind === "学術" ? ACADEMIC : kind === "日常" ? CASUAL : null;
  if (!table) return text;
  return text.replace(/[A-Za-z']+/g, (word) => {
    const hit = table[word.toLowerCase()];
    return hit ?? word;
  });
}

const byJa = new Map<string, Lex>();
for (const entry of LEX) {
  byJa.set(entry.ja, entry);
  if (!byJa.has(entry.yomi)) byJa.set(entry.yomi, entry);
}
const JA_KEYS = [...byJa.keys()].sort((a, b) => b.length - a.length);

const byEn = new Map<string, Lex>();
for (const entry of LEX) {
  byEn.set(entry.en.toLowerCase(), entry);
  for (const value of Object.values(entry.alt)) {
    if (value) byEn.set(value.toLowerCase(), entry);
  }
}

const SUFFIXES: { end: string; mark: string }[] = [
  { end: "ました", mark: "past" },
  { end: "ません", mark: "not" },
  { end: "ている", mark: "ing" },
  { end: "ていた", mark: "was" },
  { end: "ます", mark: "" },
  { end: "たい", mark: "want to" },
  { end: "ない", mark: "not" },
  { end: "った", mark: "past" },
  { end: "た", mark: "past" },
  { end: "て", mark: "" },
  { end: "です", mark: "is" },
  { end: "だ", mark: "is" },
];

function lookupSurface(text: string): { entry: Lex; mark: string } | null {
  const direct = byJa.get(text);
  if (direct) return { entry: direct, mark: "" };
  for (const suffix of SUFFIXES) {
    if (!text.endsWith(suffix.end) || text.length <= suffix.end.length) continue;
    const stem = text.slice(0, -suffix.end.length);
    const hit = byJa.get(stem) ?? byJa.get(`${stem}る`) ?? byJa.get(`${stem}う`) ?? byJa.get(`${stem}く`) ?? byJa.get(`${stem}す`) ?? byJa.get(`${stem}つ`) ?? byJa.get(`${stem}む`) ?? byJa.get(`${stem}ぶ`) ?? byJa.get(`${stem}ぐ`);
    if (hit) return { entry: hit, mark: suffix.mark };
  }
  return null;
}

const PARTICLE = new Set(["は", "が", "を", "に", "へ", "で", "の", "と", "も", "から", "まで", "より", "か", "ね", "よ", "や"]);

type Piece = { en: string; ja: string; pos: string; mark: string; particle?: string; lex?: Lex };

function scanJa(text: string): { pieces: Piece[]; unknown: string[] } {
  const pieces: Piece[] = [];
  const unknown: string[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/\s|、|。|！|？|,|\.|!|\?/.test(ch)) {
      i += 1;
      continue;
    }
    let found: { entry: Lex; mark: string; len: number } | null = null;
    for (const key of JA_KEYS) {
      if (!text.startsWith(key, i)) continue;
      const hit = lookupSurface(key);
      if (hit) {
        found = { ...hit, len: key.length };
        break;
      }
    }
    if (!found) {
      const rest = text.slice(i);
      for (let len = Math.min(14, rest.length); len > 1; len -= 1) {
        const hit = lookupSurface(rest.slice(0, len));
        if (hit) {
          found = { ...hit, len };
          break;
        }
      }
    }
    if (found) {
      pieces.push({ en: found.entry.en, ja: found.entry.ja, pos: found.entry.pos, mark: found.mark, lex: found.entry });
      i += found.len;
      continue;
    }
    if (PARTICLE.has(ch)) {
      pieces.push({ en: "", ja: ch, pos: "助", mark: "", particle: ch });
      i += 1;
      continue;
    }
    unknown.push(ch);
    pieces.push({ en: ch, ja: ch, pos: "?", mark: "" });
    i += 1;
  }
  return { pieces, unknown };
}

function verbal(en: string, mark: string) {
  if (mark === "past" || mark === "was") return `did ${en}`;
  if (mark === "ing") return `be ${en}ing`;
  if (mark === "not") return `do not ${en}`;
  if (mark === "want to") return `want to ${en}`;
  if (mark === "is") return "is";
  return en;
}

function translateJa(text: string, kind: EnglishKind) {
  const { pieces, unknown } = scanJa(text);
  let subject = "";
  let object = "";
  let verb = "";
  const extra: string[] = [];
  for (let i = 0; i < pieces.length; i += 1) {
    const piece = pieces[i];
    const next = pieces[i + 1];
    if (piece.particle) continue;
    const word = verbal(piece.lex ? glossEn(piece.lex, kind) : piece.en, piece.mark);
    if (next?.particle === "は" || next?.particle === "が") subject = word;
    else if (next?.particle === "を") object = word;
    else if (piece.pos === "動") verb = word;
    else extra.push(word);
  }
  let out = "";
  if (subject && (verb || extra.length)) {
    const polite = kind === "ビジネス" || kind === "学術" ? "" : "";
    if (!verb && extra.length) out = `${subject} ${kind === "日常" ? "is" : "is"} ${extra.join(" ")}`;
    else out = `${subject} ${verb || (kind === "日常" ? "is" : "is")} ${object} ${extra.join(" ")}`.replace(/\s+/g, " ").trim();
    if (polite) out = `${polite} ${out}`;
  } else {
    out = pieces
      .filter((piece) => !piece.particle)
      .map((piece) => verbal(piece.lex ? glossEn(piece.lex, kind) : piece.en, piece.mark))
      .join(" ");
  }
  out = restyle(out, kind);
  if (kind === "ビジネス" && !/please|kindly|thank/i.test(out)) out = out.replace(/\.$/, "");
  if (/[?？か]$/.test(text.trim()) && !out.endsWith("?")) out = `${out}?`;
  return { out: out.replace(/\s+/g, " ").trim(), unknown };
}

function stemEn(word: string) {
  const lower = word.toLowerCase();
  if (byEn.has(lower)) return lower;
  if (lower.endsWith("ies") && byEn.has(`${lower.slice(0, -3)}y`)) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("ing") && byEn.has(lower.slice(0, -3))) return lower.slice(0, -3);
  if (lower.endsWith("ed") && byEn.has(lower.slice(0, -2))) return lower.slice(0, -2);
  if (lower.endsWith("es") && byEn.has(lower.slice(0, -2))) return lower.slice(0, -2);
  if (lower.endsWith("s") && byEn.has(lower.slice(0, -1))) return lower.slice(0, -1);
  return lower;
}

const EN_FUNC: Record<string, string> = {
  i: "私",
  you: "あなた",
  he: "彼",
  she: "彼女",
  we: "私たち",
  they: "彼ら",
  it: "それ",
  this: "これ",
  that: "それ",
  these: "これら",
  those: "それら",
  a: "",
  an: "",
  the: "",
  is: "です",
  am: "です",
  are: "です",
  was: "でした",
  were: "でした",
  be: "である",
  not: "ない",
  and: "と",
  or: "または",
  of: "の",
  to: "に",
  in: "で",
  on: "に",
  for: "のために",
  with: "と",
  from: "から",
  at: "で",
  by: "によって",
  my: "私の",
  your: "あなたの",
  his: "彼の",
  her: "彼女の",
  our: "私たちの",
  their: "彼らの",
  please: "ください",
  yes: "はい",
  no: "いいえ",
};

function jaStyle(core: string, kind: EnglishKind) {
  if (!core) return core;
  if (kind === "日常") return core.replace(/です$/, "だ").replace(/ください$/, "くれ");
  if (kind === "ビジネス" || kind === "学術" || kind === "医療") {
    if (!/です|ます|ください|だ$/.test(core)) return `${core}です`;
  }
  return core;
}

function translateEn(text: string, kind: EnglishKind): { out: string; unknown: string[] } {
  const cleaned = text.trim().replace(/[.?!]+$/g, "");
  const am = cleaned.match(/^i am (.+)$/i);
  if (am) return { out: jaStyle(`私は${translateEn(am[1], kind).out}です`, kind), unknown: [] as string[] };
  const is = cleaned.match(/^this is (.+)$/i);
  if (is) return { out: jaStyle(`これは${translateEn(is[1], kind).out}です`, kind), unknown: [] as string[] };
  const where = cleaned.match(/^where is (.+)$/i);
  if (where) return { out: jaStyle(`${translateEn(where[1], kind).out}はどこですか`, kind), unknown: [] as string[] };
  const words = cleaned.split(/[^A-Za-z0-9'-]+/).filter(Boolean);
  const unknown: string[] = [];
  const parts: string[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const pair = `${words[i]} ${words[i + 1] ?? ""}`.toLowerCase();
    const phrase = byEn.get(pair);
    if (phrase) {
      parts.push(phrase.ja);
      i += 1;
      continue;
    }
    const token = words[i];
    const key = stemEn(token);
    const func = EN_FUNC[key];
    if (func !== undefined) {
      if (func) parts.push(func);
      continue;
    }
    const hit = byEn.get(key);
    if (hit) parts.push(hit.ja);
    else {
      unknown.push(token);
      parts.push(token);
    }
  }
  return { out: jaStyle(parts.join(""), kind), unknown };
}

export type TranslateResult = {
  direction: "和→英" | "英→和";
  out: string;
  unknown: string[];
  kind: EnglishKind;
};

export function translate(text: string, kind: EnglishKind = "米語"): TranslateResult {
  const source = text.trim();
  if (!source) return { direction: "和→英", out: "", unknown: [], kind };
  const japanese = /[\u3040-\u30ff\u4e00-\u9fff]/.test(source);
  if (japanese) {
    const result = translateJa(source, kind);
    return { direction: "和→英", out: result.out, unknown: result.unknown, kind };
  }
  const result = translateEn(source, kind);
  return { direction: "英→和", out: result.out, unknown: result.unknown, kind };
}

export const DICT: DictEntry[] = LEX.map((entry) => ({
  ja: entry.ja,
  reading: entry.yomi,
  en: entry.en,
  pos: entry.pos,
  example: entry.alt["日常"] ? `${entry.alt["日常"]} / ${entry.en}` : entry.en,
  cats: entry.cats.length ? entry.cats : ["日常", "米語", "英語"],
}));

export function lookupDict(query: string, kind?: EnglishKind): DictEntry[] {
  const q = query.trim().toLowerCase();
  const pool = kind ? DICT.filter((entry) => entry.cats.includes(kind) || entry.cats.length === 0 || LEX.find((row) => row.ja === entry.ja)?.alt[kind]) : DICT;
  const rows = pool.length ? pool : DICT;
  if (!q) return rows.slice(0, 16);
  return DICT.filter((entry) => {
    const lex = LEX.find((row) => row.ja === entry.ja);
    const alts = lex ? Object.values(lex.alt).join(" ") : "";
    return [entry.ja, entry.reading, entry.en, entry.pos, alts].some((field) => field.toLowerCase().includes(q));
  }).map((entry) => {
    const lex = LEX.find((row) => row.ja === entry.ja);
    if (!kind || !lex) return entry;
    return { ...entry, en: glossEn(lex, kind) };
  });
}

export const GRAMMAR: { title: string; lead: string; points: { h: string; body: string; ex: string }[] }[] = [
  {
    title: "語順",
    lead: "英語は「誰が・どうする・何を」の順です。日本語は動詞が最後に来ます。",
    points: [
      { h: "基本", body: "主語 + 動詞 + 目的語。日本語の「を」の前は、英語では動詞の後です。", ex: "私は水を飲む。 → I drink water." },
      { h: "形容詞", body: "形容詞は名詞の前に置きます。", ex: "赤い車 → a red car" },
    ],
  },
  {
    title: "be動詞",
    lead: "「〜です」は be動詞です。主語で形が変わります。",
    points: [
      { h: "現在", body: "I am / you are / he・she・it is / we・they are。", ex: "これは本です。 → This is a book." },
      { h: "過去", body: "am・is は was、are は were。", ex: "昨日は暑かった。 → It was hot yesterday." },
    ],
  },
  {
    title: "冠詞",
    lead: "a と the は日本語に無い目印です。",
    points: [
      { h: "a / an", body: "初めて出す1つのもの。母音の音の前は an。", ex: "a book / an apple" },
      { h: "the", body: "どれか分かっているもの。", ex: "the station（その駅）" },
    ],
  },
  {
    title: "時制",
    lead: "いつかは動詞の形で示します。",
    points: [
      { h: "現在", body: "ふだんのことは原形。he/she/it は語尾に s。", ex: "She reads." },
      { h: "進行", body: "be + 動詞ing で「今している」。", ex: "I am reading." },
      { h: "過去", body: "規則動詞は ed。eat→ate のように不規則なものもあります。", ex: "I walked." },
    ],
  },
  {
    title: "疑問と否定",
    lead: "聞くときは do や be を前に出します。打ち消すときは not です。",
    points: [
      { h: "疑問", body: "Do you ...? / Are you ...? / Where is ...?", ex: "どこですか。 → Where is it?" },
      { h: "否定", body: "do not (don't) + 原形、または be not。", ex: "I do not know." },
    ],
  },
  {
    title: "前置詞",
    lead: "に・で・から は前置詞に分かれます。動詞とのセットで覚えます。",
    points: [
      { h: "場所", body: "in は中、on は上、at は点。", ex: "at the station / in the room" },
      { h: "方向", body: "to は向かう先、from は起点。", ex: "from Tokyo to Osaka" },
    ],
  },
  {
    title: "助動詞",
    lead: "can / will / should の後は動詞の原形です。",
    points: [
      { h: "can", body: "できる。", ex: "I can swim." },
      { h: "will", body: "これからする。", ex: "I will go tomorrow." },
      { h: "should", body: "した方がよい。ビジネスでは丁寧な提案になります。", ex: "You should rest." },
    ],
  },
  {
    title: "種類で言い方が変わる",
    lead: "同じ意味でも、選んだ英語の種類で単語と丁寧さが変わります。",
    points: [
      { h: "日常とビジネス", body: "日常は hi / thanks。ビジネスは good morning / thank you。", ex: "ありがとう → thanks / thank you" },
      { h: "米語と英語", body: "color と colour、elevator と lift のように綴りや単語が違います。", ex: "色 → color / colour" },
      { h: "学術・IT・医療", body: "一般語より、その分野の語を優先します。", ex: "問題 → problem / issue / symptom の場による" },
    ],
  },
];
