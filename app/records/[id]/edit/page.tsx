'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Worker = { id: string; name: string }
type Project = { id: string; name: string; unit_price: number; unit: string | null }

export default function EditRecordPage() {
  const router = useRouter()
  const { id } = useParams()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState({
    worker_id: '',
    project_id: '',
    work_date: '',
    quantity: '',
    note: '',
  })
  const [unitPrice, setUnitPrice] = useState(0)
  const [unit, setUnit] = useState('個')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: w }, { data: p }, { data: record }] = await Promise.all([
        supabase.from('workers').select('id, name'),
        supabase.from('projects').select('id, name, unit_price, unit'),
        supabase.from('work_records').select('*').eq('id', id).single(),
      ])
      if (w) setWorkers(w)
      if (p) setProjects(p)
      if (record) {
        setForm({
          worker_id: record.worker_id ?? '',
          project_id: record.project_id ?? '',
          work_date: record.work_date ?? '',
          quantity: String(record.quantity ?? ''),
          note: record.note ?? '',
        })
        setUnitPrice(record.unit_price ?? 0)
        const matched = p?.find((proj) => proj.id === record.project_id)
        if (matched) setUnit(matched.unit ?? '個')
      }
      setLoading(false)
    }
    fetchAll()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    if (name === 'project_id') {
      const selected = projects.find((p) => p.id === value)
      if (selected) {
        setUnitPrice(selected.unit_price)
        setUnit(selected.unit ?? '個')
      }
    }
  }

  const handleSubmit = async () => {
    if (!form.worker_id || !form.project_id || !form.work_date || !form.quantity) {
      setError('ワーカー・案件・作業日・個数は必須です')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('work_records').update({
      worker_id: form.worker_id,
      project_id: form.project_id,
      work_date: form.work_date,
      quantity: Number(form.quantity),
      unit_price: unitPrice,
      note: form.note,
    }).eq('id', id)
    if (error) {
      setError('更新に失敗しました: ' + error.message)
      setSaving(false)
      return
    }
    router.push(`/records/${id}`)
  }

  const amount = unitPrice * Number(form.quantity || 0)

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>✏️ 作業記録を編集</h1>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>ワーカー*</label>
        <select
          name="worker_id"
          value={form.worker_id}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        >
          <option value="">選択してください</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>案件*</label>
        <select
          name="project_id"
          value={form.project_id}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        >
          <option value="">選択してください</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}（¥{p.unit_price}/{p.unit ?? '個'}）</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>作業日*</label>
        <input
          type="date"
          name="work_date"
          value={form.work_date}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>個数*</label>
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="0"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
      </div>

      {form.project_id && form.quantity && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}>報酬（自動計算）</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>
            ¥{amount.toLocaleString()}
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>
            ¥{unitPrice.toLocaleString()} × {Number(form.quantity).toLocaleString()}{unit}
          </p>
        </div>
      )}

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

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          {saving ? '保存中...' : '保存する'}
        </button>
        <button
          onClick={() => router.push(`/records/${id}`)}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          キャンセル
        </button>
      </div>
    </div>
    </div>
  )
}