'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Worker = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  bank_name: string | null
  bank_branch: string | null
  bank_account_number: string | null
  bank_account_holder: string | null
  status: string
  note: string | null
}

export default function WorkerDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) setWorker(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  const toggleStatus = async () => {
    if (!worker) return
    const newStatus = worker.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('workers')
      .update({ status: newStatus })
      .eq('id', worker.id)
    if (!error) setWorker({ ...worker, status: newStatus })
  }

  const handleDelete = async () => {
    if (!confirm('このワーカーを削除しますか？')) return
    await supabase.from('workers').delete().eq('id', worker!.id)
    router.push('/workers')
  }

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>
  if (!worker) return <p style={{ padding: '2rem' }}>ワーカーが見つかりません</p>

  const rows = [
    { label: '電話番号', value: worker.phone },
    { label: 'メールアドレス', value: worker.email },
    { label: '住所', value: worker.address },
    { label: '銀行名', value: worker.bank_name },
    { label: '支店名', value: worker.bank_branch },
    { label: '口座番号', value: worker.bank_account_number },
    { label: '口座名義', value: worker.bank_account_holder },
    { label: 'メモ', value: worker.note },
  ]

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>👷 {worker.name}</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{
          padding: '0.2rem 0.8rem',
          borderRadius: '999px',
          fontSize: '0.85rem',
          backgroundColor: worker.status === 'active' ? '#d1fae5' : '#f3f4f6',
          color: worker.status === 'active' ? '#065f46' : '#6b7280'
        }}>
          {worker.status === 'active' ? '稼働中' : '停止中'}
        </span>
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

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={toggleStatus}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {worker.status === 'active' ? '停止にする' : '稼働中にする'}
        </button>
        <button
          onClick={handleDelete}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          削除
        </button>
        <button
          onClick={() => router.push('/workers')}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          一覧に戻る
        </button>
      </div>
    </div>
  )
}