'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  note: string | null
  status: string
  created_at: string
  custom_label_1: string | null
  custom_value_1: string | null
  custom_label_2: string | null
  custom_value_2: string | null
  custom_label_3: string | null
  custom_value_3: string | null
}

const ALL_COLUMNS = [
  { key: 'phone', label: '電話番号' },
  { key: 'email', label: 'メール' },
  { key: 'address', label: '住所' },
  { key: 'bank_name', label: '銀行名' },
  { key: 'bank_branch', label: '支店名' },
  { key: 'bank_account_number', label: '口座番号' },
  { key: 'bank_account_holder', label: '口座名義' },
  { key: 'note', label: 'メモ' },
  { key: 'custom_1', label: '未分類項目1' },
  { key: 'custom_2', label: '未分類項目2' },
  { key: 'custom_3', label: '未分類項目3' },
]

const STORAGE_KEY = 'workers_visible_columns'
const DEFAULT_VISIBLE = ['phone', 'email']

function loadVisible(): string[] {
  if (typeof window === 'undefined') return DEFAULT_VISIBLE
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_VISIBLE
  } catch {
    return DEFAULT_VISIBLE
  }
}

function saveVisible(cols: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cols)) } catch {}
}

export default function WorkersPage() {
  const router = useRouter()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isMobile, setIsMobile] = useState(false)
  const [visibleCols, setVisibleCols] = useState<string[]>(DEFAULT_VISIBLE)
  const [showColMenu, setShowColMenu] = useState(false)

  useEffect(() => {
    setVisibleCols(loadVisible())
    const checkWidth = () => setIsMobile(window.innerWidth < 768)
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setWorkers(data)
      setLoading(false)
    }
    checkAndFetch()
  }, [router])

  const toggleCol = (key: string) => {
    const next = visibleCols.includes(key)
      ? visibleCols.filter((c) => c !== key)
      : [...visibleCols, key]
    setVisibleCols(next)
    saveVisible(next)
  }

  const getCustomLabel = (worker: Worker, n: 1 | 2 | 3) => {
    return worker[`custom_label_${n}`] || `未分類項目${n}`
  }
  const getCustomValue = (worker: Worker, n: 1 | 2 | 3) => {
    return worker[`custom_value_${n}`] ?? '—'
  }

  const getCellValue = (worker: Worker, key: string): string => {
    if (key === 'custom_1') return getCustomValue(worker, 1)
    if (key === 'custom_2') return getCustomValue(worker, 2)
    if (key === 'custom_3') return getCustomValue(worker, 3)
    return (worker[key as keyof Worker] as string | null) ?? '—'
  }

  const getColLabel = (worker: Worker | null, key: string): string => {
    if (!worker) {
      const col = ALL_COLUMNS.find((c) => c.key === key)
      return col?.label ?? key
    }
    if (key === 'custom_1') return getCustomLabel(worker, 1)
    if (key === 'custom_2') return getCustomLabel(worker, 2)
    if (key === 'custom_3') return getCustomLabel(worker, 3)
    return ALL_COLUMNS.find((c) => c.key === key)?.label ?? key
  }

  const activeColumns = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key))

  const filtered = workers.filter((w) => {
    const matchName = w.name.includes(search)
    const matchStatus = statusFilter === 'all' || w.status === statusFilter
    return matchName && matchStatus
  })

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: isMobile ? '100%' : '1200px', margin: '0 auto', padding: isMobile ? '1.25rem' : '2rem' }}>

        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 'bold' }}>👷 ワーカー一覧</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/workers/new')} style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              ＋ 新規登録
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '0.5rem 1.25rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              ダッシュボードへ
            </button>
          </div>
        </div>

        {/* 検索・絞り込み・列設定 */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="名前で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827', minWidth: isMobile ? '100%' : '200px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
          >
            <option value="all">すべての状態</option>
            <option value="active">稼働中</option>
            <option value="inactive">停止中</option>
          </select>
          {(search || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setStatusFilter('all') }} style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
              リセット
            </button>
          )}

          {/* 列表示設定ボタン */}
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button
              onClick={() => setShowColMenu((v) => !v)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ⚙️ 列の表示設定
            </button>
            {showColMenu && (
              <div style={{ position: 'absolute', right: 0, top: '2.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', zIndex: 100, minWidth: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>表示する列を選択</p>
                {ALL_COLUMNS.map((col) => (
                  <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={visibleCols.includes(col.key)}
                      onChange={() => toggleCol(col.key)}
                    />
                    {col.label}
                  </label>
                ))}
                <button onClick={() => setShowColMenu(false)} style={{ marginTop: '0.75rem', width: '100%', padding: '0.4rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p>読み込み中...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#6b7280' }}>該当するワーカーがいません。</p>
        ) : isMobile ? (
          // スマホ：カード表示
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((w) => (
              <div key={w.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{w.name}</span>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', backgroundColor: w.status === 'active' ? '#d1fae5' : '#f3f4f6', color: w.status === 'active' ? '#065f46' : '#6b7280' }}>
                    {w.status === 'active' ? '稼働中' : '停止中'}
                  </span>
                </div>
                {activeColumns.map((col) => (
                  <p key={col.key} style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                    <span style={{ fontWeight: 'bold' }}>{getColLabel(w, col.key)}：</span>{getCellValue(w, col.key)}
                  </p>
                ))}
                <button onClick={() => router.push(`/workers/${w.id}`)} style={{ marginTop: '0.75rem', width: '100%', padding: '0.4rem', backgroundColor: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  詳細
                </button>
              </div>
            ))}
          </div>
        ) : (
          // PC：テーブル表示
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>名前</th>
                {activeColumns.map((col) => (
                  <th key={col.key} style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{col.label}</th>
                ))}
                <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>状態</th>
                <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>{w.name}</td>
                  {activeColumns.map((col) => (
                    <td key={col.key} style={{ padding: '0.75rem' }}>{getCellValue(w, col.key)}</td>
                  ))}
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', backgroundColor: w.status === 'active' ? '#d1fae5' : '#f3f4f6', color: w.status === 'active' ? '#065f46' : '#6b7280' }}>
                      {w.status === 'active' ? '稼働中' : '停止中'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => router.push(`/workers/${w.id}`)} style={{ padding: '0.3rem 0.8rem', backgroundColor: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}