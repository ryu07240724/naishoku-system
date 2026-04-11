'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type MonthlyRow = {
  month: string
  workerCount: number
  recordCount: number
  totalReward: number
  totalPayment: number
  balance: number
}

function getDefaultRange() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<MonthlyRow[]>([])
  const [loading, setLoading] = useState(true)
  const defaults = getDefaultRange()
  const [dateFrom, setDateFrom] = useState(defaults.from)
  const [dateTo, setDateTo] = useState(defaults.to)

  const fetchAll = async (from: string, to: string) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [recordsRes, paymentsRes] = await Promise.all([
      supabase.from('work_records').select('work_date, amount, worker_id').gte('work_date', from).lte('work_date', to),
      supabase.from('payments').select('payment_date, amount').gte('payment_date', from).lte('payment_date', to),
    ])

    const records = recordsRes.data || []
    const payments = paymentsRes.data || []

    const monthMap: Record<string, MonthlyRow> = {}

    for (const r of records) {
      const month = r.work_date?.slice(0, 7)
      if (!month) continue
      if (!monthMap[month]) {
        monthMap[month] = { month, workerCount: 0, recordCount: 0, totalReward: 0, totalPayment: 0, balance: 0 }
      }
      monthMap[month].recordCount += 1
      monthMap[month].totalReward += r.amount || 0
    }

    const workersByMonth: Record<string, Set<string>> = {}
    for (const r of records) {
      const month = r.work_date?.slice(0, 7)
      if (!month || !r.worker_id) continue
      if (!workersByMonth[month]) workersByMonth[month] = new Set()
      workersByMonth[month].add(r.worker_id)
    }
    for (const month of Object.keys(monthMap)) {
      monthMap[month].workerCount = workersByMonth[month]?.size || 0
    }

    for (const p of payments) {
      const month = p.payment_date?.slice(0, 7)
      if (!month) continue
      if (!monthMap[month]) {
        monthMap[month] = { month, workerCount: 0, recordCount: 0, totalReward: 0, totalPayment: 0, balance: 0 }
      }
      monthMap[month].totalPayment += p.amount || 0
    }

    for (const row of Object.values(monthMap)) {
      row.balance = row.totalReward - row.totalPayment
    }

    const sorted = Object.values(monthMap).sort((a, b) => b.month.localeCompare(a.month))
    setRows(sorted)
    setLoading(false)
  }

  useEffect(() => {
    fetchAll(defaults.from, defaults.to)
  }, [])

  const totalReward = rows.reduce((s, r) => s + r.totalReward, 0)
  const totalPayment = rows.reduce((s, r) => s + r.totalPayment, 0)
  const totalBalance = totalReward - totalPayment

  const handleExportCSV = () => {
    const header = ['月', '稼働ワーカー数', '作業件数', '発生報酬合計(円)', '支払合計(円)', '未払残高(円)']
    const csvRows = rows.map(r => [r.month, r.workerCount, r.recordCount, r.totalReward, r.totalPayment, r.balance])
    const csv = [header, ...csvRows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `集計レポート_${dateFrom}_${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        .report-table { display: block; }
        .report-cards { display: none; }
        @media (max-width: 640px) {
          .report-table { display: none; }
          .report-cards { display: flex; flex-direction: column; gap: 10px; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}
          >←</button>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', margin: 0 }}>📊 集計レポート</h1>
        </div>

        {/* サブメニュー */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/reports/workers')}
            style={{ padding: '8px 16px', background: 'white', border: '2px solid #2563eb', borderRadius: 8, color: '#2563eb', fontSize: 14, fontWeight: '600', cursor: 'pointer' }}
          >
            👷 ワーカー別集計
          </button>
          <button
            onClick={() => router.push('/reports/projects')}
            style={{ padding: '8px 16px', background: 'white', border: '2px solid #16a34a', borderRadius: 8, color: '#16a34a', fontSize: 14, fontWeight: '600', cursor: 'pointer' }}
          >
            📋 案件別集計
          </button>
        </div>

        {/* 期間指定 */}
        <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: '600', color: '#374151', margin: '0 0 12px' }}>集計期間</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827' }}
            />
            <span style={{ color: '#6b7280', fontSize: 14 }}>〜</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827' }}
            />
            <button
              onClick={() => fetchAll(dateFrom, dateTo)}
              style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '600', cursor: 'pointer' }}
            >
              集計する
            </button>
            <button
              onClick={handleExportCSV}
              style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '600', cursor: 'pointer' }}
            >
              ⬇ CSV
            </button>
          </div>
        </div>

        {/* サマリーカード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: '発生報酬合計', value: `¥${totalReward.toLocaleString()}`, color: '#2563eb' },
            { label: '支払合計', value: `¥${totalPayment.toLocaleString()}`, color: '#16a34a' },
            { label: '未払残高', value: `¥${totalBalance.toLocaleString()}`, color: totalBalance > 0 ? '#dc2626' : '#6b7280' },
          ].map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>{card.label}</p>
              <p style={{ fontSize: 22, fontWeight: 'bold', color: card.color, margin: 0 }}>{card.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6b7280' }}>読み込み中...</div>
        ) : rows.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6b7280' }}>データがありません</div>
        ) : (
          <>
            {/* PCテーブル */}
            <div className="report-table" style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    {['月', '稼働ワーカー', '作業件数', '発生報酬', '支払済', '未払残高'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: h === '月' ? 'left' : 'right', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.month} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827' }}>{r.month}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>{r.workerCount}人</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>{r.recordCount}件</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#2563eb', fontWeight: '600' }}>¥{r.totalReward.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>¥{r.totalPayment.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: r.balance > 0 ? '#dc2626' : '#6b7280' }}>¥{r.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* スマホカード */}
            <div className="report-cards">
              {rows.map(r => (
                <div key={r.month + '-sp'} style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <p style={{ fontWeight: 'bold', fontSize: 16, color: '#111827', margin: '0 0 10px' }}>{r.month}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <div><span style={{ color: '#6b7280' }}>稼働ワーカー：</span><span style={{ color: '#111827', fontWeight: '600' }}>{r.workerCount}人</span></div>
                    <div><span style={{ color: '#6b7280' }}>作業件数：</span><span style={{ color: '#111827', fontWeight: '600' }}>{r.recordCount}件</span></div>
                    <div><span style={{ color: '#6b7280' }}>発生報酬：</span><span style={{ color: '#2563eb', fontWeight: '600' }}>¥{r.totalReward.toLocaleString()}</span></div>
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