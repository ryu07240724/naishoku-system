'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

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
  const [repeatType, setRepeatType] = useState<RepeatType>('none')
  const [repeatWeekdays, setRepeatWeekdays] = useState<number[]>([])
  const [repeatCount, setRepeatCount] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleWeekday = (d: number) => {
    setRepeatWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    )
  }

  const buildDates = (baseDate: string): string[] => {
    if (!baseDate) return []
    const [y, m, d] = baseDate.split('-').map(Number)
    const base = new Date(y, m - 1, d)
    const count = Math.max(1, Math.min(Number(repeatCount) || 1, 365))
    const dates: string[] = []

    if (repeatType === 'none') {
      return [baseDate]
    } else if (repeatType === 'daily') {
      for (let i = 0; i < count; i++) {
        const dt = new Date(base)
        dt.setDate(dt.getDate() + i)
        dates.push(fmt(dt))
      }
    } else if (repeatType === 'weekly') {
      const days = repeatWeekdays.length > 0 ? repeatWeekdays : [base.getDay()]
      let added = 0
      let offset = 0
      while (added < count) {
        const dt = new Date(base)
        dt.setDate(dt.getDate() + offset)
        if (days.includes(dt.getDay())) {
          dates.push(fmt(dt))
          added++
        }
        offset++
        if (offset > 1000) break
      }
    } else if (repeatType === 'monthly') {
      for (let i = 0; i < count; i++) {
        const dt = new Date(y, m - 1 + i, d)
        dates.push(fmt(dt))
      }
    }
    return dates
  }

  const fmt = (dt: Date) => {
    const yy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  }

  const handlePreview = () => {
    if (!form.start_date) { setError('開始日を入力してください'); return }
    setError('')
    setPreview(buildDates(form.start_date))
  }

  const handleSubmit = async () => {
    if (!form.name) { setError('案件名は必須です'); return }
    if (!form.unit_price || isNaN(Number(form.unit_price))) { setError('単価を正しく入力してください'); return }
    if (repeatType !== 'none' && !form.start_date) { setError('繰り返し設定時は開始日が必須です'); return }

    setLoading(true)
    const dates = buildDates(form.start_date)
    const groupId = repeatType !== 'none' && dates.length > 1
      ? crypto.randomUUID()
      : null

    const records = dates.map((date, i) => ({
      name: form.name,
      product_name: form.product_name || null,
      unit_price: Number(form.unit_price),
      unit: form.unit,
      client_name: form.client_name || null,
      start_date: date,
      end_date: i === dates.length - 1 ? (form.end_date || null) : null,
      note: form.note || null,
      repeat_group_id: groupId,
    }))

    const { error } = await supabase.from('projects').insert(records)
    if (error) {
      setError('登録に失敗しました: ' + error.message)
      setLoading(false)
      return
    }
    router.push('/projects')
  }

  const previewDates = form.start_date ? buildDates(form.start_date) : []

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
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

      {/* 繰り返し設定 */}
      <div style={{ borderTop: '2px dashed #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1rem', color: '#6b7280' }}>🔁 繰り返し設定</p>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>繰り返しパターン</label>
          <select
            value={repeatType}
            onChange={(e) => { setRepeatType(e.target.value as RepeatType); setPreview([]) }}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
          >
            <option value="none">繰り返しなし（1件のみ）</option>
            <option value="daily">毎日</option>
            <option value="weekly">毎週（曜日指定）</option>
            <option value="monthly">毎月</option>
          </select>
        </div>

        {repeatType === 'weekly' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>曜日を選択</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {WEEKDAYS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => toggleWeekday(i)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%', border: '2px solid',
                    borderColor: repeatWeekdays.includes(i) ? '#2563eb' : '#d1d5db',
                    backgroundColor: repeatWeekdays.includes(i) ? '#2563eb' : 'white',
                    color: repeatWeekdays.includes(i) ? 'white' : '#374151',
                    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {repeatType !== 'none' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
              回数（最大365）
            </label>
            <input
              type="number"
              value={repeatCount}
              onChange={(e) => setRepeatCount(e.target.value)}
              min={1}
              max={365}
              style={{ width: '120px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
            />
            <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>件登録されます</span>
          </div>
        )}

        {repeatType !== 'none' && form.start_date && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#166534', marginBottom: '0.5rem' }}>
              📅 登録予定日（{previewDates.length}件）
            </p>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {previewDates.map((d, i) => (
                <p key={i} style={{ margin: '0.15rem 0', fontSize: '0.85rem', color: '#374151' }}>{d}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          {loading ? '登録中...' : repeatType !== 'none' ? `${previewDates.length}件まとめて登録` : '登録する'}
        </button>
        <button
          onClick={() => router.push('/projects')}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          キャンセル
        </button>
      </div>
    </div>
    </div>
  )
}