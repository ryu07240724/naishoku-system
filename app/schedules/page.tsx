'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SchedulesPage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterWorker, setFilterWorker] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  useEffect(() => {
    supabase.from('workers').select('*').order('name').then(({ data }) => { if (data) setWorkers(data) })
    supabase.from('projects').select('*').order('name').then(({ data }) => { if (data) setProjects(data) })
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    let query = supabase
      .from('schedules')
      .select('*, workers(name), projects(name)')
      .order('scheduled_date')
    if (filterWorker) query = query.eq('worker_id', filterWorker)
    if (filterFrom) query = query.gte('scheduled_date', filterFrom)
    if (filterTo) query = query.lte('scheduled_date', filterTo)
    const { data } = await query
    setSchedules(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この予定を削除しますか？')) return
    await supabase.from('schedules').delete().eq('id', id)
    fetchSchedules()
  }

  return (
    <div style={{minHeight:'100vh', background:'#f9fafb', color:'#111827'}}>
      <style>{`
        .sch-table { display: block; }
        .sch-cards { display: none; }
        @media (max-width: 640px) {
          .sch-table { display: none; }
          .sch-cards { display: flex; flex-direction: column; gap: 10px; }
        }
      `}</style>

      <div style={{maxWidth:900, margin:'0 auto', padding:'24px 16px'}}>

        {/* ヘッダー */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12}}>
          <h1 style={{fontSize:22, fontWeight:'bold', color:'#111827', margin:0}}>📅 作業予定管理</h1>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <button onClick={() => router.push('/schedules/print')}
              style={{padding:'8px 16px', background:'white', border:'2px solid #ea580c', borderRadius:8, color:'#ea580c', fontSize:14, fontWeight:'600', cursor:'pointer'}}>
              🖨️ 予定表印刷
            </button>
            <button onClick={() => router.push('/schedules/new')}
              style={{padding:'8px 16px', background:'#2563eb', color:'white', border:'none', borderRadius:8, fontSize:14, fontWeight:'600', cursor:'pointer'}}>
              ＋ 新規登録
            </button>
            <button onClick={() => router.push('/dashboard')}
              style={{padding:'8px 16px', background:'#6b7280', color:'white', border:'none', borderRadius:8, fontSize:14, fontWeight:'600', cursor:'pointer'}}>
              ダッシュボードへ
            </button>
          </div>
        </div>

        {/* 絞り込み */}
        <div style={{background:'white', borderRadius:12, padding:'16px 20px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:20}}>
          <div style={{display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end'}}>
            <div>
              <div style={{fontSize:12, color:'#6b7280', marginBottom:4}}>ワーカー</div>
              <select value={filterWorker} onChange={e => setFilterWorker(e.target.value)}
                style={{padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14, color:'#111827', background:'white'}}>
                <option value="">全員</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:12, color:'#6b7280', marginBottom:4}}>開始日</div>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
                style={{padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14, color:'#111827', background:'white'}} />
            </div>
            <div>
              <div style={{fontSize:12, color:'#6b7280', marginBottom:4}}>終了日</div>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
                style={{padding:'8px 12px', border:'1px solid #d1d5db', borderRadius:6, fontSize:14, color:'#111827', background:'white'}} />
            </div>
            <button onClick={fetchSchedules}
              style={{padding:'8px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:8, fontSize:14, fontWeight:'600', cursor:'pointer'}}>
              絞り込む
            </button>
            <button onClick={() => { setFilterWorker(''); setFilterFrom(''); setFilterTo(''); setTimeout(fetchSchedules, 0) }}
              style={{padding:'8px 16px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:8, fontSize:14, cursor:'pointer'}}>
              リセット
            </button>
          </div>
        </div>

        {/* 一覧 */}
        {loading ? (
          <div style={{background:'white', borderRadius:12, padding:40, textAlign:'center', color:'#6b7280'}}>読み込み中...</div>
        ) : schedules.length === 0 ? (
          <div style={{background:'white', borderRadius:12, padding:40, textAlign:'center', color:'#6b7280'}}>予定がありません</div>
        ) : (
          <>
            {/* PCテーブル */}
            <div className="sch-table" style={{background:'white', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.08)', overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:14}}>
                <thead>
                  <tr style={{background:'#f9fafb', borderBottom:'2px solid #e5e7eb'}}>
                    {['予定日','ワーカー','案件','数量','単価','備考',''].map(h => (
                      <th key={h} style={{padding:'12px 16px', textAlign:'left', fontWeight:'600', color:'#374151', whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s, i) => (
                    <tr key={s.id} style={{borderBottom:'1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa'}}>
                      <td style={{padding:'12px 16px', color:'#111827', whiteSpace:'nowrap'}}>{s.scheduled_date}</td>
                      <td style={{padding:'12px 16px', color:'#111827'}}>{s.workers?.name || '-'}</td>
                      <td style={{padding:'12px 16px', color:'#111827'}}>{s.projects?.name || '-'}</td>
                      <td style={{padding:'12px 16px', color:'#111827'}}>{s.quantity != null ? s.quantity.toLocaleString() : '-'}</td>
                      <td style={{padding:'12px 16px', color:'#111827'}}>{s.unit_price != null ? `¥${s.unit_price.toLocaleString()}` : '-'}</td>
                      <td style={{padding:'12px 16px', color:'#6b7280', fontSize:13}}>{s.note || '-'}</td>
                      <td style={{padding:'12px 16px', whiteSpace:'nowrap'}}>
                        <button onClick={() => router.push(`/schedules/${s.id}/edit`)}
                          style={{padding:'4px 12px', background:'#f3f4f6', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', marginRight:6, color:'#374151'}}>編集</button>
                        <button onClick={() => handleDelete(s.id)}
                          style={{padding:'4px 12px', background:'#fee2e2', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', color:'#dc2626'}}>削除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* スマホカード */}
            <div className="sch-cards">
              {schedules.map(s => (
                <div key={s.id + '-sp'} style={{background:'white', borderRadius:12, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
                  <div style={{fontWeight:'bold', fontSize:15, color:'#111827', marginBottom:8}}>{s.scheduled_date}</div>
                  <div style={{fontSize:13, color:'#374151', marginBottom:4}}>👷 {s.workers?.name || '-'}</div>
                  <div style={{fontSize:13, color:'#374151', marginBottom:4}}>📋 {s.projects?.name || '-'}</div>
                  {s.quantity != null && <div style={{fontSize:13, color:'#374151', marginBottom:4}}>数量：{s.quantity.toLocaleString()}</div>}
                  {s.unit_price != null && <div style={{fontSize:13, color:'#374151', marginBottom:4}}>単価：¥{s.unit_price.toLocaleString()}</div>}
                  {s.note && <div style={{fontSize:13, color:'#6b7280', marginBottom:8}}>{s.note}</div>}
                  <div style={{display:'flex', gap:8, marginTop:8}}>
                    <button onClick={() => router.push(`/schedules/${s.id}/edit`)}
                      style={{padding:'6px 16px', background:'#f3f4f6', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', color:'#374151'}}>編集</button>
                    <button onClick={() => handleDelete(s.id)}
                      style={{padding:'6px 16px', background:'#fee2e2', border:'none', borderRadius:6, fontSize:13, cursor:'pointer', color:'#dc2626'}}>削除</button>
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