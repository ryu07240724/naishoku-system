'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Category = { id: string; name: string }
type Project = { id: string; name: string; unit_price: number; category_id: string | null }
type RepeatType = 'none' | 'weekly' | 'monthly_date' | 'monthly_weekday'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function NewSchedulePage() {
  const router = useRouter()
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

  // 繰り返し設定
  const [repeatType, setRepeatType] = useState<RepeatType>('none')
  const [repeatWeekdays, setRepeatWeekdays] = useState<number[]>([])
  const [repeatCount, setRepeatCount] = useState('4')
  const [intervalWeeks, setIntervalWeeks] = useState('1')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: w }, { data: p }, { data: c }] = await Promise.all([
        supabase.from('workers').select('id, name').eq('status', 'active').order('name'),
        supabase.from('projects').select('id, name, unit_price, category_id').order('name'),
        supabase.from('project_categories').select('*').order('sort_order').order('created_at'),
      ])
      if (w) setWorkers(w)
      if (p) setProjects(p)
      if (c) setCategories(c)
    }
    fetchData()
  }, [])

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

  const toggleWeekday = (d: number) => {
    setRepeatWeekdays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()
    )
  }

  const fmt = (dt: Date) => {
    const yy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  }

  // 繰り返し日付リストを生成（開始日ベース）
  const buildStartDates = (): string[] => {
    if (repeatType === 'none' || !form.start_date) return form.start_date ? [form.start_date] : []
    const [y, m, d] = form.start_date.split('-').map(Number)
    const base = new Date(y, m - 1, d)
    const count = Math.max(1, Math.min(Number(repeatCount) || 1, 52))
    const dates: string[] = []

    if (repeatType === 'weekly') {
      // 指定曜日で毎週（interval週ごと）
      const days = repeatWeekdays.length > 0 ? repeatWeekdays : [base.getDay()]
      const interval = Math.max(1, Number(intervalWeeks) || 1)
      let added = 0, offset = 0
      while (added < count) {
        const dt = new Date(base)
        dt.setDate(dt.getDate() + offset)
        if (days.includes(dt.getDay())) {
          // interval週ごとチェック
          const weekDiff = Math.floor(offset / 7)
          if (weekDiff % interval === 0) {
            dates.push(fmt(dt))
            added++
          }
        }
        offset++
        if (offset > 730) break
      }
    } else if (repeatType === 'monthly_date') {
      // 毎月同じ日付
      for (let i = 0; i < count; i++) {
        const dt = new Date(y, m - 1 + i, d)
        dates.push(fmt(dt))
      }
    } else if (repeatType === 'monthly_weekday') {
      // 毎月同じ曜日（例：第2月曜）
      const weekNum = Math.ceil(d / 7) // 何週目か
      const weekday = base.getDay()
      for (let i = 0; i < count; i++) {
        // i月後の1日
        const firstDay = new Date(y, m - 1 + i, 1)
        // その月のweekday曜日を探す
        let found = 0
        for (let day = 1; day <= 31; day++) {
          const dt = new Date(y, m - 1 + i, day)
          if (dt.getMonth() !== (m - 1 + i) % 12 && dt.getFullYear() !== y + Math.floor((m - 1 + i) / 12)) break
          if (dt.getDay() === weekday) {
            found++
            if (found === weekNum) { dates.push(fmt(dt)); break }
          }
        }
      }
    }
    return dates
  }

  const previewDates = buildStartDates()

  const handleSubmit = async () => {
    if (!form.worker_id || !form.project_id) {
      alert('ワーカーと案件は必須です'); return
    }
    if (repeatType !== 'none' && !form.start_date) {
      alert('繰り返し設定時は開始日が必須です'); return
    }
    setSaving(true)

    if (repeatType === 'none') {
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
    } else {
      // 繰り返し：複数件insert
      const records = previewDates.map(date => ({
        worker_id: form.worker_id,
        project_id: form.project_id,
        start_date: date,
        delivery_date: null,
        quantity: form.quantity ? Number(form.quantity) : null,
        unit_price: form.unit_price ? Number(form.unit_price) : null,
        note: form.note || null,
      }))
      const { error } = await supabase.from('schedules').insert(records)
      setSaving(false)
      if (error) { alert('エラー: ' + error.message); return }
    }
    router.push('/schedules')
  }

  const inputStyle = {
    width: '100%', padding: '8px', border: '1px solid #d1d5db',
    borderRadius: '6px', color: '#111827', background: 'white',
    fontSize: '14px', boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' } as const

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', color: '#111827' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>作業予定 新規登録</h1>
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
            <textarea name="note" value={form.note} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="メモがあれば入力" />
          </div>
        </div>

        {/* 繰り返し設定 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginTop: '16px', border: '2px dashed #e5e7eb' }}>
          <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px', color: '#374151', margin: '0 0 16px' }}>🔁 繰り返し設定</p>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>繰り返しパターン</label>
            <select value={repeatType} onChange={e => { setRepeatType(e.target.value as RepeatType); setRepeatWeekdays([]) }}
              style={inputStyle}>
              <option value="none">繰り返しなし（1件のみ）</option>
              <option value="weekly">毎週（曜日指定）</option>
              <option value="monthly_date">毎月同じ日付（例：毎月15日）</option>
              <option value="monthly_weekday">毎月同じ曜日（例：毎月第2月曜）</option>
            </select>
          </div>

          {/* 開始日（繰り返しの起点） */}
          <div style={{ display: 'grid', gridTemplateColumns: repeatType === 'none' ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>{repeatType === 'none' ? '開始日' : '繰り返し開始日'}</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} style={inputStyle} />
            </div>
            {repeatType === 'none' && (
              <div>
                <label style={labelStyle}>納入日</label>
                <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} style={inputStyle} />
              </div>
            )}
          </div>

          {/* 毎週：曜日選択 */}
          {repeatType === 'weekly' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>曜日を選択</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {WEEKDAYS.map((label, i) => (
                    <button key={i} onClick={() => toggleWeekday(i)} style={{
                      width: '40px', height: '40px', borderRadius: '50%', border: '2px solid',
                      borderColor: repeatWeekdays.includes(i) ? '#2563eb' : '#d1d5db',
                      backgroundColor: repeatWeekdays.includes(i) ? '#2563eb' : 'white',
                      color: repeatWeekdays.includes(i) ? 'white' : '#374151',
                      fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
                    }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>隔週設定（何週ごと）</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="number" value={intervalWeeks} onChange={e => setIntervalWeeks(e.target.value)}
                    min={1} max={4}
                    style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', background: 'white' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>週ごと</span>
                </div>
              </div>
            </>
          )}

          {/* 回数 */}
          {repeatType !== 'none' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>登録回数（最大52）</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" value={repeatCount} onChange={e => setRepeatCount(e.target.value)}
                  min={1} max={52}
                  style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', background: 'white' }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>件登録されます</span>
              </div>
            </div>
          )}

          {/* プレビュー */}
          {repeatType !== 'none' && form.start_date && previewDates.length > 0 && (
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#1e40af', margin: '0 0 8px' }}>
                📅 登録予定日（{previewDates.length}件）
              </p>
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {previewDates.map((d, i) => (
                  <span key={i} style={{ fontSize: '12px', background: 'white', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '2px 8px', color: '#1e40af' }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={saving}
          style={{ width: '100%', padding: '14px', background: saving ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', marginTop: '16px' }}>
          {saving ? '登録中...' : repeatType !== 'none' ? `🔁 ${previewDates.length}件まとめて登録` : '登録する'}
        </button>
      </div>
    </div>
  )
}