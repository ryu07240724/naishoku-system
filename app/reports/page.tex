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

export default function ReportsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<MonthlyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [years, setYears] = useState<string[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [recordsRes, paymentsRes] = await Promise.all([
        supabase.from('work_records').select('work_date, reward_amount, worker_id'),
        supabase.from('payments').select('payment_date, amount'),
      ])

      const records = recordsRes.data || []
      const payments = paymentsRes.data || []

      // 月ごとに集計
      const monthMap: Record<string, MonthlyRow> = {}

      for (const r of records) {
        const month = r.work_date?.slice(0, 7) // "YYYY-MM"
        if (!month) continue
        if (!monthMap[month]) {
          monthMap[month] = { month, workerCount: 0, recordCount: 0, totalReward: 0, totalPayment: 0, balance: 0 }
        }
        monthMap[month].recordCount += 1
        monthMap[month].totalReward += r.reward_amount || 0
      }

      // ワーカー数（月ごとのユニーク数）
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

      // 残高計算
      for (const row of Object.values(monthMap)) {
        row.balance = row.totalReward - row.totalPayment
      }

      // 新しい月順にソート
      const sorted = Object.values(monthMap).sort((a, b) => b.month.localeCompare(a.month))
      setRows(sorted)

      // 年リスト
      const yearSet = new Set(sorted.map(r => r.month.slice(0, 4)))
      setYears(Array.from(yearSet).sort((a, b) => b.localeCompare(a)))

      setLoading(false)
    }

    fetchAll()
  }, [router])

  const filteredRows = selectedYear === 'all' ? rows : rows.filter(r => r.month.startsWith(selectedYear))

  const totalReward = filteredRows.reduce((s, r) => s + r.totalReward, 0)
  const totalPayment = filteredRows.reduce((s, r) => s + r.totalPayment, 0)
  const totalBalance = totalReward - totalPayment

  const handleExportCSV = () => {
    const header = ['月', '稼働ワーカー数', '作業件数', '発生報酬合計(円)', '支払合計(円)', '未払残高(円)']
    const csvRows = filteredRows.map(r => [
      r.month,
      r.workerCount,
      r.recordCount,
      r.totalReward,
      r.totalPayment,
      r.balance,
    ])
    const csv = [header, ...csvRows].map(row => row.join(',')).join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `月別集計_${selectedYear === 'all' ? '全期間' : selectedYear}.csv`
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
            onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}
          >←</button>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', margin: 0 }}>📊 月別集計・レポート</h1>
        </div>

        {/* フィルター＋CSVボタン */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', background: 'white' }}
          >
            <option value="all">全期間</option>
            {years.map(y => <option key={y} value={y}>{y}年</option>)}
          </select>

          <button
            onClick={handleExportCSV}
            style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '600', cursor: 'pointer' }}
          >
            ⬇ CSVエクスポート
          </button>
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

        {/* テーブル（PC） */}
        <div style={{ display: 'none' }} className="pc-table">
        </div>

        {/* テーブル */}
        {filteredRows.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6b7280' }}>
            データがありません
          </div>
        ) : (
          <>
            {/* PC表示 */}
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    {['月', '稼働ワーカー', '作業件数', '発生報酬', '支払済', '未払残高'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                        {h === '月' ? <span style={{ textAlign: 'left', display: 'block' }}>{h}</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, i) => (
                    <tr key={r.month} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827' }}>{r.month}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>{r.workerCount}人</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>{r.recordCount}件</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#2563eb', fontWeight: '600' }}>¥{r.totalReward.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>¥{r.totalPayment.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: r.balance > 0 ? '#dc2626' : '#6b7280' }}>
                        ¥{r.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* スマホ：カード表示 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {filteredRows.map(r => (
                <div key={r.month + '-sp'} style={{ background: 'white', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <p style={{ fontWeight: 'bold', fontSize: 16, color: '#111827', margin: '0 0 10px' }}>{r.month}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <div><span style={{ color: '#6b7280' }}>稼働ワーカー：</span><span style={{ fontWeight: '600' }}>{r.workerCount}人</span></div>
                    <div><span style={{ color: '#6b7280' }}>作業件数：</span><span style={{ fontWeight: '600' }}>{r.recordCount}件</span></div>
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