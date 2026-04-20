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

  // 大項目管理
  const [showCatManager, setShowCatManager] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [catSaving, setCatSaving] = useState(false)

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

  const loadCategories = async () => {
    const { data } = await supabase.from('project_categories').select('*').order('sort_order').order('created_at')
    setCategories(data || [])
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', id)
    if (!error) setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p))
    setUpdatingId(null)
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    setCatSaving(true)
    await supabase.from('project_categories').insert({ name, sort_order: categories.length })
    setNewCategoryName('')
    await loadCategories()
    setCatSaving(false)
  }

  const handleUpdateCategory = async (id: string) => {
    const name = editingName.trim()
    if (!name) return
    await supabase.from('project_categories').update({ name }).eq('id', id)
    setEditingId(null)
    setEditingName('')
    await loadCategories()
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('この大項目を削除しますか？\n※関連する案件の大項目は「未分類」になります。')) return
    await supabase.from('project_categories').delete().eq('id', id)
    await loadCategories()
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

  const inputStyle = {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#111827',
    background: 'white',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: '1.5rem 1rem', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', color: '#111827' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📋 案件一覧</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowCatManager(v => !v)}
              style={{ padding: '0.5rem 1.25rem', backgroundColor: showCatManager ? '#7c3aed' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              📁 大項目管理
            </button>
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

        {/* 大項目管理パネル */}
        {showCatManager && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem', border: '2px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827', margin: 0, borderLeft: '4px solid #8b5cf6', paddingLeft: '8px' }}>
                📁 案件の大項目管理
              </h2>
              <button onClick={() => setShowCatManager(false)}
                style={{ padding: '4px 10px', background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                閉じる
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px' }}>案件を選ぶときのグループ分けに使います。</p>

            {/* 新規追加 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddCategory() }}
                placeholder="大項目名を入力（例：A社、縫製、検品）"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={handleAddCategory} disabled={catSaving || !newCategoryName.trim()}
                style={{ padding: '8px 14px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                ＋追加
              </button>
            </div>

            {/* 一覧 */}
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '14px' }}>
                大項目がまだありません
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    {editingId === cat.id ? (
                      <>
                        <input
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleUpdateCategory(cat.id) }}
                          style={{ ...inputStyle, flex: 1 }}
                          autoFocus
                        />
                        <button onClick={() => handleUpdateCategory(cat.id)}
                          style={{ padding: '5px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          保存
                        </button>
                        <button onClick={() => { setEditingId(null); setEditingName('') }}
                          style={{ padding: '5px 10px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: '14px', color: '#111827', fontWeight: '500' }}>📁 {cat.name}</span>
                        <button onClick={() => { setEditingId(cat.id); setEditingName(cat.name) }}
                          style={{ padding: '5px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          編集
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)}
                          style={{ padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          削除
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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