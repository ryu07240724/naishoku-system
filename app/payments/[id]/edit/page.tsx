'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Worker = { id: string; name: string }
type Project = { id: string; name: string }

export default function EditPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [workers, setWorkers] = useState<Worker[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    worker_id: '',
    project_id: '',
    amount: '',
    payment_date: '',
    note: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [paymentRes, workersRes, projectsRes] = await Promise.all([
        supabase.from('payments').select('*').eq('id', id).single(),
        supabase.from('workers').select('id, name').eq('status', 'active').order('name'),
        supabase.from('projects').select('id, name').order('name'),
      ])

      if (paymentRes.error || !paymentRes.data) {
        setError('支払いデータが見つかりません')
        setLoading(false)
        return
      }

      const p = paymentRes.data
      setForm({
        worker_id: p.worker_id || '',
        project_id: p.project_id || '',
        amount: p.amount?.toString() || '',
        payment_date: p.payment_date || '',
        note: p.note || '',
      })

      setWorkers(workersRes.data || [])
      setProjects(projectsRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [id, router])

  const handleSubmit = async () => {
    if (!form.worker_id || !form.amount || !form.payment_date) {
      setError('ワーカー・金額・支払日は必須です')
      return
    }
    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        worker_id: form.worker_id,
        project_id: form.project_id || null,
        amount: Number(form.amount),
        payment_date: form.payment_date,
        note: form.note || null,
      })
      .eq('id', id)

    if (updateError) {
      setError('更新に失敗しました: ' + updateError.message)
      setSaving(false)
      return
    }

    router.push(`/payments/${id}`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>読み込み中...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => router.push(`/payments/${id}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}
          >←</button>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', margin: 0 }}>支払い編集</h1>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {/* ワーカー */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
              ワーカー <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={form.worker_id}
              onChange={e => setForm({ ...form, worker_id: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, color: '#111827', background: 'white', boxSizing: 'border-box' }}
            >
              <option value="">選択してください</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* 案件 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
              案件（任意）
            </label>
            <select
              value={form.project_id}
              onChange={e => setForm({ ...form, project_id: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, color: '#111827', background: 'white', boxSizing: 'border-box' }}
            >
              <option value="">指定なし</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* 金額 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
              金額（円） <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="例：30000"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, color: '#111827', boxSizing: 'border-box' }}
            />
          </div>

          {/* 支払日 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
              支払日 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              value={form.payment_date}
              onChange={e => setForm({ ...form, payment_date: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, color: '#111827', boxSizing: 'border-box' }}
            />
          </div>

          {/* メモ */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
              メモ（任意）
            </label>
            <textarea
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              placeholder="備考など"
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, color: '#111827', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* ボタン */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => router.push(`/payments/${id}`)}
              style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: 8, background: 'white', color: '#374151', fontSize: 15, fontWeight: '600', cursor: 'pointer' }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#2563eb', color: 'white', fontSize: 15, fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}