
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tanomi — 外注管理システム</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue-50:#E6F1FB;--blue-100:#B5D4F4;--blue-200:#85B7EB;
  --blue-400:#378ADD;--blue-600:#185FA5;--blue-800:#0C447C;--blue-900:#042C53;
  --teal-50:#E1F5EE;--teal-400:#1D9E75;--teal-600:#0F6E56;
  --gray-50:#F1EFE8;--gray-100:#D3D1C7;--gray-200:#B4B2A9;--gray-400:#888780;
  --amber-50:#FAEEDA;--amber-400:#BA7517;
  --text-primary:#1a1a1a;--text-secondary:#4a5568;--text-muted:#9ca3af;
  --radius-sm:8px;--radius-md:12px;--radius-lg:20px;--radius-xl:28px;
}
body{font-family:'Noto Sans JP',sans-serif;color:var(--text-primary);background:#fff;line-height:1.7;overflow-x:hidden}

/* HERO */
.hero{
  min-height:100vh;
  background:linear-gradient(160deg,#f0f7ff 0%,#e6f1fb 40%,#d4eaf8 100%);
  display:flex;align-items:center;
  padding:80px 24px 60px;
  position:relative;overflow:hidden;
}
.hero::before{
  content:'';position:absolute;right:-200px;top:-100px;
  width:700px;height:700px;border-radius:50%;
  background:radial-gradient(circle,rgba(55,138,221,0.12) 0%,transparent 70%);
  pointer-events:none;
}
.hero::after{
  content:'';position:absolute;right:5%;bottom:0;
  width:600px;height:550px;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 500'%3E%3Crect x='20' y='20' width='560' height='460' rx='16' fill='white' opacity='0.9'/%3E%3Crect x='40' y='48' width='200' height='14' rx='4' fill='%23E6F1FB'/%3E%3Crect x='40' y='72' width='140' height='10' rx='3' fill='%23B5D4F4' opacity='0.7'/%3E%3Crect x='40' y='100' width='520' height='1' rx='1' fill='%23E5E7EB'/%3E%3Crect x='40' y='124' width='100' height='28' rx='6' fill='%23E6F1FB'/%3E%3Crect x='156' y='124' width='100' height='28' rx='6' fill='%23F1EFE8'/%3E%3Crect x='272' y='124' width='100' height='28' rx='6' fill='%23F1EFE8'/%3E%3Crect x='40' y='172' width='520' height='56' rx='10' fill='%23F9FAFB'/%3E%3Ccircle cx='68' cy='200' r='14' fill='%23B5D4F4'/%3E%3Crect x='94' y='188' width='120' height='10' rx='3' fill='%23D3D1C7'/%3E%3Crect x='94' y='204' width='80' height='8' rx='2' fill='%23E5E7EB'/%3E%3Crect x='440' y='191' width='60' height='18' rx='5' fill='%23E1F5EE'/%3E%3Crect x='40' y='240' width='520' height='56' rx='10' fill='%23F9FAFB'/%3E%3Ccircle cx='68' cy='268' r='14' fill='%23FAC775' opacity='0.8'/%3E%3Crect x='94' y='256' width='140' height='10' rx='3' fill='%23D3D1C7'/%3E%3Crect x='94' y='272' width='80' height='8' rx='2' fill='%23E5E7EB'/%3E%3Crect x='440' y='259' width='60' height='18' rx='5' fill='%23FAEEDA'/%3E%3Crect x='40' y='308' width='520' height='56' rx='10' fill='%23F9FAFB'/%3E%3Ccircle cx='68' cy='336' r='14' fill='%23B5D4F4'/%3E%3Crect x='94' y='324' width='100' height='10' rx='3' fill='%23D3D1C7'/%3E%3Crect x='94' y='340' width='60' height='8' rx='2' fill='%23E5E7EB'/%3E%3Crect x='440' y='327' width='60' height='18' rx='5' fill='%23E1F5EE'/%3E%3Crect x='40' y='384' width='160' height='44' rx='10' fill='%23185FA5'/%3E%3Crect x='216' y='384' width='120' height='44' rx='10' fill='%23F1EFE8'/%3E%3Crect x='68' y='399' width='104' height='14' rx='3' fill='white' opacity='0.9'/%3E%3C/svg%3E") no-repeat center bottom;
  background-size:contain;
  pointer-events:none;
}
.hero-inner{max-width:560px;z-index:1;position:relative}
.badge{
  display:inline-flex;align-items:center;gap:6px;
  background:white;border:1px solid var(--blue-100);
  color:var(--blue-800);font-size:12px;font-weight:700;
  padding:6px 14px;border-radius:40px;margin-bottom:28px;
  letter-spacing:0.04em;
}
.badge-dot{width:7px;height:7px;border-radius:50%;background:var(--teal-400)}
.hero h1{
  font-size:clamp(28px,4.5vw,42px);font-weight:900;line-height:1.35;
  color:var(--blue-900);margin-bottom:20px;
  letter-spacing:-0.02em;
}
.hero h1 span{color:var(--blue-600)}
.hero .lead{
  font-size:16px;color:var(--text-secondary);line-height:1.9;
  margin-bottom:40px;
}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap}
.btn-primary{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--blue-600);color:white;
  padding:16px 32px;border-radius:var(--radius-md);
  font-size:15px;font-weight:700;text-decoration:none;
  transition:transform .15s,box-shadow .15s;
  box-shadow:0 4px 20px rgba(24,95,165,0.3);
  font-family:'Noto Sans JP',sans-serif;
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(24,95,165,0.35)}
.btn-ghost{
  display:inline-flex;align-items:center;gap:6px;
  background:white;color:var(--blue-800);border:1.5px solid var(--blue-200);
  padding:15px 24px;border-radius:var(--radius-md);
  font-size:14px;font-weight:600;text-decoration:none;
  transition:background .15s;
  font-family:'Noto Sans JP',sans-serif;
}
.btn-ghost:hover{background:var(--blue-50)}
.stats-row{
  display:flex;gap:32px;margin-top:52px;padding-top:40px;
  border-top:1px solid rgba(24,95,165,0.12);
  flex-wrap:wrap;
}
.stat-item .num{font-size:28px;font-weight:900;color:var(--blue-800);font-family:'DM Sans',sans-serif}
.stat-item .lbl{font-size:12px;color:var(--text-muted);margin-top:2px}

/* NAV */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);
  border-bottom:1px solid rgba(229,231,235,0.6);
  padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;
}
.nav-logo{font-size:18px;font-weight:900;color:var(--blue-800);letter-spacing:-0.02em}
.nav-cta{
  background:var(--blue-600);color:white;padding:9px 20px;
  border-radius:var(--radius-sm);font-size:13px;font-weight:700;
  text-decoration:none;font-family:'Noto Sans JP',sans-serif;
}

/* SECTIONS */
section{padding:96px 24px}
.inner{max-width:860px;margin:0 auto}
.section-eyebrow{
  font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
  color:var(--blue-600);margin-bottom:12px;
}
.section-title{
  font-size:clamp(22px,3.5vw,30px);font-weight:900;
  color:var(--blue-900);margin-bottom:16px;letter-spacing:-0.02em;line-height:1.4;
}
.section-sub{font-size:15px;color:var(--text-secondary);margin-bottom:52px;line-height:1.8;max-width:520px}

/* PAIN */
.pain-section{background:#fafaf8}
.pain-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:48px}
.pain-card{
  background:white;border-radius:var(--radius-md);padding:24px;
  border:1px solid #eee;
  display:flex;gap:14px;align-items:flex-start;
}
.pain-icon{
  width:36px;height:36px;border-radius:8px;background:var(--blue-50);
  flex-shrink:0;display:flex;align-items:center;justify-content:center;
  font-size:16px;
}
.pain-card p{font-size:14px;line-height:1.7;color:var(--text-secondary);margin:0}
.pain-card strong{display:block;font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:4px}

/* SOLUTION */
.solution-section{background:var(--blue-900);color:white}
.solution-section .section-eyebrow{color:var(--blue-200)}
.solution-section .section-title{color:white}
.solution-section .section-sub{color:rgba(255,255,255,0.65)}
.sol-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.sol-card{
  background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
  border-radius:var(--radius-md);padding:28px 24px;
}
.sol-num{font-size:13px;font-weight:700;color:var(--blue-200);margin-bottom:12px;font-family:'DM Sans',sans-serif}
.sol-card h3{font-size:16px;font-weight:700;margin-bottom:10px;color:white}
.sol-card p{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;margin:0}
.sol-icon{
  width:44px;height:44px;background:rgba(55,138,221,0.2);
  border-radius:10px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;
  font-size:20px;
}

/* FEATURES */
.feature-list{display:flex;flex-direction:column;gap:0}
.feature-item{
  display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;
  padding:72px 0;border-bottom:1px solid #f0f0f0;
}
.feature-item:last-child{border-bottom:none}
.feature-item.reverse{direction:rtl}
.feature-item.reverse > *{direction:ltr}
.feature-eyebrow{
  font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
  color:var(--teal-600);margin-bottom:14px;
}
.feature-title{font-size:22px;font-weight:900;color:var(--blue-900);margin-bottom:14px;line-height:1.4}
.feature-desc{font-size:14px;color:var(--text-secondary);line-height:1.9;margin-bottom:20px}
.feature-tag{
  display:inline-flex;align-items:center;gap:5px;
  background:var(--teal-50);color:var(--teal-600);
  font-size:12px;font-weight:700;padding:4px 12px;border-radius:30px;
}
.mock-container{
  background:var(--blue-50);border-radius:var(--radius-lg);padding:20px;
  position:relative;overflow:hidden;
}
.mock-screen{
  background:white;border-radius:var(--radius-md);
  border:1px solid #e5e7eb;overflow:hidden;
  box-shadow:0 8px 32px rgba(0,0,0,0.08);
}
.mock-bar{background:#f5f5f5;padding:10px 16px;display:flex;gap:6px;align-items:center}
.mock-dot{width:8px;height:8px;border-radius:50%}
.mock-body{padding:16px}
/* mini table in mock */
.mini-tbl{width:100%;border-collapse:collapse;font-size:12px}
.mini-tbl th{background:#f9fafb;padding:8px 10px;text-align:left;font-weight:600;color:var(--text-secondary);border-bottom:1px solid #f0f0f0}
.mini-tbl td{padding:9px 10px;border-bottom:1px solid #f8f8f8;color:var(--text-primary)}
.status-pill{
  padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;
}
.status-active{background:#dcfce7;color:#15803d}
.status-done{background:#e0f2fe;color:#0369a1}
.status-pending{background:#fef9c3;color:#a16207}

/* PRICE */
.price-section{background:var(--gray-50)}
.price-card{
  background:white;border-radius:var(--radius-xl);padding:48px;
  border:1px solid #e5e7eb;
  display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center;
}
.price-label{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px}
.price-amount{font-size:48px;font-weight:900;color:var(--blue-900);font-family:'DM Sans',sans-serif;line-height:1}
.price-sub{font-size:14px;color:var(--text-muted);margin-top:8px}
.price-features{list-style:none;margin-top:32px;display:flex;flex-direction:column;gap:10px}
.price-features li{display:flex;gap:10px;font-size:14px;color:var(--text-secondary)}
.check{width:18px;height:18px;border-radius:50%;background:var(--teal-50);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--teal-600);margin-top:2px}

/* VOICE */
.voice-section{background:white}
.voice-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
.voice-card{
  background:var(--blue-50);border-radius:var(--radius-md);padding:28px;
  position:relative;
}
.voice-quote{font-size:13px;line-height:1.9;color:var(--text-secondary);margin-bottom:20px}
.voice-author{display:flex;align-items:center;gap:10px}
.voice-avatar{
  width:36px;height:36px;border-radius:50%;background:var(--blue-200);
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:700;color:var(--blue-800);flex-shrink:0;
}
.voice-name{font-size:13px;font-weight:700;color:var(--text-primary)}
.voice-role{font-size:11px;color:var(--text-muted)}
.voice-stars{color:#f59e0b;font-size:12px;margin-bottom:12px}

/* CTA */
.cta-section{
  background:linear-gradient(135deg,var(--blue-900) 0%,var(--blue-800) 100%);
  padding:96px 24px;text-align:center;
}
.cta-section h2{font-size:clamp(24px,4vw,36px);font-weight:900;color:white;margin-bottom:16px;letter-spacing:-0.02em}
.cta-section p{font-size:16px;color:rgba(255,255,255,0.7);margin-bottom:40px;line-height:1.8}
.form-row{
  display:flex;gap:12px;max-width:480px;margin:0 auto;flex-wrap:wrap;justify-content:center;
}
.form-note{font-size:12px;color:rgba(255,255,255,0.4);margin-top:16px}

/* FOOTER */
footer{background:var(--blue-900);padding:40px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.08)}
footer p{font-size:13px;color:rgba(255,255,255,0.3)}

/* DIVIDER */
.section-divider{height:1px;background:#f0f0f0;border:none;margin:0}

@media(max-width:680px){
  .hero::after{display:none}
  .hero-inner{max-width:100%}
  .pain-grid,.sol-cards,.voice-grid{grid-template-columns:1fr}
  .feature-item,.feature-item.reverse{grid-template-columns:1fr;direction:ltr;gap:32px}
  .price-card{grid-template-columns:1fr;gap:32px}
  .stats-row{gap:24px}
}
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">Tanomi</div>
  <a href="#contact" class="nav-cta">無料相談する</a>
</nav>

<!-- HERO -->
<div class="hero" style="padding-top:120px">
  <div class="hero-inner">
    <div class="badge">
      <span class="badge-dot"></span>
      外注管理のDXを、もっとシンプルに
    </div>
    <h1>Excelと紙の外注管理、<br /><span>もう限界</span>じゃないですか。</h1>
    <p class="lead">
      ワーカーの記録・集計・支払いを、クラウドで一元管理。<br />
      月末の憂鬱が、びっくりするほどなくなります。
    </p>
    <div class="hero-actions">
      <a href="#contact" class="btn-primary">まず相談してみる →</a>
      <a href="#features" class="btn-ghost">機能を見る</a>
    </div>
    <div class="stats-row">
      <div class="stat-item">
        <div class="num">80%</div>
        <div class="lbl">集計工数の削減</div>
      </div>
      <div class="stat-item">
        <div class="num">0円</div>
        <div class="lbl">支払い漏れ</div>
      </div>
      <div class="stat-item">
        <div class="num">即日</div>
        <div class="lbl">スマホから入力</div>
      </div>
    </div>
  </div>
</div>

<hr class="section-divider" />

<!-- PAIN -->
<section class="pain-section">
  <div class="inner">
    <div class="section-eyebrow">よくある課題</div>
    <h2 class="section-title">こんなお悩み、ありませんか？</h2>
    <p class="section-sub">外注管理が属人化・複雑化してしまう。多くの会社に共通する悩みです。</p>
    <div class="pain-grid">
      <div class="pain-card">
        <div class="pain-icon">📊</div>
        <div>
          <strong>月末集計が毎回大変</strong>
          <p>ExcelでのSUMIFや集計作業に何時間もかかってしまう</p>
        </div>
      </div>
      <div class="pain-card">
        <div class="pain-icon">📱</div>
        <div>
          <strong>スマホで確認できない</strong>
          <p>PCでしか見られないため、現場でのリアルタイム確認が困難</p>
        </div>
      </div>
      <div class="pain-card">
        <div class="pain-icon">✏️</div>
        <div>
          <strong>後でまとめて記録している</strong>
          <p>その場で入力できずに記憶頼り。入力ミスや漏れが発生しがち</p>
        </div>
      </div>
      <div class="pain-card">
        <div class="pain-icon">🧮</div>
        <div>
          <strong>支払い金額を毎回手計算</strong>
          <p>ワーカーごとに単価が異なり、毎回電卓を叩いて計算している</p>
        </div>
      </div>
      <div class="pain-card">
        <div class="pain-icon">😰</div>
        <div>
          <strong>支払い漏れが怖い</strong>
          <p>確認のために何度もExcelを見直し。担当者の精神的負担が大きい</p>
        </div>
      </div>
      <div class="pain-card">
        <div class="pain-icon">📁</div>
        <div>
          <strong>データが増えると煩雑に</strong>
          <p>ワーカーが増えるほど管理ファイルが肥大化し、もはや誰も全体を把握できない</p>
        </div>
      </div>
    </div>
  </div>
</section>

<hr class="section-divider" />

<!-- SOLUTION -->
<section class="solution-section">
  <div class="inner">
    <div class="section-eyebrow">解決策</div>
    <h2 class="section-title">Tanomiが、まるごと解決します</h2>
    <p class="section-sub">外注管理に必要な機能をすべてクラウドに。どこからでも、スマホ一台で完結します。</p>
    <div class="sol-cards">
      <div class="sol-card">
        <div class="sol-icon">👥</div>
        <div class="sol-num">01</div>
        <h3>ワーカー管理</h3>
        <p>稼働状況・連絡先・単価をまとめて管理。検索も絞り込みも瞬時に。</p>
      </div>
      <div class="sol-card">
        <div class="sol-icon">⚡</div>
        <div class="sol-num">02</div>
        <h3>スマホ実績入力</h3>
        <p>現場でその場で入力。後でまとめる手間が完全になくなります。</p>
      </div>
      <div class="sol-card">
        <div class="sol-icon">💴</div>
        <div class="sol-num">03</div>
        <h3>報酬の自動計算</h3>
        <p>個数と単価を入れるだけ。計算ミスゼロで、支払い金額が自動算出。</p>
      </div>
      <div class="sol-card">
        <div class="sol-icon">✅</div>
        <div class="sol-num">04</div>
        <h3>支払い管理</h3>
        <p>未払い残高をリアルタイムで可視化。「払い忘れ」が構造的になくなる。</p>
      </div>
      <div class="sol-card">
        <div class="sol-icon">📄</div>
        <div class="sol-num">05</div>
        <h3>明細書・CSV出力</h3>
        <p>支払明細書はワンクリックで発行。経理処理にそのまま使えるCSVも出力。</p>
      </div>
      <div class="sol-card">
        <div class="sol-icon">☁️</div>
        <div class="sol-num">06</div>
        <h3>クラウド完結</h3>
        <p>インストール不要。PC・スマホどちらからでも、いつでもアクセス。</p>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section id="features" style="padding:0 24px">
  <div class="inner">
    <div class="feature-list">

      <!-- Feature 1 -->
      <div class="feature-item" style="padding-top:96px">
        <div>
          <div class="feature-eyebrow">ワーカー管理</div>
          <h3 class="feature-title">すべてのワーカー情報を、<br />一画面で把握</h3>
          <p class="feature-desc">
            氏名・連絡先・単価・稼働状態をまとめて管理。フィルタリングや検索で、必要な情報にすぐアクセスできます。Excelの迷子になる時代は終わりです。
          </p>
          <span class="feature-tag">✓ 稼働状態の切り替えも1クリック</span>
        </div>
        <div class="mock-container">
          <div class="mock-screen">
            <div class="mock-bar">
              <div class="mock-dot" style="background:#ff6b6b"></div>
              <div class="mock-dot" style="background:#ffd93d"></div>
              <div class="mock-dot" style="background:#6bcb77"></div>
              <div style="margin-left:8px;font-size:11px;color:#ccc;font-family:'DM Sans',sans-serif">tanomi.app/workers</div>
            </div>
            <div class="mock-body">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <span style="font-size:13px;font-weight:700;color:var(--blue-900)">ワーカー一覧</span>
                <span style="font-size:11px;background:var(--blue-600);color:white;padding:4px 10px;border-radius:6px">+ 追加</span>
              </div>
              <table class="mini-tbl">
                <tr><th>氏名</th><th>単価</th><th>今月実績</th><th>状態</th></tr>
                <tr><td>田中 優子</td><td>¥850/個</td><td>342個</td><td><span class="status-pill status-active">稼働中</span></td></tr>
                <tr><td>鈴木 健太</td><td>¥920/個</td><td>218個</td><td><span class="status-pill status-active">稼働中</span></td></tr>
                <tr><td>山本 花</td><td>¥800/個</td><td>—</td><td><span class="status-pill status-pending">休止中</span></td></tr>
                <tr><td>佐藤 直樹</td><td>¥950/個</td><td>156個</td><td><span class="status-pill status-active">稼働中</span></td></tr>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 2 -->
      <div class="feature-item reverse">
        <div>
          <div class="feature-eyebrow">スマホ対応の実績入力</div>
          <h3 class="feature-title">現場でその場で入力。<br />後まとめはもう不要</h3>
          <p class="feature-desc">
            スマホから日付・ワーカー・個数を選ぶだけ。5秒で記録完了します。「後でまとめて入力」という非効率な作業がなくなり、データの精度が飛躍的に向上します。
          </p>
          <span class="feature-tag">✓ 外出先・現場でも即入力</span>
        </div>
        <div class="mock-container">
          <div class="mock-screen">
            <div class="mock-bar">
              <div class="mock-dot" style="background:#ff6b6b"></div>
              <div class="mock-dot" style="background:#ffd93d"></div>
              <div class="mock-dot" style="background:#6bcb77"></div>
              <div style="margin-left:8px;font-size:11px;color:#ccc;font-family:'DM Sans',sans-serif">tanomi.app/record</div>
            </div>
            <div class="mock-body">
              <div style="font-size:13px;font-weight:700;color:var(--blue-900);margin-bottom:14px">実績を登録</div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <div>
                  <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">ワーカー</div>
                  <div style="border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;font-size:13px;display:flex;justify-content:space-between">田中 優子 <span style="color:#999">▾</span></div>
                </div>
                <div>
                  <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">日付</div>
                  <div style="border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;font-size:13px">2025年4月24日</div>
                </div>
                <div>
                  <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">個数</div>
                  <div style="border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;font-size:13px">84</div>
                </div>
                <div style="background:var(--blue-50);border-radius:6px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center">
                  <span style="font-size:12px;color:var(--text-secondary)">自動計算：</span>
                  <span style="font-size:16px;font-weight:700;color:var(--blue-800)">¥71,400</span>
                </div>
                <div style="background:var(--blue-600);color:white;border-radius:8px;padding:12px;text-align:center;font-size:14px;font-weight:700">登録する</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 3 -->
      <div class="feature-item" style="padding-bottom:96px">
        <div>
          <div class="feature-eyebrow">支払い管理 & 明細書</div>
          <h3 class="feature-title">未払い残高を可視化。<br />支払い漏れをゼロに</h3>
          <p class="feature-desc">
            ワーカーごとの未払い額がリアルタイムで確認できます。支払い完了後は記録に残り、明細書もワンクリックで発行。経理作業も劇的にスムーズになります。
          </p>
          <span class="feature-tag">✓ CSV出力で経理ソフトへもスムーズ</span>
        </div>
        <div class="mock-container">
          <div class="mock-screen">
            <div class="mock-bar">
              <div class="mock-dot" style="background:#ff6b6b"></div>
              <div class="mock-dot" style="background:#ffd93d"></div>
              <div class="mock-dot" style="background:#6bcb77"></div>
              <div style="margin-left:8px;font-size:11px;color:#ccc;font-family:'DM Sans',sans-serif">tanomi.app/payments</div>
            </div>
            <div class="mock-body">
              <div style="font-size:13px;font-weight:700;color:var(--blue-900);margin-bottom:12px">支払い状況（2025年4月）</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
                <div style="background:#fef9c3;border-radius:8px;padding:10px 12px">
                  <div style="font-size:10px;color:#a16207;font-weight:700">未払い合計</div>
                  <div style="font-size:18px;font-weight:900;color:#a16207">¥312,400</div>
                </div>
                <div style="background:#dcfce7;border-radius:8px;padding:10px 12px">
                  <div style="font-size:10px;color:#15803d;font-weight:700">支払済み</div>
                  <div style="font-size:18px;font-weight:900;color:#15803d">¥848,200</div>
                </div>
              </div>
              <table class="mini-tbl">
                <tr><th>ワーカー</th><th>金額</th><th>状態</th></tr>
                <tr><td>田中 優子</td><td>¥290,700</td><td><span class="status-pill status-done">支払済</span></td></tr>
                <tr><td>鈴木 健太</td><td>¥200,560</td><td><span class="status-pill status-pending">未払い</span></td></tr>
                <tr><td>佐藤 直樹</td><td>¥148,200</td><td><span class="status-pill status-pending">未払い</span></td></tr>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<hr class="section-divider" />

<!-- VOICE -->
<section class="voice-section">
  <div class="inner">
    <div class="section-eyebrow">お客様の声</div>
    <h2 class="section-title">導入後の変化</h2>
    <p class="section-sub">実際にTanomiを導入した方からのフィードバックです。</p>
    <div class="voice-grid">
      <div class="voice-card">
        <div class="voice-stars">★★★★★</div>
        <p class="voice-quote">「月末の集計作業が半日かかっていたのが、30分以内に終わるようになりました。担当者の負担が激減しています。」</p>
        <div class="voice-author">
          <div class="voice-avatar">T</div>
          <div>
            <div class="voice-name">製造業・総務担当</div>
            <div class="voice-role">外注ワーカー12名</div>
          </div>
        </div>
      </div>
      <div class="voice-card">
        <div class="voice-stars">★★★★★</div>
        <p class="voice-quote">「スマホから入力できるようになって、紙のメモがなくなりました。現場リーダーも使いやすいと言っています。」</p>
        <div class="voice-author">
          <div class="voice-avatar">S</div>
          <div>
            <div class="voice-name">物流・管理担当</div>
            <div class="voice-role">外注ワーカー8名</div>
          </div>
        </div>
      </div>
      <div class="voice-card">
        <div class="voice-stars">★★★★★</div>
        <p class="voice-quote">「支払い漏れが怖くてExcelを何度も確認していましたが、もうその心配が完全になくなりました。精神的にとても楽になりました。」</p>
        <div class="voice-author">
          <div class="voice-avatar">M</div>
          <div>
            <div class="voice-name">食品加工・経営者</div>
            <div class="voice-role">外注ワーカー20名</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<hr class="section-divider" />

<!-- PRICE -->
<section class="price-section">
  <div class="inner">
    <div class="section-eyebrow">料金</div>
    <h2 class="section-title">導入費用</h2>
    <p class="section-sub">御社の業務フローに合わせてカスタマイズして納品します。</p>
    <div class="price-card">
      <div>
        <div class="price-label">初期導入・カスタマイズ費用</div>
        <div class="price-amount">要相談</div>
        <div class="price-sub">まずは話を聞くだけでも大歓迎です</div>
        <ul class="price-features">
          <li><span class="check">✓</span>業務フローに合わせたカスタマイズ</li>
          <li><span class="check">✓</span>導入後のサポート対応</li>
          <li><span class="check">✓</span>スマホ対応・クラウド構築込み</li>
          <li><span class="check">✓</span>CSVエクスポート・明細書発行機能</li>
          <li><span class="check">✓</span>無料相談・ヒアリングから対応</li>
        </ul>
      </div>
      <div style="text-align:center">
        <div style="background:var(--blue-50);border-radius:var(--radius-xl);padding:40px 32px;margin-bottom:16px">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">まずはここから</div>
          <a href="#contact" class="btn-primary" style="display:inline-flex;font-size:15px">無料相談する →</a>
        </div>
        <p style="font-size:12px;color:var(--text-muted)">相談・ヒアリングは完全無料</p>
      </div>
    </div>
  </div>
</section>

<hr class="section-divider" />

<!-- CTA -->
<section class="cta-section" id="contact">
  <h2>まずは無料でご相談ください</h2>
  <p>現在の管理方法や課題をお聞きして、<br />最適な導入プランをご提案します。</p>
  <a href="mailto:ryu07240724@yahoo.co.jp" class="btn-primary" style="font-size:16px;padding:18px 40px">
    メールで相談する →
  </a>
  <p class="form-note">返信は通常1〜2営業日以内。しつこい営業は一切しません。</p>
</section>

<footer>
  <p>Tanomi — 外注管理システム &nbsp;|&nbsp; ryu07240724@yahoo.co.jp</p>
</footer>

</body>
</html>
