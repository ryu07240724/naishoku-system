'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  end_date: string | null
  note: string | null
  repeat_group_id: string | null
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

export default function ProjectDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedCount, setRelatedCount] = useState(0)

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) {
        setProject(data)
        // 繰り返しグループの関連件数を取得
        if (data.repeat_group_id) {
          const { count } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('repeat_group_id', data.repeat_group_id)
          setRelatedCount(count ?? 0)
        }
      }
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', project.id)
    if (!error) setProject({ ...project, status: newStatus })
  }

  const handleDelete = async () => {
    if (!project) return

    // 繰り返しグループがある場合は選択肢を出す
    if (project.repeat_group_id && relatedCount > 1) {
      const choice = window.confirm(
        `この案件は繰り返し登録グループの一部です（グループ内 ${relatedCount} 件）。\n\nOK → グループ内の案件をすべて削除\nキャンセル → この1件だけ削除`
      )
      if (choice) {
        // グループごと削除
        await supabase.from('projects').delete().eq('repeat_group_id', project.repeat_group_id)
      } else {
        // 1件だけ削除
        await supabase.from('projects').delete().eq('id', project.id)
      }
    } else {
      if (!confirm('この案件を削除しますか？')) return
      await supabase.from('projects').delete().eq('id', project.id)
    }
    router.push('/projects')
  }

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>
  if (!project) return <p style={{ padding: '2rem' }}>案件が見つかりません</p>

  const rows = [
    { label: '製品名', value: project.product_name },
    { label: '単価', value: `¥${project.unit_price.toLocaleString()} / ${project.unit ?? '個'}` },
    { label: '依頼元', value: project.client_name },
    { label: '開始日', value: project.start_date },
    { label: '終了予定日', value: project.end_date },
    { label: 'メモ', value: project.note },
  ]

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 {project.name}</h1>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{
          padding: '0.2rem 0.8rem',
          borderRadius: '999px',
          fontSize: '0.85rem',
          backgroundColor: statusColor[project.status]?.bg ?? '#f3f4f6',
          color: statusColor[project.status]?.color ?? '#6b7280',
        }}>
          {statusLabel[project.status] ?? project.status}
        </span>
        {project.repeat_group_id && relatedCount > 1 && (
          <span style={{ padding: '0.2rem 0.8rem', borderRadius: '999px', fontSize: '0.85rem', backgroundColor: '#ede9fe', color: '#5b21b6' }}>
            🔁 繰り返しグループ（{relatedCount}件）
          </span>
        )}
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

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>ステータス変更：</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['active', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                border: '2px solid',
                cursor: 'pointer',
                backgroundColor: project.status === s ? statusColor[s].bg : 'white',
                color: statusColor[s].color,
                borderColor: statusColor[s].color,
                fontWeight: project.status === s ? 'bold' : 'normal',
              }}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push(`/projects/${project.id}/edit`)}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          編集
        </button>
        <button
          onClick={handleDelete}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          削除
        </button>
        <button
          onClick={() => router.push('/projects')}
          style={{ padding: '0.6rem 1.25rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          一覧に戻る
        </button>
      </div>
    </div>
    </div>
  )
}