'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Category = { id: string; name: string }

export default function EditProjectPage() {
  const router = useRouter()
  const { id } = useParams()
  const [form, setForm] = useState({
    name: '',
    product_name: '',
    unit_price: '',
    unit: '',
    client_name: '',
    status: 'active',
    start_date: '',
    end_date: '',
    note: '',
  })
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: project }, { data: cats }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_categories').select('*').order('sort_order').order('created_at'),
      ])
      if (project) {
        setForm({
          name: project.name ?? '',
          product_name: project.product_name ?? '',
          unit_price: String(project.unit_price ?? ''),
          unit: project.unit ?? '',
          client_name: project.client_name ?? '',
          status: project.status ?? 'active',
          start_date: project.start_date ?? '',
          end_date: project.end_date ?? '',
          note: project.note ?? '',
        })
        setCategoryId(project.category_id ?? '')
      }
      setCategories(cats || [])
      setLoading(false)
    }
    fetchAll()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.unit_price) { setError('案件名・単価は必須です'); return }
    setSaving(true)
    const { error } = await supabase.from('projects').update({
      name: form.name,
      product_name: form.product_name,
      unit_price: Number(form.unit_price),
      unit: form.unit,
      client_name: form.client_name,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      note: form.note,
      category_id: categoryId || null,
    }).eq('id', id)
    if (error) { setError('更新に失敗しました: ' + error.message); setSaving(false); return }
    router.push(`/projects/${id}`)
  }

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>

  const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', background: 'white', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>✏️ 案件を編集</h1>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        {/* 大項目 */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>大項目</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
            <option value="">未分類</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>案件名*</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>製品名</label>
          <input type="text" name="product_name" value={form.product_name} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>単価*</label>
          <input type="number" name="unit_price" value={form.unit_price} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>単位（例：個、枚）</label>
          <input type="text" name="unit" value={form.unit} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>依頼元</label>
          <input type="text" name="client_name" value={form.client_name} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>ステータス</label>
          <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
            <option value="active">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>開始日</label>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>終了予定日</label>
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>メモ</label>
          <textarea name="note" value={form.note} onChange={handleChange} rows={3} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
            {saving ? '保存中...' : '保存する'}
          </button>
          <button onClick={() => router.push(`/projects/${id}`)}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}