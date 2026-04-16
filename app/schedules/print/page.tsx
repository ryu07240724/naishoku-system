'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SchedulePrintPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const [dateFrom, setDateFrom] = useState(todayStr)
  const [dateTo, setDateTo] = useState('')
  const [records, setRecords] = useState<any[]>([])
  const [workerInfo, setWorkerInfo] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [memo, setMemo] = useState('')

  useEffect(() => {
    supabase.from('workers').select('*').order('name').then(({ data }) => { if (data) setWorkers(data) })
    supabase.from('settings').select('*').eq('id', 'main').single().then(({ data }) => { if (data) setSettings(data) })
  }, [])

  const handleSearch = async () => {
    if (!selectedWorker) return
    setLoading(true)
    setSearched(true)
    let query = supabase
      .from('work_records')
      .select('*, projects(name)')
      .eq('worker_id', selectedWorker)
      .order('work_date')
    if (dateFrom) query = query.gte('work_date', dateFrom)
    if (dateTo) query = query.lte('work_date', dateTo)
    const { data } = await query
    const worker = workers.find(w => w.id === selectedWorker)
    setRecords(data || [])
    setWorkerInfo(worker || null)
    setLoading(false)
  }

  const issuedDate = `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日`
  const periodLabel = dateFrom && dateTo
    ? `${dateFrom} 〜 ${dateTo}`
    : dateFrom ? `${dateFrom} 以降`
    : dateTo ? `${dateTo} まで`
    : '全期間'

  return (
    <div style={{minHeight:'100vh', background:'#f9fafb', color:'#111827'}}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-area { padding: 20px; }
        }
        @media screen {
          .print-area { max-width: 800px; margin: 0 auto; padding: 24px; }
        }
      `}</style>

      {/* 操作パネル */}
      <div className="no-print" style={{background:'#f3f4f6', padding:'16px', borderBottom:'1px solid #e5e7eb'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
            <Link href="/schedules" style={{color:'#6b7280', textDecoration:'none', fontSize:'14px'}}>← 予定一覧へ戻る</Link>
            <span style={{color:'#6b7280'}}>|</span>
            <span style={{fontWeight:'bold', fontSize:'16px', color:'#111827'}}>作業予定表（印刷）</span>
          </div>
          <div style={{display:'flex', gap:'12px', marginTop:'12px', flexWrap:'wrap', alignItems:'flex-end'}}>
            <div>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>ワーカー</div>
              <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}
                style={{padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', color:'#111827', background:'white'}}>
                <option value="">選択してください</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>開始日</div>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', color:'#111827', background:'white'}} />
            </div>
            <div>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>終了日</div>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', color:'#111827', background:'white'}} />
            </div>
            <button onClick={handleSearch} disabled={!selectedWorker || loading}
              style={{padding:'8px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:'6px', fontSize:'14px', cursor:'pointer'}}>
              {loading ? '読込中...' : '表示'}
            </button>
            {searched && (
              <button onClick={() => window.print()}
                style={{padding:'8px 20px', background:'#10b981', color:'white', border:'none', borderRadius:'6px', fontSize:'14px', cursor:'pointer'}}>
                🖨️ 印刷 / PDF保存
              </button>
            )}
          </div>
          {searched && (
            <div style={{marginTop:'12px'}}>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>備考（印刷に反映されます）</div>
              <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="備考があれば入力してください"
                style={{width:'100%', padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', color:'#111827', background:'white', resize:'vertical', boxSizing:'border-box'}} />
            </div>
          )}
        </div>
      </div>

      {/* 予定表本体 */}
      <div className="print-area">
        {!searched ? (
          <div style={{textAlign:'center', color:'#9ca3af', marginTop:'60px', fontSize:'14px'}}>
            ワーカーと期間を選択して「表示」を押してください
          </div>
        ) : (
          <>
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <h1 style={{fontSize:'22px', fontWeight:'bold', margin:'0 0 4px', color:'#111827'}}>作業予定表</h1>
              <div style={{color:'#6b7280', fontSize:'14px'}}>{periodLabel}</div>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px'}}>
              <div>
                <div style={{fontSize:'18px', fontWeight:'bold', borderBottom:'2px solid #111', paddingBottom:'4px', color:'#111827'}}>
                  {workerInfo?.name} 様
                </div>
              </div>
              <div style={{textAlign:'right', fontSize:'13px', color:'#374151', lineHeight:'1.8'}}>
                {settings?.company_name && <div style={{fontWeight:'bold', fontSize:'15px', color:'#111827'}}>{settings.company_name}</div>}
                {settings?.owner_name && <div>{settings.owner_name}</div>}
                {settings?.address && <div>{settings.address}</div>}
                {settings?.phone && <div>TEL：{settings.phone}</div>}
                {settings?.email && <div>{settings.email}</div>}
                <div style={{marginTop:'4px'}}>発行日：{issuedDate}</div>
              </div>
            </div>

            <div style={{marginBottom:'24px'}}>
              <h2 style={{fontSize:'15px', fontWeight:'bold', borderLeft:'4px solid #7c3aed', paddingLeft:'8px', marginBottom:'12px', color:'#111827'}}>作業予定一覧</h2>
              {records.length === 0 ? (
                <div style={{color:'#9ca3af', fontSize:'14px'}}>該当する予定がありません</div>
              ) : (
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                  <thead>
                    <tr style={{background:'#f3f4f6'}}>
                      {['予定日','案件名','数量','単価','金額'].map(h => (
                        <th key={h} style={{padding:'8px', border:'1px solid #e5e7eb', textAlign: h==='予定日'||h==='案件名' ? 'left' : 'right', color:'#374151'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} style={{background: i % 2 === 0 ? 'white' : '#f9fafb'}}>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', color:'#111827'}}>{r.work_date}</td>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', color:'#111827'}}>{r.projects?.name || '-'}</td>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#111827'}}>{r.quantity?.toLocaleString() || '-'}</td>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#111827'}}>{r.unit_price != null ? `¥${r.unit_price.toLocaleString()}` : '-'}</td>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#111827'}}>{r.amount != null ? `¥${r.amount.toLocaleString()}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{marginTop:'32px'}}>
              <h2 style={{fontSize:'15px', fontWeight:'bold', borderLeft:'4px solid #f59e0b', paddingLeft:'8px', marginBottom:'8px', color:'#111827'}}>備考</h2>
              <div style={{border:'1px solid #e5e7eb', borderRadius:'6px', padding:'12px', minHeight:'80px', background:'white', fontSize:'13px', color:'#111827', whiteSpace:'pre-wrap'}}>
                {memo || ''}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}