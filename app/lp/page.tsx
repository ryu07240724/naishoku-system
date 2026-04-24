'use client'

export default function LpPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#111827', backgroundColor: 'white', minHeight: '100vh' }}>
      <style>{`
        * { box-sizing: border-box; }
        .hero {
          background: #f0f7ff;
          padding: 64px 24px;
          text-align: center;
        }
        .hero-inner { max-width: 600px; margin: 0 auto; }
        .hero h1 { font-size: clamp(20px, 4vw, 28px); font-weight: 700; line-height: 1.6; margin: 0 0 16px; color: #0c447c; }
        .hero p { font-size: 15px; color: #374151; margin: 0 0 32px; line-height: 1.8; }
        .cta-btn { display: inline-block; background: #185fa5; color: white; padding: 14px 36px; border-radius: 12px; font-size: 16px; font-weight: 600; text-decoration: none; }
        .wrap { max-width: 680px; margin: 0 auto; padding: 56px 24px; }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #185fa5; margin-bottom: 12px; }
        .section-title { font-size: clamp(18px, 3vw, 22px); font-weight: 600; margin: 0 0 32px; }
        .pain-list { list-style: none; padding: 0; margin: 0 0 32px; }
        .pain-list li { padding: 16px 20px; border-left: 3px solid #185fa5; background: #f9fafb; margin-bottom: 12px; border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.6; }
        .pain-imgs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pain-imgs img { width: 100%; height: 160px; object-fit: cover; border-radius: 10px; opacity: 0.85; }
        .solution-box { background: #e6f1fb; border-radius: 16px; padding: 32px; text-align: center; }
        .solution-box p { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; line-height: 1.7; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .feature-card { background: #f9fafb; border-radius: 12px; overflow: hidden; }
        .feature-card img { width: 100%; height: 130px; object-fit: cover; display: block; }
        .feature-card-body { padding: 14px 16px 18px; }
        .feature-card .num { font-size: 11px; font-weight: 700; color: #185fa5; letter-spacing: 0.08em; margin-bottom: 6px; }
        .feature-card h3 { font-size: 14px; font-weight: 600; margin: 0 0 6px; }
        .feature-card p { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.6; }
        .screen-shot { width: 100%; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin: 32px 0 8px; }
        .screen-caption { text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 32px; }
        .price-box { background: #f9fafb; border-radius: 12px; padding: 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .price-box h3 { font-size: 16px; font-weight: 600; margin: 0 0 8px; }
        .price-box .note { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
        .price-num { font-size: 26px; font-weight: 600; color: #111827; }
        .price-sub { font-size: 12px; color: #9ca3af; margin-top: 4px; }
        .contact-box { background: #e6f1fb; border-radius: 16px; padding: 40px 32px; text-align: center; }
        .contact-box h2 { font-size: 20px; font-weight: 600; color: #0c447c; margin: 0 0 12px; }
        .contact-box p { font-size: 14px; color: #374151; margin: 0 0 28px; line-height: 1.8; }
        .divider { border: none; border-top: 1px solid #e5e7eb; margin: 0; }
        @media (max-width: 560px) {
          .feature-grid { grid-template-columns: 1fr; }
          .pain-imgs { grid-template-columns: 1fr; }
          .price-box { flex-direction: column; }
        }
      `}</style>

      {/* ヒーロー */}
      <div className="hero">
        <div className="hero-inner">
          <img src="/tanomi-logo.svg" alt="Tanomi" style={{ height: 56, marginBottom: 28 }} />
          <h1>Excelと紙の外注管理、<br />月末に憂鬱になっていませんか</h1>
          <p>ワーカーの記録・集計・支払いが、<br />スマホ1台でできるようになります</p>
          <a href="#contact" className="cta-btn">まず相談してみる →</a>
        </div>
      </div>

      <hr className="divider" />

      {/* 共感ゾーン */}
      <div className="wrap">
        <div className="section-label">こんなお悩みはありませんか</div>
        <h2 className="section-title">外注管理のよくある困りごと</h2>
        <ul className="pain-list">
          <li>月末の集計に毎回時間がかかってしまう</li>
          <li>ExcelやノートがPCにしかなく、その場で確認できない</li>
          <li>実績をその場で入力できず、後でまとめて記録している</li>
          <li>ワーカーごとの支払い金額を毎回手計算している</li>
          <li>支払い漏れが怖くて何度も見直している</li>
          <li>データが増えるほど管理が煩雑になってきた</li>
        </ul>
        <div className="pain-imgs">
          <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=80" alt="書類作業の様子" />
          <img src="https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=700&q=80" alt="金額が載ったノート" />
        </div>
      </div>

      <hr className="divider" />

      {/* 解決策 */}
      <div className="wrap">
        <div className="section-label">解決策</div>
        <h2 className="section-title">クラウドシステムで解決できます</h2>
        <div className="solution-box">
          <p>外注ワーカーの管理を、<br />まるごとクラウドにできます</p>
        </div>
      </div>

      <hr className="divider" />

      {/* 機能 */}
      <div className="wrap">
        <div className="section-label">機能</div>
        <h2 className="section-title">できること</h2>
        <div className="feature-grid">
          {[
            { num: '01', title: 'ワーカー管理', desc: '稼働中・停止中の切り替えや連絡先をまとめて管理できます', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80' },
            { num: '02', title: '実績登録（スマホ対応）', desc: 'スマホからその場で入力。後でまとめる手間がなくなります', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80' },
            { num: '03', title: '報酬自動計算', desc: '個数と単価を入れるだけで報酬が自動で出ます。手計算ゼロ', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80' },
            { num: '04', title: '支払い管理', desc: '未払い残高をリアルタイムで確認。支払い漏れを防ぎます', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80' },
            { num: '05', title: 'CSV出力', desc: '期間・ワーカー別に集計してCSV出力。経理処理にそのまま使えます', img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80' },
            { num: '06', title: 'クラウド管理', desc: 'インストール不要。PC・スマホどちらからでもアクセス可能', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80' },
          ].map((f) => (
            <div className="feature-card" key={f.num}>
              <img src={f.img} alt={f.title} />
              <div className="feature-card-body">
                <div className="num">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <img src="/dashboard.png" alt="管理画面イメージ" className="screen-shot" />
        <p className="screen-caption">▲ ダッシュボード画面。ワーカー数・案件数・支払い状況を一目で確認できます</p>

        <img src="/slip.png" alt="支払明細書イメージ" className="screen-shot" />
        <p className="screen-caption">▲ 支払明細書もワンクリックで発行。印刷・PDF保存に対応しています</p>
      </div>

      <hr className="divider" />

      {/* 料金 */}
      <div className="wrap">
        <div className="section-label">料金</div>
        <h2 className="section-title">導入費用</h2>
        <div className="price-box">
          <div>
            <h3>初期導入・カスタマイズ</h3>
            <p className="note">御社の業務に合わせてカスタマイズして納品します。<br />運用後のサポートも対応可能です。</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="price-num">要相談</div>
            <div className="price-sub">まずは話を聞くだけでもOKです</div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* CTA */}
      <div className="wrap" id="contact">
        <div className="contact-box">
          <h2>まずは無料でご相談ください</h2>
          <p>現在の管理方法や課題をお聞きして、<br />導入のご提案をいたします。お気軽にどうぞ。</p>
          <a href="mailto:ryu07240724@yahoo.co.jp" className="cta-btn">まず相談してみる →</a>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '24px', fontSize: 12, color: '#9ca3af', borderTop: '1px solid #e5e7eb' }}>
        Tanomi — 外注管理システム | お問い合わせはお気軽に
      </footer>

    </div>
  )
}