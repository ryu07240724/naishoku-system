'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name) {
      setError('案件名は必須です')
      return
    }
    if (!form.unit_price || isNaN(Number(form.unit_price))) {
      setError('単価を正しく入力してください')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('projects').insert([{
      ...form,
      unit_price: Number(form.unit_price),
    }])
    if (error) {
      setError('登録に失敗しました: ' + error.message)
      setLoading(false)
      return
    }
    router.push('/projects')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📋 案件新規登録</h1>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {[
        { label: '案件名*', name: 'name', type: 'input' },
        { label: '製品名', name: 'product_name', type: 'input' },
        { label: '依頼元', name: 'client_name', type: 'input' },
        { label: '開始日', name: 'start_date', type: 'date' },
        { label: '終了予定日', name: 'end_date', type: 'date' },
      ].map((f) => (
        <div key={f.name} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>{f.label}</label>
          <input
            type={f.type === 'date' ? 'date' : 'text'}
            name={f.name}
            value={form[f.name as keyof typeof form]}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
          />
        </div>
      ))}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>単価*</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>¥</span>
          <input
            type="number"
            name="unit_price"
            value={form.unit_price}
            onChange={handleChange}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
          />
          <span>/</span>
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            style={{ width: '80px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>メモ</label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          rows={3}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          {loading ? '登録中...' : '登録する'}
        </button>
        <button
          onClick={() => router.push('/projects')}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}