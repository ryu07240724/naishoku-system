'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Payment = {
  id: string
  payment_date: string
  amount: number
  note: string | null
  workers: { name: string } | null
}

export default function PaymentDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, workers(name)')
        .eq('id', id)
        .single()
      if (!error && data) setPayment(data as Payment)
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('この支払い記録を削除しますか？')) return
    await supabase.from('payments').delete().eq('id', payment!.id)
    router.push('/payments')
  }

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>
  if (!payment) return <p style={{ padding: '2rem' }}>支払い記録が見つかりません</p>

  const rows = [
    { label: '支払日', value: payment.payment_date },
    { label: 'ワーカー', value: payment.workers?.name },
    { label: 'メモ', value: payment.note },
  ]

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>💰 支払い詳細</h1>

      <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#854d0e' }}>支払い金額</p>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#854d0e' }}>¥{payment.amount.toLocaleString()}</p>
      </div>

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

      <div style={{ display: 'flex', gap: '0.75rem' }}>
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
  )
}