'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewSchedulePage() {
  const router = useRouter()
  const [workers, setWorkers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [form, setForm] = useState({
    worker_id: '',
    project_id: '',
    start_date: '',
    delivery_date: '',
    quantity: '',
    unit_price: '',
    note: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: w } = await supabase.from('workers').select('id, name').eq('status', 'active').order('name')
      const { data: p } = await supabase.from('projects').select('id, name').order('name')
      if (w) setWorkers(w)
      if (p) setProjects(p)
    }
    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.worker_id || !form.project_id) {
      alert('ワーカーと案件は必須です')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('schedules').insert({
      worker_id: form.worker_id,
      project_id: form.project_id,
      start_date: form.start_date || null,
      delivery_date: form.delivery_date || null,
      quantity: form.quantity ? Number(form.quantity) : null,
      unit_price: form.unit_price ? Number(form.unit_price) : null,
      note: form.note || null,
    })
    setSaving(false)
    if (error) { alert('エラー: ' + error.message); return }
    router.push('/schedules')
  }

  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', color: '#111827', background: 'white', fontSize: '14px', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', color: '#111827' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>作業予定 新規登録</h1>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={labelStyle}>ワーカー <span style={{ color: 'red' }}>*</span></label>
            <select name="worker_id" value={form.worker_id} onChange={handleChange} style={inputStyle}>
              <option value="">選択してください</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>案件 <span style={{ color: 'red' }}>*</span></label>
            <select name="project_id" value={form.project_id} onChange={handleChange} style={inputStyle}>
              <option value="">選択してください</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>開始日</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>納入日</label>
              <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>数量</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} style={inputStyle} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>単価（円）</label>
              <input type="number" name="unit_price" value={form.unit_price} onChange={handleChange} style={inputStyle} placeholder="0" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>備考</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="メモがあれば入力" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ width: '100%', padding: '12px', background: saving ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? '登録中...' : '登録する'}
          </button>
        </div>
      </div>
    </div>
  )
}