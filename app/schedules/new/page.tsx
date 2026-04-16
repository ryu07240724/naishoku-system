'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ScheduleNewPage() {
  const router = useRouter()
  const [workers, setWorkers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [workerId, setWorkerId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('workers').select('*').order('name').then(({ data }) => { if (data) setWorkers(data) })
    supabase.from('projects').select('*').order('name').then(({ data }) => { if (data) setProjects(data) })
  }, [])

  const handleSave = async () => {
    if (!workerId || !projectId || !scheduledDate) {
      alert('ワーカー・案件・予定日は必須です')
      return
    }
    setSaving(true)
    await supabase.from('schedules').insert({
      worker_id: workerId,
      project_id: projectId,
      scheduled_date: scheduledDate,
      quantity: quantity !== '' ? Number(quantity) : null,
      unit_price: unitPrice !== '' ? Number(unitPrice) : null,
      note: note || null,
    })
    router.push('/schedules')
  }

  return (
    <div style={{minHeight:'100vh', background:'#f9fafb', color:'#111827'}}>
      <div style={{maxWidth:600, margin:'0 auto', padding:'24px 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
          <Link href="/schedules" style={{color:'#6b7280', textDecoration:'none', fontSize:14}}>← 予定一覧へ戻る</Link>
          <span style={{color:'#6b7280'}}>|</span>
          <span style={{fontWeight:'bold', fontSize:16, color:'#111827'}}>作業予定 新規登録</span>
        </div>

        <div style={{background:'white', borderRadius:12, padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
          {[
            { label: 'ワーカー *', node: (
              <select value={workerId} onChange={e => setWorkerId(e.target.value)}
                style={{width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, color:'#111827', background:'white'}}>
                <option value="">選択してください</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            )},
            { label: '案件 *', node: (
              <select value={projectId} onChange={e => setProjectId(e.target.value)}
                style={{width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, color:'#111827', background:'white'}}>
                <option value="">選択してください</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )},
            { label: '予定日 *', node: (
              <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                style={{width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, color:'#111827', background:'white', boxSizing:'border-box'}} />
            )},
            { label: '数量', node: (
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="任意"
                style={{width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, color:'#111827', background:'white', boxSizing:'border-box'}} />
            )},
            { label: '単価', node: (
              <input type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="任意"
                style={{width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, color:'#111827', background:'white', boxSizing:'border-box'}} />
            )},
            { label: '備考', node: (
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="任意"
                style={{width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, color:'#111827', background:'white', resize:'vertical', boxSizing:'border-box'}} />
            )},
          ].map(({ label, node }) => (
            <div key={label} style={{marginBottom:16}}>
              <div style={{fontSize:13, fontWeight:'600', color:'#374151', marginBottom:6}}>{label}</div>
              {node}
            </div>
          ))}

          <div style={{display:'flex', gap:10, marginTop:8}}>
            <button onClick={handleSave} disabled={saving}
              style={{padding:'10px 24px', background:'#2563eb', color:'white', border:'none', borderRadius:8, fontSize:14, fontWeight:'600', cursor:'pointer'}}>
              {saving ? '保存中...' : '保存する'}
            </button>
            <button onClick={() => router.push('/schedules')}
              style={{padding:'10px 24px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:8, fontSize:14, cursor:'pointer'}}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}