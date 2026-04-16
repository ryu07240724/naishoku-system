'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function WorkReportPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [records, setRecords] = useState<any[]>([])
  const [workerInfo, setWorkerInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [memo, setMemo] = useState('')

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 'main').single().then(({ data }) => {
      if (data) setSettings(data)
    })
  }, [])

  useEffect(() => {
    supabase.from('workers').select('*').order('name').then(({ data }) => {
      if (data) setWorkers(data)
    })
  }, [])

  const handleSearch = async () => {
    if (!selectedWorker) return
    setLoading(true)
    setSearched(true)

    const from = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
    const to = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`

    const { data: recs } = await supabase
      .from('work_records')
      .select('*, projects(name)')
      .eq('worker_id', selectedWorker)
      .gte('work_date', from)
      .lte('work_date', to)
      .order('work_date')

    const worker = workers.find(w => w.id === selectedWorker)

    setRecords(recs || [])
    setWorkerInfo(worker || null)
    setLoading(false)
  }

  const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0)

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const today = new Date()
  const issuedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

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

      {/* 操作パネル（印刷時非表示） */}
      <div className="no-print" style={{background:'#f3f4f6', padding:'16px', borderBottom:'1px solid #e5e7eb', color:'#111827'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
            <Link href="/reports" style={{color:'#6b7280', textDecoration:'none', fontSize:'14px'}}>← レポートへ戻る</Link>
            <span style={{color:'#6b7280'}}>|</span>
            <span style={{fontWeight:'bold', fontSize:'16px', color:'#111827'}}>作業報告書</span>
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
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>年</div>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                style={{padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', color:'#111827', background:'white'}}>
                {years.map(y => <option key={y} value={y}>{y}年</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>月</div>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
                style={{padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', color:'#111827', background:'white'}}>
                {months.map(m => <option key={m} value={m}>{m}月</option>)}
              </select>
            </div>
            <button onClick={handleSearch} disabled={!selectedWorker || loading}
              style={{padding:'8px 20px', background:'#3b82f6', color:'white', border:'none', borderRadius:'6px', fontSize:'14px', cursor:'pointer'}}>
              {loading ? '読込中...' : '表示'}
            </button>
            {searched && (
              <button onClick={() => window.print()}
                style={{padding:'8px 20px', background:'#10b981', color:'white', border:'none', borderRadius:'6px', fontSize:'14px', cursor:'pointer'}}>
                🖨️ 印刷 / PDF保存
              </button>
            )}
          </div>

          {/* 備考欄（印刷時非表示） */}
          {searched && (
            <div style={{marginTop:'12px'}}>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>備考（印刷に反映されます）</div>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                rows={3}
                placeholder="備考があれば入力してください"
                style={{width:'100%', padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px', color:'#111827', background:'white', resize:'vertical', boxSizing:'border-box'}}
              />
            </div>
          )}
        </div>
      </div>

      {/* 報告書本体（印刷対象） */}
      <div className="print-area">
        {!searched ? (
          <div style={{textAlign:'center', color:'#9ca3af', marginTop:'60px', fontSize:'14px'}}>
            ワーカーと対象月を選択して「表示」を押してください
          </div>
        ) : (
          <>
            {/* ヘッダー */}
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <h1 style={{fontSize:'22px', fontWeight:'bold', margin:'0 0 4px', color:'#111827'}}>作業報告書</h1>
              <div style={{color:'#6b7280', fontSize:'14px'}}>{selectedYear}年{selectedMonth}月分</div>
            </div>

            {/* 宛名・発行者 */}
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

            {/* 合計サマリー */}
            <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'16px', marginBottom:'24px'}}>
              <div>
                <div style={{fontSize:'12px', color:'#6b7280'}}>作業報酬合計</div>
                <div style={{fontSize:'24px', fontWeight:'bold', color:'#111827'}}>¥{totalAmount.toLocaleString()}</div>
              </div>
            </div>

            {/* 作業明細 */}
            <div style={{marginBottom:'24px'}}>
              <h2 style={{fontSize:'15px', fontWeight:'bold', borderLeft:'4px solid #3b82f6', paddingLeft:'8px', marginBottom:'12px', color:'#111827'}}>作業明細</h2>
              {records.length === 0 ? (
                <div style={{color:'#9ca3af', fontSize:'14px'}}>該当する作業記録がありません</div>
              ) : (
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                  <thead>
                    <tr style={{background:'#f3f4f6'}}>
                      <th style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'left', color:'#374151'}}>日付</th>
                      <th style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'left', color:'#374151'}}>案件名</th>
                      <th style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#374151'}}>数量</th>
                      <th style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#374151'}}>単価</th>
                      <th style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#374151'}}>金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} style={{background: i % 2 === 0 ? 'white' : '#f9fafb'}}>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', color:'#111827'}}>{r.work_date}</td>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', color:'#111827'}}>{r.projects?.name || '-'}</td>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#111827'}}>{r.quantity?.toLocaleString()}</td>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#111827'}}>¥{r.unit_price?.toLocaleString()}</td>
                        <td style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#111827'}}>¥{r.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr style={{background:'#eff6ff', fontWeight:'bold'}}>
                      <td colSpan={4} style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#111827'}}>合計</td>
                      <td style={{padding:'8px', border:'1px solid #e5e7eb', textAlign:'right', color:'#111827'}}>¥{totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            {/* 備考欄 */}
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