'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Project = {
  id: string
  name: string
  product_name: string | null
  unit_price: number
  unit: string | null
  client_name: string | null
  status: string
  start_date: string | null
}

const statusLabel: { [key: string]: string } = {
  active: '進行中',
  completed: '完了',
  cancelled: 'キャンセル',
}

const statusColor: { [key: string]: { bg: string; color: string } } = {
  active: { bg: '#dbeafe', color: '#1e40af' },
  completed: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setProjects(data)
      setLoading(false)
    }
    checkAndFetch()
  }, [router])

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', id)
    if (!error) {
      setProjects((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: newStatus } : p)
      )
    }
    setUpdatingId(null)
  }

  const filtered = projects.filter((p) => {
    const matchName = p.name.includes(search) || (p.client_name ?? '').includes(search)
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchName && matchStatus
  })

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: 'white', minHeight: '100vh', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📋 案件一覧</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => router.push('/schedules')}
            style={{ padding: '0.5rem 1.25rem', background: 'white', border: '2px solid #7c3aed', color: '#7c3aed', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            📅 作業予定
          </button>
          <button
            onClick={() => router.push('/projects/new')}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ＋ 新規登録
          </button>
          <button
            onClick={() => router.push('/projects/new')}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ダッシュボードへ
          </button>
        </div>
      </div>

      {/* 検索・絞り込み */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="案件名・依頼元で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', minWidth: '200px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
        >
          <option value="all">すべての状態</option>
          <option value="active">進行中</option>
          <option value="completed">完了</option>
          <option value="cancelled">キャンセル</option>
        </select>
        {(search || statusFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('all') }}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
          >
            リセット
          </button>
        )}
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#6b7280' }}>該当する案件がありません。</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>案件名</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>製品名</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>単価</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>依頼元</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>状態</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem' }}>{p.name}</td>
                <td style={{ padding: '0.75rem' }}>{p.product_name ?? '—'}</td>
                <td style={{ padding: '0.75rem' }}>¥{p.unit_price.toLocaleString()} / {p.unit ?? '個'}</td>
                <td style={{ padding: '0.75rem' }}>{p.client_name ?? '—'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <select
                    value={p.status}
                    disabled={updatingId === p.id}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      backgroundColor: statusColor[p.status]?.bg ?? '#f3f4f6',
                      color: statusColor[p.status]?.color ?? '#6b7280',
                      borderColor: statusColor[p.status]?.color ?? '#d1d5db',
                      fontWeight: 'bold',
                      opacity: updatingId === p.id ? 0.5 : 1,
                    }}
                  >
                    <option value="active">進行中</option>
                    <option value="completed">完了</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => router.push(`/projects/${p.id}`)}
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