'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SchedulePrintPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [schedules, setSchedules] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    const fetchInit = async () => {
      const { data: w } = await supabase.from('workers').select('id, name').eq('status', 'active').order('name')
      const { data: s } = await supabase.from('settings').select('*').single()
      if (w) setWorkers(w)
      if (s) setSettings(s)
    }
    fetchInit()
  }, [])

  const handlePreview = async () => {
    let query = supabase
      .from('schedules')
      .select('*, workers(name), projects(name)')
      .order('start_date', { ascending: true })

    if (selectedWorker) query = query.eq('worker_id', selectedWorker)
    if (filterFrom) query = query.gte('start_date', filterFrom)
    if (filterTo) query = query.lte('delivery_date', filterTo)

    const { data } = await query
    setSchedules(data || [])
    setPreview(true)
  }

  const inputStyle = { padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', color: '#111827', background: 'white', fontSize: '14px' }
  const workerName = workers.find(w => w.id === selectedWorker)?.name || ''

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', color: '#111827' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      {/* 操作パネル */}
      <div className="no-print" style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>🖨️ 作業予定表（印刷）</h1>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>ワーカー</div>
            <select value={selectedWorker} onChange={e => { setSelectedWorker(e.target.value); setPreview(false) }} style={{ ...inputStyle, width: '100%' }}>
              <option value="">全員</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>開始日 From</div>
              <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPreview(false) }} style={{ ...inputStyle, width: '100%' }} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>納入日 To</div>
              <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPreview(false) }} style={{ ...inputStyle, width: '100%' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>備考</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ ...inputStyle, width: '100%', resize: 'vertical', boxSizing: 'border-box' }} placeholder="印刷に反映されます" />
          </div>
          <button onClick={handlePreview} style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
            プレビュー表示
          </button>
          {preview && (
            <button onClick={() => window.print()} style={{ padding: '10px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              🖨️ 印刷 / PDF保存
            </button>
          )}
        </div>
      </div>

      {/* 印刷プレビュー */}
      {preview && (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px', background: 'white' }}>
          {/* ヘッダー */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>作業予定表</h2>
              {workerName && <div style={{ fontSize: '15px' }}>担当：{workerName}</div>}
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                {filterFrom && `${filterFrom}`}{filterFrom && filterTo && ' 〜 '}{filterTo && `${filterTo}`}
              </div>
            </div>
            {settings && (
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#374151', lineHeight: '1.6' }}>
                {settings.company_name && <div style={{ fontWeight: 600 }}>{settings.company_name}</div>}
                {settings.address && <div>{settings.address}</div>}
                {settings.phone && <div>TEL: {settings.phone}</div>}
                {settings.email && <div>{settings.email}</div>}
              </div>
            )}
          </div>

          {/* テーブル */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>ワーカー</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>案件</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>開始日</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>納入日</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>数量</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>単価</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>備考</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr><td colSpan={7} style={{ border: '1px solid #d1d5db', padding: '16px', textAlign: 'center', color: '#6b7280' }}>データがありません</td></tr>
              ) : schedules.map(s => (
                <tr key={s.id}>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{s.workers?.name}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{s.projects?.name}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>{s.start_date || '―'}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>{s.delivery_date || '―'}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>{s.quantity ?? '―'}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>{s.unit_price ? `¥${Number(s.unit_price).toLocaleString()}` : '―'}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{s.note || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 備考 */}
          {note && (
            <div style={{ marginTop: '20px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>備考</div>
              <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{note}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}