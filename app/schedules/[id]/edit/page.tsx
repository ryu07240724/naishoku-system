'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Category = { id: string; name: string }
type Project = { id: string; name: string; unit_price: number; category_id: string | null }

export default function EditSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [workers, setWorkers] = useState<any[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [form, setForm] = useState({
    worker_id: '',
    project_id: '',
    start_date: '',
    delivery_date: '',
    quantity: '',
    unit_price: '',
    note: '',
  })
  const [originalStartDate, setOriginalStartDate] = useState('')
  const [repeatGroupId, setRepeatGroupId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // 保存モーダル
  const [showSaveModal, setShowSaveModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: w }, { data: p }, { data: c }, { data: s }] = await Promise.all([
        supabase.from('workers').select('id, name').eq('status', 'active').order('name'),
        supabase.from('projects').select('id, name, unit_price, category_id').order('name'),
        supabase.from('project_categories').select('*').order('sort_order').order('created_at'),
        supabase.from('schedules').select('*').eq('id', id).single(),
      ])
      if (w) setWorkers(w)
      if (p) setProjects(p)
      if (c) setCategories(c)
      if (s) {
        setForm({
          worker_id: s.worker_id || '',
          project_id: s.project_id || '',
          start_date: s.start_date || '',
          delivery_date: s.delivery_date || '',
          quantity: s.quantity != null ? String(s.quantity) : '',
          unit_price: s.unit_price != null ? String(s.unit_price) : '',
          note: s.note || '',
        })
        setOriginalStartDate(s.start_date || '')
        setRepeatGroupId(s.repeat_group_id || null)
        if (s.project_id && p) {
          const proj = p.find((x: Project) => x.id === s.project_id)
          if (proj?.category_id) setSelectedCategoryId(proj.category_id)
          else if (proj && !proj.category_id) setSelectedCategoryId('none')
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const filteredProjects = selectedCategoryId === ''
    ? projects
    : selectedCategoryId === 'none'
      ? projects.filter(p => !p.category_id)
      : projects.filter(p => p.category_id === selectedCategoryId)

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value)
    setForm(prev => ({ ...prev, project_id: '', unit_price: '' }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'project_id') {
      const selected = projects.find(p => p.id === value)
      setForm(prev => ({
        ...prev,
        project_id: value,
        unit_price: selected?.unit_price != null ? String(selected.unit_price) : prev.unit_price,
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  // 保存ボタン：グループあり→モーダル表示
  const handleSaveClick = () => {
    if (!form.worker_id || !form.project_id) {
      alert('ワーカーと案件は必須です'); return
    }
    if (repeatGroupId) {
      setShowSaveModal(true)
    } else {
      execSave('single')
    }
  }

  const execSave = async (mode: 'single' | 'after' | 'all') => {
    setSaving(true)
    setShowSaveModal(false)

    const updateData = {
      worker_id: form.worker_id,
      project_id: form.project_id,
      delivery_date: form.delivery_date || null,
      quantity: form.quantity ? Number(form.quantity) : null,
      unit_price: form.unit_price ? Number(form.unit_price) : null,
      note: form.note || null,
    }

    if (mode === 'single') {
      const { error } = await supabase.from('schedules').update({
        ...updateData,
        start_date: form.start_date || null,
      }).eq('id', id)
      if (error) { alert('エラー: ' + error.message); setSaving(false); return }

    } else if (mode === 'after' && repeatGroupId && originalStartDate) {
      // 以降の同グループを一括更新（start_dateは各自保持・それ以外を更新）
      const { error } = await supabase.from('schedules').update(updateData)
        .eq('repeat_group_id', repeatGroupId)
        .gte('start_date', originalStartDate)
      if (error) { alert('エラー: ' + error.message); setSaving(false); return }

    } else if (mode === 'all' && repeatGroupId) {
      // グループ全件を一括更新
      const { error } = await supabase.from('schedules').update(updateData)
        .eq('repeat_group_id', repeatGroupId)
      if (error) { alert('エラー: ' + error.message); setSaving(false); return }
    }

    setSaving(false)
    router.push('/schedules')
  }

  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', color: '#111827', background: 'white', fontSize: '14px', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' } as const

  if (loading) return <div style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>読み込み中...</div>

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', color: '#111827' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>作業予定 編集</h1>
          {repeatGroupId && (
            <span style={{ fontSize: '12px', background: '#ede9fe', color: '#7c3aed', borderRadius: '6px', padding: '3px 8px', fontWeight: 700 }}>🔁 繰返グループ</span>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ワーカー */}
          <div>
            <label style={labelStyle}>ワーカー <span style={{ color: 'red' }}>*</span></label>
            <select name="worker_id" value={form.worker_id} onChange={handleChange} style={inputStyle}>
              <option value="">選択してください</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {/* 案件：2段階選択 */}
          <div>
            <label style={labelStyle}>案件 <span style={{ color: 'red' }}>*</span></label>
            <select value={selectedCategoryId} onChange={handleCategoryChange} style={{ ...inputStyle, marginBottom: '6px' }}>
              <option value="">すべての大項目</option>
              {categories.map(c => <option key={c.id} value={c.id}>📁 {c.name}</option>)}
              <option value="none">📁 未分類</option>
            </select>
            <select name="project_id" value={form.project_id} onChange={handleChange} style={inputStyle}>
              <option value="">案件を選択してください</option>
              {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {filteredProjects.length === 0 && selectedCategoryId && (
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>この大項目に案件がありません</p>
            )}
          </div>

          {/* 開始日・納入日 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>開始日{repeatGroupId && <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 400 }}>（この予定のみ）</span>}</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>納入日</label>
              <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* 数量・単価 */}
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

          {/* 備考 */}
          <div>
            <label style={labelStyle}>備考</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="メモがあれば入力" />
          </div>

          <button onClick={handleSaveClick} disabled={saving}
            style={{ width: '100%', padding: '12px', background: saving ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>

      {/* 保存モーダル */}
      {showSaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>🔁 繰り返し予定の変更</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>
              この予定は繰り返しグループに属しています。<br />どの範囲を変更しますか？<br />
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>※開始日の変更はこの予定のみに適用されます</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => execSave('single')}
                disabled={saving}
                style={{ padding: '12px', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#111827', textAlign: 'left' }}>
                <span style={{ fontWeight: 700 }}>この予定のみ変更</span><br />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{originalStartDate} の1件だけを変更します</span>
              </button>
              <button
                onClick={() => execSave('after')}
                disabled={saving}
                style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#111827', textAlign: 'left' }}>
                <span style={{ fontWeight: 700 }}>この予定以降をまとめて変更</span><br />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{originalStartDate} 以降の同グループを変更します（単価・数量・案件・備考）</span>
              </button>
              <button
                onClick={() => execSave('all')}
                disabled={saving}
                style={{ padding: '12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#111827', textAlign: 'left' }}>
                <span style={{ fontWeight: 700 }}>グループ全件を変更</span><br />
                <span style={{ fontSize: '12px', color: '#92400e' }}>このグループの予定すべてを変更します（単価・数量・案件・備考）</span>
              </button>
            </div>
            <button
              onClick={() => setShowSaveModal(false)}
              disabled={saving}
              style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}