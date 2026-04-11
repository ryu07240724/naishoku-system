'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type WorkerRow = {
  workerId: string
  workerName: string
  recordCount: number
  totalAmount: number
  totalPayment: number
  balance: number
}

export default function WorkerReportPage() {
  const router = useRouter()
  const [rows, setRows] = useState<WorkerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [workersRes, recordsRes, paymentsRes] = await Promise.all([
        supabase.from('workers').select('id, name'),
        supabase.from('work_records').select('worker_id, amount'),
        supabase.from('payments').select('worker_id, amount'),
      ])

      const workers = workersRes.data || []
      const records = recordsRes.data || []
      const payments = paymentsRes.data || []

      const result: WorkerRow[] = workers.map(w => {
        const wRecords = records.filter(r => r.worker_id === w.id)
        const wPayments = payments.filter(p => p.worker_id === w.id)
        const totalAmount = wRecords.reduce((s, r) => s + (r.amount ?? 0), 0)
        const totalPayment = wPayments.reduce((s, p) => s + (p.amount ?? 0), 0)
        return {
          workerId: w.id,
          workerName: w.name,
          recordCount: wRecords.length,
          totalAmount,
          totalPayment,
          balance: totalAmount - totalPayment,
        }
      })

      // 未払い残高の多い順にソート
      result.sort((a, b) => b.balance - a.balance)
      setRows(result)
      setLoading(false)
    }

    fetchAll()
  }, [router])

  const filtered = rows.filter(r => r.workerName.includes(search))

  const handleExportCSV = () => {
    const header = ['ワーカー名', '作業件数', '発生報酬合計(円)', '支払合計(円)', '未払残高(円)']
    const csvRows = filtered.map(r => [r.workerName, r.recordCount, r.totalAmount, r.totalPayment, r.balance])
    const csv = [header, ...csvRows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ワーカー別集計.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>読み込み中...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => router.push('/reports')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}
          >←</button>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', margin: 0 }}>👷 ワーカー別集計</h1>
        </div>

        {/* 検索＋CSVボタン */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="ワーカー名で検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
          />
          <button
            onClick={handleExportCSV}
            style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '600', cursor: 'pointer' }}
          >
            ⬇ CSVエクスポート
          </button>
        </div>

        {/* サマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: '総ワーカー数', value: `${filtered.length}人`, color: '#2563eb' },
            { label: '発生報酬合計', value: `¥${filtered.reduce((s, r) => s + r.totalAmount, 0).toLocaleString()}`, color: '#2563eb' },
            { label: '支払合計', value: `¥${filtered.reduce((s, r) => s + r.totalPayment, 0).toLocaleString()}`, color: '#16a34a' },
            { label: '未払残高合計', value: `¥${filtered.reduce((s, r) => s + r.balance, 0).toLocaleString()}`, color: '#dc2626' },
          ].map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>{card.label}</p>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: card.color, margin: 0 }}>{card.value}</p>
            </div>
          ))}
        </div>

        <style>{`
          .worker-table { display: block; }
          .worker-cards { display: none; }
          @media (max-width: 640px) {
            .worker-table { display: none; }
            .worker-cards { display: flex; flex-direction: column; gap: 10px; }
          }
        `}</style>

        {filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6b7280' }}>データがありません</div>
        ) : (
          <>
            {/* PCテーブル */}
            <div className="worker-table" style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto', marginBottom: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    {['ワーカー名', '作業件数', '発生報酬', '支払済', '未払残高'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: h === 'ワーカー名' ? 'left' : 'right', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.workerId} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827' }}>{r.workerName}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>{r.recordCount}件</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#2563eb', fontWeight: '600' }}>¥{r.totalAmount.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>¥{r.totalPayment.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: r.balance > 0 ? '#dc2626' : '#6b7280' }}>¥{r.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* スマホカード */}
            <div className="worker-cards">
              {filtered.map(r => (
                <div key={r.workerId + '-sp'} style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <p style={{ fontWeight: 'bold', fontSize: 16, color: '#111827', margin: '0 0 10px' }}>{r.workerName}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <div><span style={{ color: '#6b7280' }}>作業件数：</span><span style={{ color: '#111827', fontWeight: '600' }}>{r.recordCount}件</span></div>
                    <div><span style={{ color: '#6b7280' }}>発生報酬：</span><span style={{ color: '#2563eb', fontWeight: '600' }}>¥{r.totalAmount.toLocaleString()}</span></div>
                    <div><span style={{ color: '#6b7280' }}>支払済：</span><span style={{ color: '#16a34a', fontWeight: '600' }}>¥{r.totalPayment.toLocaleString()}</span></div>
                  </div>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>未払残高：</span>
                    <span style={{ fontWeight: '700', fontSize: 15, color: r.balance > 0 ? '#dc2626' : '#6b7280' }}>¥{r.balance.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}