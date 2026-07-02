/* =====================================================================
   AI駆動開発ナレッジ  ::  app.js
   用語データ / ローダー / 星座ネットワーク / スクロール演出 / 信頼度メーター / 用語集
   ===================================================================== */
"use strict";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------------
   1. 用語データ（インラインのホバーと用語集で共有）
   --------------------------------------------------------------------- */
const TERMS = {
  prompt:     ["プロンプト", "prompt", "AIへの指示文・お願いの文章。「このバグを直して」などの入力すべてがプロンプトです。"],
  impl:       ["実装", "implementation", "設計や指示をもとに、実際に動くコードを書くこと。"],
  spec:       ["仕様", "spec", "そのプログラムが「何を・どう動くべきか」を決めた取り決めのこと。"],
  rulefile:   ["ルールファイル", "rule file", "AIに毎回読ませる「指示書（社内ルール集）」のようなファイル。CLAUDE.md などが代表例で、書いた内容をAIは作業の前提として扱います。"],
  domain:     ["ドメイン固有のルール", "domain-specific", "プロジェクト全体ではなく、「決済まわり」「ユーザー管理まわり」など特定の分野だけに当てはまるルールのこと。"],
  secret:     ["機密情報", "secret", "外部に漏れてはいけない大事な情報。パスワード、APIキー、個人情報など。"],
  apikey:     ["APIキー / トークン", "API key", "外部サービスを使うための「鍵（パスワードのようなもの）」。漏れると不正利用の危険があります。"],
  dotenv:     [".env", "dotenv", "APIキーなどの機密情報をまとめて書く設定ファイル（env = environment＝環境）。中身は秘密にすべきものです。"],
  context:    ["コンテキスト", "context", "AIがその会話で見えている情報の範囲。渡したファイルや会話履歴など、「AIの作業机の上に広げた資料」とイメージするとわかりやすいです。"],
  injection:  ["プロンプトインジェクション", "prompt injection", "外部から取り込んだ文章にこっそり紛れた指示に、AIが従ってしまう攻撃。外部の文章は「ただのデータ」として扱わせるのが対策です。"],
  allowlist:  ["許可/拒否リスト", "allow/deny list", "「実行してOK」「絶対ダメ」をあらかじめ決めておく一覧。rm（削除）や git push などの危険な命令を拒否しておきます。"],
  lib:        ["ライブラリ / パッケージ", "library / package", "他の人が作った便利な部品（プログラムのまとまり）。取り込んで使うことで開発が速くなります。"],
  pkghallu:   ["パッケージハルシネーション", "package hallucination", "AIが実在しない部品名をもっともらしく作り出す現象。その名前を悪用した不正な部品が用意されていると被害につながる危険があります。"],
  db:         ["データベース（DB）", "database", "データを整理して保存しておく入れ物。表計算ソフトの表が集まったものをイメージするとわかりやすいです。"],
  table:      ["テーブル / カラム", "table / column", "テーブルは1つの表、カラムはその列＝項目。例: 「社員テーブル」に「名前」「入社日」などのカラムがある。"],
  schema:     ["スキーマ", "schema", "データベースの構造（どんなテーブルや列があるか）の設計図のこと。"],
  migration:  ["マイグレーションファイル", "migration file", "データベースの構造を変更するための「手順書」。内容を間違えると既存データが壊れたり消えたりすることがあります。"],
  diff:       ["差分（diff）", "diff", "変更の前と後で「どこがどう変わったか」を並べて見られるもの。"],
  refactor:   ["リファクタリング", "refactoring", "動きを変えずに、コードを整理して読みやすくすること。頼んでいないのに大量にやられると差分が増えて確認が大変になります。"],
  dod:        ["完了の定義（DoD）", "Definition of Done", "「ここまでできたら完成」という基準。決めておくと、何をもって終わりとするかが明確になります。"],
  test:       ["テスト", "test", "プログラムが正しく動くかを自動で確認するための、もう一つのプログラム。"],
  regression: ["リグレッションテスト", "regression test", "「前に直した不具合が、また再発していないか」を確認するテスト。"],
  branch:     ["ブランチ", "branch", "本番に影響を与えずに作業するための「分かれ道（作業用のコピー）」。試して問題なければ本体に合流させます。"],
  commit:     ["コミット", "commit", "変更を記録する操作（ゲームのセーブのようなもの）。"],
  forcepush:  ["force-push", "force-push", "履歴を強制的に上書きする操作。他の人の変更を消してしまう危険があるため、安易に使わせません。"],
  pr:         ["PR（プルリクエスト）", "pull request", "「この変更を取り込んでください」とチームにお願いし、レビューしてもらうための申請。"],
  merge:      ["マージ", "merge", "作業用ブランチの変更を、本体に合流（統合）させること。"],
  hallu:      ["ハルシネーション", "hallucination", "AIが、事実でないことを「もっともらしく」答えてしまう現象（AIの“思い込み・作り話”）。"],
  api:        ["API / 関数", "API / function", "API は外部の機能を呼び出す窓口、関数はひとまとまりの処理に名前をつけたもの。どちらも「呼ぶと何かしてくれる部品」と考えてOK。"],
  mcp:        ["MCP", "Model Context Protocol", "AIを外部のツールや情報源につなぐ仕組み。これを使うと、AIに最新の公式情報などを参照させられます。"],
  claudecode: ["Claude Code", "Claude Code", "Anthropic の Claude を使って、コマンド操作でコーディングを任せられるツール。"],
  token:      ["トークン", "token", "AIが文章を処理するときの細かい単位（おおまかには「文字数のようなもの」）。利用量や料金、コスト削減に関わります。"],
  model:      ["モデル", "model", "AIの「頭脳」の種類。賢くて高価なものから、軽くて安いものまで複数あります。"],
  routing:    ["モデルルーティング", "model routing", "タスクの難しさやプロンプトの長さに応じて、使うモデルを選び分けること。"],
  crossreview:["クロスレビュー", "cross review", "複数のAIに互いの出力をチェックさせること。人間同士の相互レビューと同じ発想です。"],
  spec_driven:["spec駆動", "spec-driven", "spec＝仕様。先に仕様をきちんと決めてから実装に進む進め方のこと。"],
  slash:      ["カスタムスラッシュコマンド", "custom slash command", "/コマンド名 の形で、自分専用のよく使う指示を呼び出せる機能。"],
  cache:      ["キャッシュ", "cache", "一度処理した内容を一時保存し、次回それを再利用して速度やコストを抑える仕組み。"],
  session:    ["セッション", "session", "AIとの一続きの会話のまとまり。長くなるほど履歴がたまっていきます。"],
  agent:      ["エージェント / サブエージェント", "agent", "自分で考えて手順を進めるAI。サブエージェントは、メインのAIから切り出した補助役のAIです。"],
  errhandle:  ["エラーハンドリング", "error handling", "エラーが起きたときの対処の仕方（どう記録し、利用者に何を表示するか など）。"],
  planmode:   ["計画モード / プランモード", "plan mode", "AIに読み取り・調査だけをさせ、ファイルを変更せずに作業計画を立てさせるモード。計画を承認してから実装に移れるため、意図のズレを未然に防げます。"],
  thinking:   ["拡張思考", "extended thinking", "答える前に、AIに考える過程を長めに取らせること。難しい設計やバグ調査で精度が上がりますが、その分トークン（コスト）と時間を多く使います。"],
  worktree:   ["Git worktree", "git worktree", "1つのリポジトリから複数の作業フォルダを切り出す仕組み。別々のタスクを同時並行で進めても、互いに干渉しません。"],
  multimodal: ["マルチモーダル / 画像入力", "multimodal", "文章だけでなく画像なども一緒に扱えること。エラー画面やデザインのスクリーンショットを渡して、状況を素早く正確に伝えられます。"],
  checkpoint: ["チェックポイント / 巻き戻し", "checkpoint / rewind", "AIがファイルを変更する前の状態を自動で記録しておく仕組み。Claude Code では /rewind でコードや会話を変更前の状態に戻せます。正式なバージョン管理（コミット）の代わりではなく、作業中の安全網です。"],
};

/* ---------------------------------------------------------------------
   2. インライン用語ツールホバー / フォーカス / タップ
   --------------------------------------------------------------------- */
(function tooltips(){
  const tip   = document.getElementById("tip");
  const tTerm = document.getElementById("tip-term");
  const tRead = document.getElementById("tip-read");
  const tDef  = document.getElementById("tip-def");
  let activeEl = null;

  function fill(key){
    const d = TERMS[key];
    if(!d) return false;
    tTerm.textContent = d[0];
    tRead.textContent = d[1] && d[1] !== d[0] ? d[1] : "";
    tDef.textContent  = d[2];
    return true;
  }
  function place(el){
    const r = el.getBoundingClientRect();
    tip.classList.add("show");           // measure after show
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let left = r.left + r.width/2 - w/2;
    left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
    let top = r.top - h - 12;
    if(top < 12) top = r.bottom + 12;    // flip below if no room above
    tip.style.left = left + "px";
    tip.style.top  = top + "px";
  }
  function show(el){
    if(!fill(el.dataset.t)) return;
    activeEl = el;
    place(el);
  }
  function hide(){ tip.classList.remove("show"); activeEl = null; }

  document.querySelectorAll(".term").forEach(el=>{
    el.setAttribute("tabindex","0");
    el.addEventListener("mouseenter",()=>show(el));
    el.addEventListener("mouseleave",hide);
    el.addEventListener("focus",()=>show(el));
    el.addEventListener("blur",hide);
    // touch: tap toggles
    el.addEventListener("click",(e)=>{
      e.preventDefault();
      if(activeEl===el){hide();} else {show(el);}
    });
  });
  document.addEventListener("click",(e)=>{
    if(activeEl && !e.target.closest(".term")) hide();
  });
  window.addEventListener("scroll",()=>{ if(activeEl) place(activeEl); },{passive:true});
})();

/* ---------------------------------------------------------------------
   3. ローダー（canvas 2D のニューラルネット起動演出）
   --------------------------------------------------------------------- */
(function loader(){
  const loader = document.getElementById("loader");
  const fill   = document.getElementById("loader-fill");
  const status = document.getElementById("loader-status");
  const cv     = document.getElementById("loader-canvas");
  const ctx    = cv.getContext("2d");
  const msgs = ["connecting nodes","loading rules","building context","syncing","ready"];

  let W,H,dpr;
  function resize(){
    dpr = Math.min(window.devicePixelRatio||1,2);
    W = cv.width  = innerWidth*dpr;
    H = cv.height = innerHeight*dpr;
    cv.style.width = innerWidth+"px"; cv.style.height = innerHeight+"px";
  }
  resize(); addEventListener("resize",resize);

  // floating nodes
  const N = REDUCED ? 18 : 46;
  const nodes = Array.from({length:N},()=>({
    x:Math.random()*W, y:Math.random()*H,
    vx:(Math.random()-.5)*0.25*dpr, vy:(Math.random()-.5)*0.25*dpr, lit:0
  }));

  let progress = 0, raf;
  function draw(){
    ctx.clearRect(0,0,W,H);
    const maxd = 150*dpr;
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i];
      a.x+=a.vx; a.y+=a.vy;
      if(a.x<0||a.x>W)a.vx*=-1;
      if(a.y<0||a.y>H)a.vy*=-1;
      a.lit += (Math.random()<0.02?1:-0.02); a.lit=Math.max(0,Math.min(1,a.lit));
      for(let j=i+1;j<nodes.length;j++){
        const b=nodes[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.hypot(dx,dy);
        if(dist<maxd){
          const o=(1-dist/maxd)*0.32*(progress/100);
          ctx.strokeStyle=`rgba(78,96,118,${o})`;
          ctx.lineWidth=dpr*.5;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    for(const n of nodes){
      ctx.beginPath();
      ctx.arc(n.x,n.y,(1.3+n.lit*1.5)*dpr,0,7);
      ctx.fillStyle = n.lit>.5 ? "rgba(188,74,44,.72)" : "rgba(78,96,118,.5)";
      ctx.fill();
    }
    raf=requestAnimationFrame(draw);
  }
  draw();

  function step(){
    progress += Math.random()*9 + 3;
    if(progress>100)progress=100;
    fill.style.width = progress+"%";
    status.textContent = msgs[Math.min(msgs.length-1, Math.floor(progress/100*msgs.length))];
    if(progress<100){ setTimeout(step, 180+Math.random()*220); }
    else { setTimeout(finish, 480); }
  }
  function finish(){
    cancelAnimationFrame(raf);
    loader.classList.add("done");
    document.body.classList.remove("locked");
    setTimeout(()=>{ loader.style.display="none"; }, 850);
    initHero();
    if(window.__lenis) window.__lenis.start();   // ローダー完了後にスムーススクロール開始
  }
  // start（同一セッション内の再訪時は演出を短縮し、すぐ本文へ）
  let seen = false;
  try{
    seen = sessionStorage.getItem("aidk-visited") === "1";
    sessionStorage.setItem("aidk-visited", "1");
  }catch(e){ /* プライベートモード等で storage 不可なら毎回フル演出 */ }
  if(seen){
    progress = 100;
    fill.style.width = "100%";
    status.textContent = msgs[msgs.length-1];
    setTimeout(finish, 220);
  } else {
    setTimeout(step, 350);
  }
})();

/* ---------------------------------------------------------------------
   4. ヒーロー :: 星座ネットワーク（constellation / neural graph）
   漂うノードが近づくと細い線で結ばれ、離れると切れる「生きた知識グラフ」。
   カーソル付近ではノードが引き寄せられ、朱の線で結ばれて明滅する。
   ローダーのニューラルネット演出と同じ発想で、世界観を一続きにする。
   2D canvas のみで動作（three.js 不要）。
   --------------------------------------------------------------------- */
function initHero(){
  const canvas = document.getElementById("bg-canvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, dpr, cw, ch;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = innerWidth; ch = innerHeight;
    W = canvas.width  = Math.round(cw * dpr);
    H = canvas.height = Math.round(ch * dpr);
    canvas.style.width = cw + "px"; canvas.style.height = ch + "px";
  }
  resize();

  // ---- ノード生成（画面面積に応じた密度） ----
  let nodes = [];
  function build(){
    let n = Math.round((cw * ch) / 13000);
    n = Math.max(42, Math.min(REDUCED ? 60 : 150, n));
    nodes = Array.from({length:n}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: REDUCED ? 0 : (Math.random()-.5)*0.22*dpr,
      vy: REDUCED ? 0 : (Math.random()-.5)*0.22*dpr,
      r:  Math.random()*1.3 + 0.8,   // 基本半径（CSS px）
      rust: Math.random() < 0.12,     // 一部を朱のノードに
      lit: Math.random()*0.4          // 明滅の度合い
    }));
  }
  build();
  window.addEventListener("resize", () => { resize(); build(); });

  // ---- 操作 ----
  const LINK  = 150 * dpr;   // ノード同士が結ばれる距離
  const MOUSE = 190 * dpr;   // カーソルの影響範囲
  let mxr = -1e9, myr = -1e9;
  window.addEventListener("mousemove",  (e)=>{ mxr = e.clientX*dpr; myr = e.clientY*dpr; });
  window.addEventListener("mouseleave", ()=>{ mxr = -1e9; myr = -1e9; });

  let scrollFactor = 0;
  window.addEventListener("scroll", ()=>{ scrollFactor = Math.min(1, window.scrollY/innerHeight); }, {passive:true});

  // ---- 描画 ----
  const link2  = LINK*LINK;
  const mouse2 = MOUSE*MOUSE;
  function render(alpha){
    ctx.clearRect(0,0,W,H);
    if(alpha <= 0.001) return;

    // 移動 + 明滅 + カーソル引力
    for(const a of nodes){
      a.x += a.vx; a.y += a.vy;
      if(a.x < 0 || a.x > W) a.vx *= -1;
      if(a.y < 0 || a.y > H) a.vy *= -1;
      const dxm = mxr-a.x, dym = myr-a.y, dm2 = dxm*dxm + dym*dym;
      if(dm2 < mouse2){
        const f = (1 - Math.sqrt(dm2)/MOUSE);
        a.x += dxm * f * 0.010;
        a.y += dym * f * 0.010;
        a.lit = Math.min(1, a.lit + 0.05*f);
      } else if(!REDUCED){
        a.lit += ((Math.random() < 0.012 ? 0.7 : 0) - a.lit) * 0.03;
      }
    }

    // ノード間の結線
    ctx.lineWidth = dpr * 0.6;
    for(let i=0;i<nodes.length;i++){
      const a = nodes[i];
      for(let j=i+1;j<nodes.length;j++){
        const b = nodes[j], dx = a.x-b.x, dy = a.y-b.y, d2 = dx*dx + dy*dy;
        if(d2 < link2){
          const o = (1 - Math.sqrt(d2)/LINK) * 0.5 * alpha;
          ctx.strokeStyle = `rgba(78,96,118,${o})`;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
      // カーソルへの結線（朱）
      const dxm = mxr-a.x, dym = myr-a.y, dm2 = dxm*dxm + dym*dym;
      if(dm2 < mouse2){
        const o = (1 - Math.sqrt(dm2)/MOUSE) * 0.5 * alpha;
        ctx.strokeStyle = `rgba(188,74,44,${o})`;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mxr,myr); ctx.stroke();
      }
    }

    // ノード本体
    for(const a of nodes){
      const rr = (a.r + a.lit*1.4) * dpr;
      ctx.beginPath();
      ctx.arc(a.x, a.y, rr, 0, 6.2832);
      if(a.rust || a.lit > 0.6){
        ctx.fillStyle = `rgba(188,74,44,${(0.5 + a.lit*0.4) * alpha})`;
      } else {
        ctx.fillStyle = `rgba(78,96,118,${(0.42 + a.lit*0.4) * alpha})`;
      }
      ctx.fill();
    }
  }

  // ---- 実行 ----
  if(REDUCED){
    render(0.9);   // 静止した星座を一度だけ描く
    return;
  }
  let fade = 0, rafId = null, running = false;
  function frame(){
    fade += (1 - fade) * 0.02;                       // 初期フェードイン
    render(fade * (1 - scrollFactor*0.92));           // スクロールで退場
    rafId = requestAnimationFrame(frame);
  }
  function start(){ if(!running){ running = true; frame(); } }
  function stop(){ running = false; if(rafId){ cancelAnimationFrame(rafId); rafId = null; } }

  // ヒーローが画面外にある間はループを完全停止し、本文スクロール中の負荷をゼロにする。
  // #bg-canvas は position:absolute なので、ヒーローを通り過ぎると自然に非表示になる。
  if("IntersectionObserver" in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=> en.isIntersecting ? start() : stop());
    }, {threshold:0});
    io.observe(canvas);
  } else {
    start();
  }
}

/* ---------------------------------------------------------------------
   5. スクロール演出（reveal + progress bar + active nav）
   --------------------------------------------------------------------- */
(function scrollFx(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target);} });
  },{threshold:0.12, rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  const bar = document.getElementById("progress");
  const onScroll = ()=>{
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h>0 ? (scrollY/h*100) : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  // active nav highlight
  const links = [...document.querySelectorAll(".top nav a")];
  const map = {};
  links.forEach(a=>{ const id=a.getAttribute("href").slice(1); const t=document.getElementById(id); if(t) map[id]={a,t}; });
  const navIO = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      const id=en.target.id, m=map[id];
      if(m && en.isIntersecting){
        links.forEach(l=>l.style.color="");
        m.a.style.color="var(--accent-2)";
      }
    });
  },{threshold:0.4});
  Object.values(map).forEach(m=>navIO.observe(m.t));
})();

/* ---------------------------------------------------------------------
   6. 信頼度メーター（シグネチャー）
   --------------------------------------------------------------------- */
(function trustMeter(){
  const range = document.getElementById("trust-range");
  const knob  = document.getElementById("trust-knob");
  const h     = document.getElementById("trust-h");
  const p     = document.getElementById("trust-p");
  if(!range) return;

  const states = [
    {max:33, color:"var(--warm)",     h:"確認作業が多すぎる",
     p:"出力を疑いすぎると、確認に時間がかかりAIを使うメリットが小さくなります。スライダーを右へ動かしてみましょう。"},
    {max:67, color:"var(--accent-2)", h:"ちょうどいい — 出力は「たたき台」",
     p:"AIの出力を下書き・補助的な提案として受け取り、最終判断は人間が行う。重要・複雑な処理はレビューを必須に。これが基本姿勢です。"},
    {max:101,color:"var(--warm)",     h:"信用しすぎ",
     p:"出力をそのまま採用すると、不具合や設計上の問題を見逃したまま開発が進むリスク。ハルシネーションの裏取りやクロスレビューを忘れずに。"},
  ];
  function update(){
    const v = +range.value;
    knob.style.left = v + "%";
    const s = states.find(s=>v<s.max) || states[1];
    h.textContent = s.h; h.style.color = s.color;
    knob.style.background = s.color;
    p.textContent = s.p;
  }
  range.addEventListener("input", update);
  update();
})();

/* ---------------------------------------------------------------------
   7. 用語集（データから生成 + 検索フィルタ）
   --------------------------------------------------------------------- */
(function glossary(){
  const grid   = document.getElementById("gloss-grid");
  const search = document.getElementById("gsearch");
  const count  = document.getElementById("gcount");
  const empty  = document.getElementById("gempty");
  if(!grid) return;

  const entries = Object.values(TERMS).sort((a,b)=>a[0].localeCompare(b[0],"ja"));
  entries.forEach(([term,read,def])=>{
    const el = document.createElement("div");
    el.className = "gitem";
    el.dataset.search = (term+" "+read+" "+def).toLowerCase();
    el.innerHTML = `<div class="gt">${term}${read&&read!==term?` <span class="gr">${read}</span>`:""}</div><div class="gd">${def}</div>`;
    grid.appendChild(el);
  });
  const items = [...grid.children];
  function setCount(n){ count.textContent = `${n} / ${entries.length} 語`; }
  setCount(entries.length);

  search.addEventListener("input",()=>{
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    items.forEach(el=>{
      const hit = !q || el.dataset.search.includes(q);
      el.classList.toggle("hide", !hit);
      if(hit) shown++;
    });
    setCount(shown);
    empty.classList.toggle("show", shown===0);
  });
})();

/* ---------------------------------------------------------------------
   8. モバイル ハンバーガーメニュー
   ≤760px でナビを全画面パネルとして開閉する。開いている間は Lenis を
   停止して背景スクロールを抑止し、リンク選択で閉じてから（Lenis を再開
   してから）スムーススクロールへ引き継ぐ。この IIFE は smoothScroll より
   先に定義し、リンクの「閉じる」処理が scrollTo より先に走るようにする。
   --------------------------------------------------------------------- */
(function mobileNav(){
  const btn = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");
  if(!btn || !nav) return;

  function setOpen(open){
    document.body.classList.toggle("nav-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    if(window.__lenis){ open ? window.__lenis.stop() : window.__lenis.start(); }
  }

  btn.addEventListener("click", ()=> setOpen(!document.body.classList.contains("nav-open")));
  nav.querySelectorAll("a").forEach(a=> a.addEventListener("click", ()=> setOpen(false)));
  document.addEventListener("keydown", (e)=>{ if(e.key === "Escape") setOpen(false); });
  window.addEventListener("resize", ()=>{ if(innerWidth > 760) setOpen(false); });
})();

/* ---------------------------------------------------------------------
   9. スムーススクロール（Lenis）
   実スクロールを滑らかに補間する。既存のスクロール連動（プログレスバー・
   星座のフェード・ナビハイライト・reveal）は window スクロールを見ている
   ため、そのまま共存する。ローダー表示中は停止し、完了後に開始する。
   --------------------------------------------------------------------- */
(function smoothScroll(){
  if(REDUCED || typeof Lenis === "undefined") return;   // 動きを控える設定では無効化

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t)=> (t === 1 ? 1 : 1 - Math.pow(2, -10*t)),  // なめらかな減速
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.4
  });
  window.__lenis = lenis;
  lenis.stop();                                          // ローダー完了まで停止（finish で start）

  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // ページ内アンカー（ナビ・CTA・章マップ等）を Lenis 経由でスムーズに
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click",(e)=>{
      const href = a.getAttribute("href");
      if(!href || href === "#") return;
      const target = document.querySelector(href);
      if(!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    });
  });
})();
