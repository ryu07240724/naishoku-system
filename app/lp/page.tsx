'use client'

export default function LpPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#111827', backgroundColor: 'white', minHeight: '100vh' }}>
      <style>{`
        .hero { background: #f0f7ff; padding: 64px 24px; text-align: center; }
        .hero h1 { font-size: 28px; font-weight: 700; line-height: 1.5; margin: 0 0 16px; color: #0c447c; }
        .hero p { font-size: 16px; color: #374151; margin: 0 0 32px; line-height: 1.8; }
        .cta-btn { display: inline-block; background: #185fa5; color: white; padding: 14px 36px; border-radius: 12px; font-size: 16px; font-weight: 600; text-decoration: none; }
        .section { max-width: 720px; margin: 0 auto; padding: 56px 24px; }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #185fa5; margin-bottom: 12px; }
        .section h2 { font-size: 22px; font-weight: 600; margin: 0 0 32px; }
        .pain-list { list-style: none; padding: 0; margin: 0; }
        .pain-list li { padding: 16px 20px; border-left: 3px solid #185fa5; background: #f9fafb; margin-bottom: 12px; border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.6; }
        .solution-box { background: #e6f1fb; border-radius: 16px; padding: 32px; text-align: center; }
        .solution-box p { font-size: 18px; font-weight: 600; color: #0c447c; margin: 0; line-height: 1.7; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .feature-card { background: #f9fafb; border-radius: 12px; padding: 20px; }
        .feature-card .num { font-size: 11px; font-weight: 700; color: #185fa5; letter-spacing: 0.08em; margin-bottom: 8px; }
        .feature-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 8px; }
        .feature-card p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
        .price-box { background: #f9fafb; border-radius: 12px; padding: 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .price-box h3 { font-size: 17px; font-weight: 600; margin: 0 0 8px; }
        .price-box .note { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
        .price-num { font-size: 26px; font-weight: 600; color: #111827; }
        .price-sub { font-size: 12px; color: #9ca3af; margin-top: 4px; }
        .contact-box { background: #e6f1fb; border-radius: 16px; padding: 40px 32px; text-align: center; }
        .contact-box h2 { font-size: 20px; font-weight: 600; color: #0c447c; margin: 0 0 12px; }
        .contact-box p { font-size: 14px; color: #374151; margin: 0 0 28px; line-height: 1.8; }
        .divider { border: none; border-top: 1px solid #e5e7eb; margin: 0; }
        @media (max-width: 600px) {
          .hero h1 { font-size: 22px; }
          .feature-grid { grid-template-columns: 1fr; }
          .price-box { flex-direction: column; }
        }
      `}</style>

      {/* ヒーロー */}
      <div className="hero">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#185fa5', marginBottom: 16 }}>Tanomi</div>
          <h1>Excelと紙の外注管理、<br />月末に憂鬱になっていませんか</h1>
          <p>ワーカーの記録・集計・支払いが、<br />スマホ1台でできるようになります</p>
          <a href="#contact" className="cta-btn">まず相談してみる →</a>
        </div>
      </div>

      <hr className="divider" />

      {/* 共感ゾーン */}
      <div className="section">
        <div className="section-label">こんなお悩みはありませんか</div>
        <h2>外注管理のよくある困りごと</h2>
        <ul className="pain-list">
          <li>月末の集計に毎回時間がかかってしまう</li>
          <li>ExcelやノートがPCにしかなく、その場で確認できない</li>
          <li>実績をその場で入力できず、後でまとめて記録している</li>
          <li>ワーカーごとの支払い金額を毎回手計算している</li>
          <li>支払い漏れが怖くて何度も見直している</li>
          <li>データが増えるほど管理が煩雑になってきた</li>
        </ul>
      </div>

      <hr className="divider" />

      {/* 解決策 */}
      <div className="section">
        <div className="section-label">解決策</div>
        <h2>クラウドシステムで解決できます</h2>
        <div className="solution-box">
          <p>外注ワーカーの管理を、<br />まるごとクラウドにできます</p>
        </div>
      </div>

      <hr className="divider" />

      {/* 機能 */}
      <div className="section">
        <div className="section-label">機能</div>
        <h2>できること</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="num">01</div>
            <h3>ワーカー管理</h3>
            <p>稼働中・停止中の切り替えや連絡先をまとめて管理できます</p>
          </div>
          <div className="feature-card">
            <div className="num">02</div>
            <h3>実績登録（スマホ対応）</h3>
            <p>スマホからその場で入力。後でまとめる手間がなくなります</p>
          </div>
          <div className="feature-card">
            <div className="num">03</div>
            <h3>報酬自動計算</h3>
            <p>個数と単価を入れるだけで報酬が自動で出ます。手計算ゼロ</p>
          </div>
          <div className="feature-card">
            <div className="num">04</div>
            <h3>支払い管理</h3>
            <p>未払い残高をリアルタイムで確認。支払い漏れを防ぎます</p>
          </div>
          <div className="feature-card">
            <div className="num">05</div>
            <h3>CSV出力</h3>
            <p>期間・ワーカー別に集計してCSV出力。経理処理にそのまま使えます</p>
          </div>
          <div className="feature-card">
            <div className="num">06</div>
            <h3>クラウド管理</h3>
            <p>インストール不要。PC・スマホどちらからでもアクセス可能</p>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* 料金 */}
      <div className="section">
        <div className="section-label">料金</div>
        <h2>導入費用</h2>
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
      <div className="section" id="contact">
        <div className="contact-box">
          <h2>まずは無料でご相談ください</h2>
          <p>現在の管理方法や課題をお聞きして、<br />導入のご提案をいたします。お気軽にどうぞ。</p>
          <a href="mailto:ryu07240724@yahoo.co.jp" className="cta-btn">まず相談してみる →</a>
        </div>
      </div>

      {/* フッター */}
      <footer style={{ textAlign: 'center', padding: '24px', fontSize: 12, color: '#9ca3af', borderTop: '1px solid #e5e7eb' }}>
        Tanomi — 外注管理システム | お問い合わせはお気軽に
      </footer>

    </div>
  )
}