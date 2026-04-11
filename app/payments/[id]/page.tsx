'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Payment = {
  id: string
  payment_date: string
  amount: number
  note: string | null
  worker_id: string
}

export default function PaymentDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [workerName, setWorkerName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) { setLoading(false); return }
      setPayment(data)

      const { data: w } = await supabase
        .from('workers')
        .select('name')
        .eq('id', data.worker_id)
        .single()
      if (w) setWorkerName(w.name)
      setLoading(false)
    }
    fetchAll()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('この支払い記録を削除しますか？')) return
    await supabase.from('payments').delete().eq('id', id)
    router.push('/payments')
  }

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>
  if (!payment) return <p style={{ padding: '2rem' }}>支払い記録が見つかりません</p>

  const rows = [
    { label: 'ワーカー', value: workerName },
    { label: '支払日', value: payment.payment_date },
    { label: '金額', value: `¥${payment.amount.toLocaleString()}` },
    { label: 'メモ', value: payment.note },
  ]

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>💰 支払い詳細</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#6b7280', width: '40%' }}>{r.label}</td>
              <td style={{ padding: '0.75rem', color: '#111827' }}>{r.value ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleDelete}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          削除
        </button>
        <button
          onClick={() => router.push('/payments')}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          一覧に戻る
        </button>
      </div>
    </div>
    </div>
  )
}