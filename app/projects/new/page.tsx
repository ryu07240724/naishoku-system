'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Category = { id: string; name: string }

export default function NewProjectPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    product_name: '',
    unit_price: '',
    unit: '個',
    client_name: '',
    start_date: '',
    end_date: '',
    note: '',
  })
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('project_categories').select('*').order('sort_order').order('created_at')
      setCategories(data || [])
    }
    load()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name) { setError('案件名は必須です'); return }
    if (!form.unit_price || isNaN(Number(form.unit_price))) { setError('単価を正しく入力してください'); return }

    setLoading(true)
    const { error } = await supabase.from('projects').insert({
      name: form.name,
      product_name: form.product_name || null,
      unit_price: Number(form.unit_price),
      unit: form.unit,
      client_name: form.client_name || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      note: form.note || null,
      category_id: categoryId || null,
    })
    if (error) { setError('登録に失敗しました: ' + error.message); setLoading(false); return }
    router.push('/projects')
  }

  const inputStyle = {
    width: '100%', padding: '0.5rem', border: '1px solid #d1d5db',
    borderRadius: '6px', fontSize: '1rem', color: '#111827',
    background: 'white', boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📋 案件新規登録</h1>
        </div>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* 大項目 */}
          <div>
            <label style={labelStyle}>大項目</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
              <option value="">未分類</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>📁 {c.name}</option>
              ))}
            </select>
          </div>

          {/* 案件名 */}
          <div>
            <label style={labelStyle}>案件名 <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
          </div>

          {/* 製品名 */}
          <div>
            <label style={labelStyle}>製品名</label>
            <input type="text" name="product_name" value={form.product_name} onChange={handleChange} style={inputStyle} />
          </div>

          {/* 依頼元 */}
          <div>
            <label style={labelStyle}>依頼元</label>
            <input type="text" name="client_name" value={form.client_name} onChange={handleChange} style={inputStyle} />
          </div>

          {/* 開始日・終了日 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>開始日</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>終了予定日</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* 単価 */}
          <div>
            <label style={labelStyle}>単価 <span style={{ color: 'red' }}>*</span></label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>¥</span>
              <input type="number" name="unit_price" value={form.unit_price} onChange={handleChange}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', background: 'white' }} />
              <span>/</span>
              <input type="text" name="unit" value={form.unit} onChange={handleChange}
                style={{ width: '80px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', background: 'white' }} />
            </div>
          </div>

          {/* メモ */}
          <div>
            <label style={labelStyle}>メモ</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '8px' }}>
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 1, padding: '0.7rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
              {loading ? '登録中...' : '登録する'}
            </button>
            <button onClick={() => router.push('/projects')}
              style={{ flex: 1, padding: '0.7rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}