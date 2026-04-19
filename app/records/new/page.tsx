'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Worker = { id: string; name: string }
type Project = { id: string; name: string; unit_price: number; unit: string | null; category_id: string | null }
type Category = { id: string; name: string }

export default function NewRecordPage() {
  const router = useRouter()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [form, setForm] = useState({
    worker_id: '',
    project_id: '',
    work_date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })(),
    quantity: '',
    note: '',
  })
  const [unitPrice, setUnitPrice] = useState(0)
  const [unit, setUnit] = useState('個')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const [{ data: w }, { data: p }, { data: c }] = await Promise.all([
        supabase.from('workers').select('id, name').eq('status', 'active'),
        supabase.from('projects').select('id, name, unit_price, unit, category_id').eq('status', 'active'),
        supabase.from('project_categories').select('*').order('sort_order').order('created_at'),
      ])
      if (w) setWorkers(w)
      if (p) setProjects(p)
      if (c) setCategories(c)
    }
    load()
  }, [])

  // 大項目でフィルタした案件
  const filteredProjects = selectedCategoryId === ''
    ? projects
    : selectedCategoryId === 'none'
      ? projects.filter(p => !p.category_id)
      : projects.filter(p => p.category_id === selectedCategoryId)

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value)
    setForm(f => ({ ...f, project_id: '' }))
    setUnitPrice(0)
    setUnit('個')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (name === 'project_id') {
      const selected = projects.find((p) => p.id === value)
      if (selected) { setUnitPrice(selected.unit_price); setUnit(selected.unit ?? '個') }
    }
  }

  const handleSubmit = async () => {
    if (!form.worker_id || !form.project_id || !form.work_date || !form.quantity) {
      setError('ワーカー・案件・作業日・個数は必須です'); return
    }
    setLoading(true)
    const { error } = await supabase.from('work_records').insert([{
      worker_id: form.worker_id,
      project_id: form.project_id,
      work_date: form.work_date,
      quantity: Number(form.quantity),
      unit_price: unitPrice,
      note: form.note,
    }])
    if (error) { setError('登録に失敗しました: ' + error.message); setLoading(false); return }
    router.push('/records')
  }

  const amount = unitPrice * Number(form.quantity || 0)

  const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', background: 'white', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📝 作業記録追加</h1>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        {/* ワーカー */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>ワーカー*</label>
          <select name="worker_id" value={form.worker_id} onChange={handleChange} style={inputStyle}>
            <option value="">選択してください</option>
            {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        {/* 案件：2段階選択 */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={labelStyle}>案件*</label>
          {/* ① 大項目 */}
          <select value={selectedCategoryId} onChange={handleCategoryChange} style={{ ...inputStyle, marginBottom: '0.5rem' }}>
            <option value="">すべての大項目</option>
            {categories.map(c => <option key={c.id} value={c.id}>📁 {c.name}</option>)}
            <option value="none">📁 未分類</option>
          </select>
          {/* ② 小項目（案件） */}
          <select name="project_id" value={form.project_id} onChange={handleChange} style={inputStyle}>
            <option value="">案件を選択してください</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}（¥{p.unit_price}/{p.unit ?? '個'}）</option>
            ))}
          </select>
          {filteredProjects.length === 0 && selectedCategoryId && (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '4px 0 0' }}>この大項目に案件がありません</p>
          )}
        </div>

        {/* 作業日 */}
        <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
          <label style={labelStyle}>作業日*</label>
          <input type="date" name="work_date" value={form.work_date} onChange={handleChange} style={inputStyle} />
        </div>

        {/* 個数 */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>個数*</label>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="0" style={inputStyle} />
        </div>

        {/* 金額プレビュー */}
        {form.project_id && form.quantity && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}>報酬（自動計算）</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>¥{amount.toLocaleString()}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>¥{unitPrice.toLocaleString()} × {Number(form.quantity).toLocaleString()}{unit}</p>
          </div>
        )}

        {/* メモ */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>メモ</label>
          <textarea name="note" value={form.note} onChange={handleChange} rows={3} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
            {loading ? '登録中...' : '記録する'}
          </button>
          <button onClick={() => router.push('/records')}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}