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
  category_id: string | null
}

type Category = { id: string; name: string; sort_order: number }

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
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      await loadAll()
      setLoading(false)
    }
    checkAndFetch()
  }, [router])

  const loadAll = async () => {
    const [{ data: pData }, { data: cData }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('project_categories').select('*').order('sort_order').order('created_at'),
    ])
    if (pData) setProjects(pData)
    if (cData) setCategories(cData)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', id)
    if (!error) setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p))
    setUpdatingId(null)
  }

  const filtered = projects.filter((p) => {
    const matchName = p.name.includes(search) || (p.client_name ?? '').includes(search)
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchCategory = categoryFilter === 'all'
      || (categoryFilter === 'none' && !p.category_id)
      || p.category_id === categoryFilter
    return matchName && matchStatus && matchCategory
  })

  const grouped: { categoryName: string; categoryId: string | null; items: Project[] }[] = []
  if (categoryFilter !== 'all') {
    grouped.push({ categoryName: '', categoryId: null, items: filtered })
  } else {
    categories.forEach(cat => {
      const items = filtered.filter(p => p.category_id === cat.id)
      if (items.length > 0) grouped.push({ categoryName: cat.name, categoryId: cat.id, items })
    })
    const uncategorized = filtered.filter(p => !p.category_id)
    if (uncategorized.length > 0) grouped.push({ categoryName: '未分類', categoryId: null, items: uncategorized })
  }

  const isFiltering = search || statusFilter !== 'all' || categoryFilter !== 'all'

  return (
    <div style={{ padding: '1.5rem 1rem', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', color: '#111827' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📋 案件一覧</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/projects/new')}
              style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              ＋ 新規登録
            </button>
            <button onClick={() => router.push('/dashboard')}
              style={{ padding: '0.5rem 1.25rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
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
            style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', background: 'white', minWidth: '180px' }}
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', background: 'white' }}>
            <option value="all">すべての大項目</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="none">未分類</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', color: '#111827', background: 'white' }}>
            <option value="all">すべての状態</option>
            <option value="active">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
          {isFiltering && (
            <button onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all') }}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
              リセット
            </button>
          )}
        </div>

        {loading ? (
          <p>読み込み中...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#6b7280' }}>該当する案件がありません。</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {grouped.map((group, gi) => (
              <div key={gi}>
                {categoryFilter === 'all' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#374151' }}>
                      📁 {group.categoryName}
                    </span>
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>（{group.items.length}件）</span>
                  </div>
                )}
                <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>案件名</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>製品名</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>単価</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>依頼元</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>状態</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{p.name}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{p.product_name ?? '—'}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>¥{p.unit_price.toLocaleString()} / {p.unit ?? '個'}</td>
                          <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{p.client_name ?? '—'}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={p.status}
                              disabled={updatingId === p.id}
                              onChange={(e) => handleStatusChange(p.id, e.target.value)}
                              style={{
                                padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid',
                                fontSize: '0.85rem', cursor: 'pointer',
                                backgroundColor: statusColor[p.status]?.bg ?? '#f3f4f6',
                                color: statusColor[p.status]?.color ?? '#6b7280',
                                borderColor: statusColor[p.status]?.color ?? '#d1d5db',
                                fontWeight: 'bold', opacity: updatingId === p.id ? 0.5 : 1,
                              }}
                            >
                              <option value="active">進行中</option>
                              <option value="completed">完了</option>
                              <option value="cancelled">キャンセル</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <button onClick={() => router.push(`/projects/${p.id}`)}
                              style={{ padding: '0.3rem 0.8rem', backgroundColor: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                              詳細
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}