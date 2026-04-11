'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Worker = { id: string; name: string }

export default function NewPaymentPage() {
  const router = useRouter()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [form, setForm] = useState({
    worker_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    note: '',
  })
  const [unpaid, setUnpaid] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWorkers = async () => {
      const { data } = await supabase
        .from('workers')
        .select('id, name')
        .eq('status', 'active')
      if (data) setWorkers(data)
    }
    fetchWorkers()
  }, [])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    if (name === 'worker_id' && value) {
      // 作業記録の合計 - 支払い済み合計 = 未払い額を計算
      const [{ data: records }, { data: payments }] = await Promise.all([
        supabase.from('work_records').select('amount').eq('worker_id', value),
        supabase.from('payments').select('amount').eq('worker_id', value),
      ])
      const totalWork = records?.reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0
      const totalPaid = payments?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0
      setUnpaid(totalWork - totalPaid)
    }
  }

  const handleSubmit = async () => {
    if (!form.worker_id || !form.amount || !form.payment_date) {
      setError('ワーカー・金額・支払日は必須です')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('payments').insert([{
      worker_id: form.worker_id,
      amount: Number(form.amount),
      payment_date: form.payment_date,
      note: form.note,
    }])
    if (error) {
      setError('登録に失敗しました: ' + error.message)
      setLoading(false)
      return
    }
    router.push('/payments')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>💰 支払い登録</h1>

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

      {unpaid !== null && (
        <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#854d0e' }}>未払い残高</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#854d0e' }}>¥{unpaid.toLocaleString()}</p>
          <button
            onClick={() => setForm({ ...form, amount: String(unpaid) })}
            style={{ marginTop: '0.5rem', padding: '0.3rem 0.8rem', backgroundColor: '#854d0e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            この金額を入力する
          </button>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>金額*</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>¥</span>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>支払日*</label>
        <input
          type="date"
          name="payment_date"
          value={form.payment_date}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
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

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          {loading ? '登録中...' : '登録する'}
        </button>
        <button
          onClick={() => router.push('/payments')}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}