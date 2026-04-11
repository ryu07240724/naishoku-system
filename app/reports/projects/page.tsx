'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type ProjectRow = {
  projectId: string
  projectName: string
  recordCount: number
  totalAmount: number
  workerCount: number
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

export default function ProjectReportPage() {
  const router = useRouter()
  const [rows, setRows] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const defaults = getDefaultRange()
  const [dateFrom, setDateFrom] = useState(defaults.from)
  const [dateTo, setDateTo] = useState(defaults.to)

  const fetchAll = async (from: string, to: string) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [projectsRes, recordsRes] = await Promise.all([
      supabase.from('projects').select('id, name'),
      supabase.from('work_records').select('project_id, worker_id, amount').gte('work_date', from).lte('work_date', to),
    ])

    const projects = projectsRes.data || []
    const records = recordsRes.data || []

    const result: ProjectRow[] = projects.map(p => {
      const pRecords = records.filter(r => r.project_id === p.id)
      const totalAmount = pRecords.reduce((s, r) => s + (r.amount ?? 0), 0)
      const uniqueWorkers = new Set(pRecords.map(r => r.worker_id)).size
      return {
        projectId: p.id,
        projectName: p.name,
        recordCount: pRecords.length,
        totalAmount,
        workerCount: uniqueWorkers,
      }
    })

    result.sort((a, b) => b.totalAmount - a.totalAmount)
    setRows(result)
    setLoading(false)
  }

  useEffect(() => {
    fetchAll(defaults.from, defaults.to)
  }, [])

  const filtered = rows.filter(r => r.projectName.includes(search))

  const handleExportCSV = () => {
    const header = ['案件名', '作業件数', '稼働ワーカー数', '発生報酬合計(円)']
    const csvRows = filtered.map(r => [r.projectName, r.recordCount, r.workerCount, r.totalAmount])
    const csv = [header, ...csvRows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `案件別集計_${dateFrom}_${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <style>{`
        .project-table { display: block; }
        .project-cards { display: none; }
        @media (max-width: 640px) {
          .project-table { display: none; }
          .project-cards { display: flex; flex-direction: column; gap: 10px; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.push('/reports')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}
            >←</button>
            <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', margin: 0 }}>📋 案件別集計</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '600', cursor: 'pointer' }}
          >
            ダッシュボードへ
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
          </div>
        </div>

        {/* 検索＋CSVボタン */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="案件名で検索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827' }}
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
            { label: '総案件数', value: `${filtered.length}件`, color: '#2563eb' },
            { label: '総作業件数', value: `${filtered.reduce((s, r) => s + r.recordCount, 0)}件`, color: '#374151' },
            { label: '発生報酬合計', value: `¥${filtered.reduce((s, r) => s + r.totalAmount, 0).toLocaleString()}`, color: '#2563eb' },
          ].map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>{card.label}</p>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: card.color, margin: 0 }}>{card.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6b7280' }}>読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6b7280' }}>データがありません</div>
        ) : (
          <>
            {/* PCテーブル */}
            <div className="project-table" style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto', marginBottom: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    {['案件名', '作業件数', '稼働ワーカー', '発生報酬'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: h === '案件名' ? 'left' : 'right', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.projectId} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827' }}>{r.projectName}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>{r.recordCount}件</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>{r.workerCount}人</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#2563eb', fontWeight: '600' }}>¥{r.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* スマホカード */}
            <div className="project-cards">
              {filtered.map(r => (
                <div key={r.projectId + '-sp'} style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <p style={{ fontWeight: 'bold', fontSize: 16, color: '#111827', margin: '0 0 10px' }}>{r.projectName}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <div><span style={{ color: '#6b7280' }}>作業件数：</span><span style={{ color: '#111827', fontWeight: '600' }}>{r.recordCount}件</span></div>
                    <div><span style={{ color: '#6b7280' }}>稼働ワーカー：</span><span style={{ color: '#111827', fontWeight: '600' }}>{r.workerCount}人</span></div>
                    <div><span style={{ color: '#6b7280' }}>発生報酬：</span><span style={{ color: '#2563eb', fontWeight: '600' }}>¥{r.totalAmount.toLocaleString()}</span></div>
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