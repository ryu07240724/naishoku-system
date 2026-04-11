'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Payment = {
  id: string
  payment_date: string
  amount: number
  note: string | null
  workers: { name: string } | null
}

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data, error } = await supabase
        .from('payments')
        .select('*, workers(name)')
        .order('payment_date', { ascending: false })
      if (!error && data) setPayments(data as Payment[])
      setLoading(false)
    }
    checkAndFetch()
  }, [router])

  const filtered = payments.filter((p) => {
    const matchSearch = (p.workers?.name ?? '').includes(search)
    const matchFrom = dateFrom ? p.payment_date >= dateFrom : true
    const matchTo = dateTo ? p.payment_date <= dateTo : true
    return matchSearch && matchFrom && matchTo
  })

  const totalAmount = filtered.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>💰 支払い一覧</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => router.push('/payments/new')}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ＋ 支払い登録
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ダッシュボードへ
          </button>
        </div>
      </div>

      {/* 検索・絞り込み */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="ワーカー名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', minWidth: '200px' }}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
        <span style={{ color: '#6b7280' }}>〜</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        />
        {(search || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo('') }}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
          >
            リセット
          </button>
        )}
      </div>

      <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#854d0e' }}>支払い総額（絞り込み後）</p>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#854d0e' }}>¥{totalAmount.toLocaleString()}</p>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#6b7280' }}>該当する支払い記録がありません。</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>支払日</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>ワーカー</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>金額</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>メモ</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem' }}>{p.payment_date}</td>
                <td style={{ padding: '0.75rem' }}>{p.workers?.name ?? '—'}</td>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>¥{p.amount.toLocaleString()}</td>
                <td style={{ padding: '0.75rem' }}>{p.note ?? '—'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => router.push(`/payments/${p.id}`)}
                    style={{ padding: '0.3rem 0.8rem', backgroundColor: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}