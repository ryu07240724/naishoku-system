'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Record = {
  id: string
  work_date: string
  quantity: number
  unit_price: number
  amount: number
  note: string | null
  workers: { name: string } | null
  projects: { name: string; unit: string | null } | null
}

export default function RecordDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [record, setRecord] = useState<Record | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('work_records')
        .select('*, workers(name), projects(name, unit)')
        .eq('id', id)
        .single()
      if (!error && data) setRecord(data as Record)
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('この記録を削除しますか？')) return
    await supabase.from('work_records').delete().eq('id', record!.id)
    router.push('/records')
  }

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>
  if (!record) return <p style={{ padding: '2rem' }}>記録が見つかりません</p>

  const rows = [
    { label: '作業日', value: record.work_date },
    { label: 'ワーカー', value: record.workers?.name },
    { label: '案件', value: record.projects?.name },
    { label: '個数', value: `${record.quantity.toLocaleString()} ${record.projects?.unit ?? '個'}` },
    { label: '単価', value: `¥${record.unit_price.toLocaleString()}` },
    { label: 'メモ', value: record.note },
  ]

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📝 作業記録詳細</h1>

      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}>報酬</p>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>¥{record.amount.toLocaleString()}</p>
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
          onClick={() => router.push('/records')}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          一覧に戻る
        </button>
      </div>
    </div>
  )
}