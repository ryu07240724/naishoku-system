'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) { setLoading(false); return }
      setForm({
        name: data.name ?? '',
        product_name: data.product_name ?? '',
        unit_price: String(data.unit_price ?? ''),
        unit: data.unit ?? '',
        client_name: data.client_name ?? '',
        status: data.status ?? 'active',
        start_date: data.start_date ?? '',
        end_date: data.end_date ?? '',
        note: data.note ?? '',
      })
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.unit_price) {
      setError('案件名・単価は必須です')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('projects')
      .update({
        name: form.name,
        product_name: form.product_name,
        unit_price: Number(form.unit_price),
        unit: form.unit,
        client_name: form.client_name,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        note: form.note,
      })
      .eq('id', id)
    if (error) {
      setError('更新に失敗しました: ' + error.message)
      setSaving(false)
      return
    }
    router.push(`/projects/${id}`)
  }

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>✏️ 案件を編集</h1>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>案件名*</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>製品名</label>
        <input
          type="text"
          name="product_name"
          value={form.product_name}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>単価*</label>
        <input
          type="number"
          name="unit_price"
          value={form.unit_price}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>単位（例：個、枚）</label>
        <input
          type="text"
          name="unit"
          value={form.unit}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>依頼元</label>
        <input
          type="text"
          name="client_name"
          value={form.client_name}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>ステータス</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        >
          <option value="active">進行中</option>
          <option value="completed">完了</option>
          <option value="cancelled">キャンセル</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>開始日</label>
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>終了予定日</label>
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>メモ</label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          rows={3}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          {saving ? '保存中...' : '保存する'}
        </button>
        <button
          onClick={() => router.push(`/projects/${id}`)}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}