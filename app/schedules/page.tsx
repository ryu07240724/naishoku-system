'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type DeleteTarget = {
  id: string
  repeat_group_id: string | null
  start_date: string | null
}

export default function SchedulesPage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [filterWorker, setFilterWorker] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [loading, setLoading] = useState(true)

  // 削除モーダル
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = useState(false)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  useEffect(() => {
    const fetchWorkers = async () => {
      const { data } = await supabase.from('workers').select('id, name').eq('status', 'active').order('name')
      if (data) setWorkers(data)
    }
    fetchWorkers()
  }, [])

  useEffect(() => {
    fetchSchedules()
  }, [filterWorker, filterFrom, filterTo])

  const fetchSchedules = async () => {
    setLoading(true)
    let query = supabase
      .from('schedules')
      .select('*, workers(name), projects(name)')
      .order('delivery_date', { ascending: true })

    if (filterWorker) query = query.eq('worker_id', filterWorker)
    const from = filterFrom || todayStr
    if (from) query = query.or(`start_date.gte.${from},delivery_date.gte.${from}`)
    if (filterTo) query = query.or(`start_date.lte.${filterTo},delivery_date.lte.${filterTo}`)

    const { data } = await query
    setSchedules(data || [])
    setLoading(false)
  }

  // 削除ボタン押下：グループあり→モーダル、なし→そのまま削除
  const handleDeleteClick = (s: any) => {
    if (s.repeat_group_id) {
      setDeleteTarget({ id: s.id, repeat_group_id: s.repeat_group_id, start_date: s.start_date })
    } else {
      if (!confirm('この予定を削除しますか？')) return
      execDelete('single', { id: s.id, repeat_group_id: null, start_date: s.start_date })
    }
  }

  const execDelete = async (mode: 'single' | 'after' | 'all', target: DeleteTarget) => {
    setDeleting(true)
    if (mode === 'single') {
      await supabase.from('schedules').delete().eq('id', target.id)
    } else if (mode === 'after' && target.repeat_group_id && target.start_date) {
      // 同グループ＆この日付以降を削除
      await supabase.from('schedules')
        .delete()
        .eq('repeat_group_id', target.repeat_group_id)
        .gte('start_date', target.start_date)
    } else if (mode === 'all' && target.repeat_group_id) {
      // 同グループ全件削除
      await supabase.from('schedules')
        .delete()
        .eq('repeat_group_id', target.repeat_group_id)
    }
    setDeleting(false)
    setDeleteTarget(null)
    fetchSchedules()
  }

  const inputStyle = { padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', color: '#111827', background: 'white', fontSize: '14px' }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', color: '#111827' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>📅 作業予定一覧</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/schedules/print')} style={{ padding: '8px 14px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>🖨️ 印刷</button>
            <button onClick={() => router.push('/schedules/new')} style={{ padding: '8px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>＋ 新規登録</button>
          </div>
        </div>

        {/* 絞り込み */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>ワーカー</div>
            <select value={filterWorker} onChange={e => setFilterWorker(e.target.value)} style={inputStyle}>
              <option value="">全員</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>開始日 From</div>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>納入日 To</div>
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={() => { setFilterWorker(''); setFilterFrom(''); setFilterTo('') }}
            style={{ padding: '8px 14px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#111827' }}>
            リセット
          </button>
        </div>

        {/* 一覧 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>読み込み中...</div>
        ) : schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>予定がありません</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {schedules.map(s => (
              <div key={s.id} style={{ background: 'white', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderLeft: s.repeat_group_id ? '3px solid #8b5cf6' : '3px solid transparent' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                    {s.repeat_group_id && <span style={{ fontSize: '11px', background: '#ede9fe', color: '#7c3aed', borderRadius: '4px', padding: '1px 6px', marginRight: '6px', fontWeight: 700 }}>🔁 繰返</span>}
                    {s.workers?.name} ／ {s.projects?.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {s.start_date ? `開始：${s.start_date}` : '開始日未定'}
                    　{s.delivery_date ? `納入：${s.delivery_date}` : ''}
                  </div>
                  {(s.quantity || s.unit_price) && (
                    <div style={{ fontSize: '13px', color: '#374151', marginTop: '2px' }}>
                      {s.quantity && `数量：${s.quantity}`}{s.quantity && s.unit_price && '　'}{s.unit_price && `単価：¥${Number(s.unit_price).toLocaleString()}`}
                    </div>
                  )}
                  {s.note && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>備考：{s.note}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => router.push(`/schedules/${s.id}/edit`)}
                    style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#111827' }}>
                    編集
                  </button>
                  <button onClick={() => handleDeleteClick(s)}
                    style={{ padding: '6px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#dc2626' }}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 削除モーダル */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>🔁 繰り返し予定の削除</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>
              この予定は繰り返しグループに属しています。<br />どの範囲を削除しますか？
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => execDelete('single', deleteTarget)}
                disabled={deleting}
                style={{ padding: '12px', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#111827', textAlign: 'left' }}>
                <span style={{ fontWeight: 700 }}>この予定のみ削除</span><br />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{deleteTarget.start_date} の1件だけを削除します</span>
              </button>
              <button
                onClick={() => execDelete('after', deleteTarget)}
                disabled={deleting}
                style={{ padding: '12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#111827', textAlign: 'left' }}>
                <span style={{ fontWeight: 700 }}>この予定以降をまとめて削除</span><br />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{deleteTarget.start_date} 以降の同グループ予定を削除します</span>
              </button>
              <button
                onClick={() => execDelete('all', deleteTarget)}
                disabled={deleting}
                style={{ padding: '12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#dc2626', textAlign: 'left' }}>
                <span style={{ fontWeight: 700 }}>グループ全件削除</span><br />
                <span style={{ fontSize: '12px', color: '#dc2626' }}>このグループの予定をすべて削除します</span>
              </button>
            </div>
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}>
              キャンセル
            </button>
            {deleting && <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', margin: '12px 0 0' }}>削除中...</p>}
          </div>
        </div>
      )}
    </div>
  )
}