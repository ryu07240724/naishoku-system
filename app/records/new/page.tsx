'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Worker = { id: string; name: string }
type Project = { id: string; name: string; unit_price: number; unit: string | null; category_id: string | null }
type Category = { id: string; name: string }
type Schedule = {
  id: string
  project_id: string
  start_date: string | null
  delivery_date: string | null
  quantity: number | null
  unit_price: number | null
  projects: { name: string } | null
}

export default function NewRecordPage() {
  const router = useRouter()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  // 作業予定関連
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [useSchedule, setUseSchedule] = useState<'select' | 'manual'>('select')
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [schedulesLoading, setSchedulesLoading] = useState(false)

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

  // ワーカー選択時に作業予定を取得
  const handleWorkerChange = async (workerId: string) => {
    setForm(f => ({ ...f, worker_id: workerId, project_id: '' }))
    setSelectedScheduleId('')
    setUnitPrice(0)
    setUnit('個')
    setSchedules([])
    if (!workerId) return

    setSchedulesLoading(true)
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    // 今日以降の予定を取得
    const { data } = await supabase
      .from('schedules')
      .select('id, project_id, start_date, delivery_date, quantity, unit_price, projects(name)')
      .eq('worker_id', workerId)
      .gte('start_date', todayStr)
      .order('start_date', { ascending: true })
      .limit(30)
    setSchedules(data || [])
    setSchedulesLoading(false)
  }

  // 作業予定を選択したとき各フィールドに自動入力
  const handleScheduleSelect = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId)
    if (!scheduleId) {
      setForm(f => ({ ...f, project_id: '' }))
      setUnitPrice(0)
      setUnit('個')
      return
    }
    const s = schedules.find(x => x.id === scheduleId)
    if (!s) return
    const proj = projects.find(p => p.id === s.project_id)
    setForm(f => ({
      ...f,
      project_id: s.project_id,
      work_date: s.start_date ?? f.work_date,
      quantity: s.quantity != null ? String(s.quantity) : '',
    }))
    // 予定に単価があればそれを、なければ案件の単価を使う
    const price = s.unit_price != null ? s.unit_price : (proj?.unit_price ?? 0)
    setUnitPrice(price)
    setUnit(proj?.unit ?? '個')
    // 大項目も自動セット
    if (proj?.category_id) setSelectedCategoryId(proj.category_id)
    else setSelectedCategoryId('none')
  }

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
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'project_id') {
      const selected = projects.find(p => p.id === value)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📝 作業記録追加</h1>
        </div>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ワーカー */}
          <div>
            <label style={labelStyle}>ワーカー <span style={{ color: 'red' }}>*</span></label>
            <select
              name="worker_id"
              value={form.worker_id}
              onChange={e => handleWorkerChange(e.target.value)}
              style={inputStyle}
            >
              <option value="">選択してください</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {/* 作業予定から選ぶ or 手入力切り替え */}
          {form.worker_id && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => { setUseSchedule('select'); setSelectedScheduleId(''); setForm(f => ({ ...f, project_id: '' })); setUnitPrice(0) }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid', borderColor: useSchedule === 'select' ? '#2563eb' : '#d1d5db', background: useSchedule === 'select' ? '#eff6ff' : 'white', color: useSchedule === 'select' ? '#2563eb' : '#6b7280', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  📅 作業予定から選ぶ
                </button>
                <button
                  onClick={() => { setUseSchedule('manual'); setSelectedScheduleId('') }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '2px solid', borderColor: useSchedule === 'manual' ? '#6b7280' : '#d1d5db', background: useSchedule === 'manual' ? '#f3f4f6' : 'white', color: useSchedule === 'manual' ? '#374151' : '#6b7280', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  ✏️ 手入力
                </button>
              </div>

              {/* 作業予定選択 */}
              {useSchedule === 'select' && (
                <div>
                  {schedulesLoading ? (
                    <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '12px' }}>予定を読み込み中...</p>
                  ) : schedules.length === 0 ? (
                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px' }}>今日以降の作業予定がありません</p>
                      <button onClick={() => setUseSchedule('manual')}
                        style={{ fontSize: '13px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        手入力に切り替える
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {schedules.map(s => (
                        <div
                          key={s.id}
                          onClick={() => handleScheduleSelect(selectedScheduleId === s.id ? '' : s.id)}
                          style={{
                            padding: '12px 14px', borderRadius: '8px', border: '2px solid',
                            borderColor: selectedScheduleId === s.id ? '#2563eb' : '#e5e7eb',
                            background: selectedScheduleId === s.id ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827', marginBottom: '3px' }}>
                            {s.projects?.name ?? '案件不明'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {s.start_date && <span>📅 {s.start_date}</span>}
                            {s.delivery_date && <span>🚚 納入：{s.delivery_date}</span>}
                            {s.quantity != null && <span>数量：{s.quantity}</span>}
                            {s.unit_price != null && <span>単価：¥{Number(s.unit_price).toLocaleString()}</span>}
                          </div>
                          {selectedScheduleId === s.id && (
                            <div style={{ marginTop: '6px', fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>✅ 選択中</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 手入力：案件2段階選択 */}
              {useSchedule === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>案件 <span style={{ color: 'red' }}>*</span></label>
                    <select value={selectedCategoryId} onChange={handleCategoryChange} style={{ ...inputStyle, marginBottom: '6px' }}>
                      <option value="">すべての大項目</option>
                      {categories.map(c => <option key={c.id} value={c.id}>📁 {c.name}</option>)}
                      <option value="none">📁 未分類</option>
                    </select>
                    <select name="project_id" value={form.project_id} onChange={handleChange} style={inputStyle}>
                      <option value="">案件を選択してください</option>
                      {filteredProjects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}（¥{p.unit_price}/{p.unit ?? '個'}）</option>
                      ))}
                    </select>
                    {filteredProjects.length === 0 && selectedCategoryId && (
                      <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '4px 0 0' }}>この大項目に案件がありません</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 作業日 */}
          <div>
            <label style={labelStyle}>作業日 <span style={{ color: 'red' }}>*</span></label>
            <input type="date" name="work_date" value={form.work_date} onChange={handleChange} style={inputStyle} />
          </div>

          {/* 個数 */}
          <div>
            <label style={labelStyle}>個数 <span style={{ color: 'red' }}>*</span></label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="0" style={inputStyle} />
          </div>

          {/* 金額プレビュー */}
          {form.project_id && form.quantity && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}>報酬（自動計算）</p>
              <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>¥{amount.toLocaleString()}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>¥{unitPrice.toLocaleString()} × {Number(form.quantity).toLocaleString()}{unit}</p>
            </div>
          )}

          {/* メモ */}
          <div>
            <label style={labelStyle}>メモ</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 1, padding: '0.7rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
              {loading ? '登録中...' : '記録する'}
            </button>
            <button onClick={() => router.push('/records')}
              style={{ flex: 1, padding: '0.7rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}