'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Worker = {
  id: string
  name: string
  phone: string | null
  email: string | null
  status: string
  created_at: string
}

export default function WorkersPage() {
  const router = useRouter()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setWorkers(data)
      setLoading(false)
    }
    checkAndFetch()
  }, [router])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>👷 ワーカー一覧</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => router.push('/workers/new')}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ＋ 新規登録
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ダッシュボードへ
          </button>
        </div>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : workers.length === 0 ? (
        <p style={{ color: '#6b7280' }}>ワーカーがまだ登録されていません。</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>名前</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>電話番号</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>メール</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>状態</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem' }}>{w.name}</td>
                <td style={{ padding: '0.75rem' }}>{w.phone ?? '—'}</td>
                <td style={{ padding: '0.75rem' }}>{w.email ?? '—'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    backgroundColor: w.status === 'active' ? '#d1fae5' : '#f3f4f6',
                    color: w.status === 'active' ? '#065f46' : '#6b7280'
                  }}>
                    {w.status === 'active' ? '稼働中' : '停止中'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => router.push(`/workers/${w.id}`)}
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