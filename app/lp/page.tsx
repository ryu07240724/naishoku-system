'use client'

import { useRouter } from 'next/navigation'

export default function LpPage() {
  const router = useRouter()

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#111827', backgroundColor: 'white', minHeight: '100vh' }}>

      {/* ヘッダー */}
      <header style={{ borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontWeight: '500', fontSize: 16, margin: 0 }}>内職管理システム</p>
        <button
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ padding: '8px 20px', background: '#185FA5', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '500', cursor: 'pointer' }}
        >
          無料相談する
        </button>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>

        {/* ヒーロー */}
        <div style={{ textAlign: 'center', padding: '64px 16px 48px' }}>
          <div style={{ display: 'inline-block', background: '#E6F1FB', color: '#0C447C', fontSize: 12, fontWeight: '500', padding: '4px 14px', borderRadius: 20, marginBottom: 20 }}>
            内職・在宅ワーク管理システム
          </div>
          <h1 style={{ fontSize: 28, fontWeight: '500', lineHeight: 1.4, marginBottom: 16, color: '#111827' }}>
            ワーカー管理・支払い計算を<br />もっとかんたんに
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            Excelや手書きでの管理に限界を感じていませんか？<br />作業記録・報酬計算・支払い管理をまるごとデジタル化します。
          </p>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '14px 36px', background: '#185FA5', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '500', cursor: 'pointer' }}
          >
            まずは無料相談する
          </button>
        </div>

        {/* お悩み */}
        <div style={{ padding: '48px 0', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>こんなお悩みありませんか</p>
          <h2 style={{ fontSize: 20, fontWeight: '500', color: '#111827', marginBottom: 24 }}>現場でよく聞く声</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { icon: '📋', text: 'ワーカーごとの作業量をExcelで管理していて、ミスが多い' },
              { icon: '💸', text: '報酬計算に毎月時間がかかる。単価変更のたびに修正が大変' },
              { icon: '📊', text: '誰にいくら払ったか・未払いがあるか、すぐに確認できない' },
            ].map((item) => (
              <div key={item.text} style={{ background: '#f9fafb', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 16, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 機能 */}
        <div style={{ padding: '48px 0', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>できること</p>
          <h2 style={{ fontSize: 20, fontWeight: '500', color: '#111827', marginBottom: 24 }}>主な機能</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { num: '01', title: 'ワーカー管理', desc: '稼働中・停止中の切り替えや、ワーカーごとの作業履歴をまとめて管理できます。' },
              { num: '02', title: '作業記録・報酬自動計算', desc: '個数と単価を入力するだけで報酬が自動計算されます。案件ごとに単価設定も可能。' },
              { num: '03', title: '支払い管理', desc: '未払い残高をリアルタイムで確認。支払い漏れを防ぎます。' },
              { num: '04', title: '集計レポート・CSV出力', desc: '期間・ワーカー・案件ごとに集計。CSVで書き出して経理処理にも使えます。' },
              { num: '05', title: 'スマホ対応', desc: 'PC・スマートフォン両方に対応。外出先からでも確認・入力ができます。' },
              { num: '06', title: 'クラウド管理', desc: 'インストール不要。ブラウザからすぐ使えます。データはクラウドに安全に保存。' },
            ].map((f) => (
              <div key={f.num} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#185FA5', fontWeight: '500', marginBottom: 8 }}>{f.num}</div>
                <h3 style={{ fontSize: 15, fontWeight: '500', color: '#111827', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 料金 */}
        <div style={{ padding: '48px 0', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>料金</p>
          <h2 style={{ fontSize: 20, fontWeight: '500', color: '#111827', marginBottom: 24 }}>導入費用</h2>
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: '500', color: '#111827', marginBottom: 6 }}>初期導入・カスタマイズ</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>御社の業務に合わせてカスタマイズして納品します。<br />運用後のサポートも対応可能です。</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: '500', color: '#111827' }}>要相談</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>まずはお気軽にご相談ください</div>
            </div>
          </div>
        </div>

        {/* お問い合わせ */}
        <div id="contact" style={{ padding: '48px 0', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ background: '#E6F1FB', borderRadius: 12, padding: '36px 32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: '500', color: '#0C447C', marginBottom: 10 }}>まずは無料でご相談ください</h2>
            <p style={{ fontSize: 14, color: '#185FA5', marginBottom: 24, lineHeight: 1.6 }}>
              現在の管理方法や課題をお聞きして、<br />導入のご提案をいたします。お気軽にどうぞ。
            </p>
            
              href="mailto:ryu07240724@yahoo.co.jp"
              style={{ display: 'inline-block', padding: '12px 32px', background: '#185FA5', color: 'white', borderRadius: 12, fontSize: 15, fontWeight: '500', textDecoration: 'none' }}
            >
              メールで問い合わせる
            </a>
          </div>
        </div>

      </div>

      {/* フッター */}
      <footer style={{ textAlign: 'center', padding: '24px', fontSize: 12, color: '#9ca3af', borderTop: '1px solid #e5e7eb', marginTop: 24 }}>
        内職管理システム — お問い合わせはお気軽に
      </footer>

    </div>
  )
}