'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [workerCount, setWorkerCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [monthlyAmount, setMonthlyAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const now = new Date()
      const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split('T')[0]

      const [
        { count: wCount },
        { count: pCount },
        { data: records },
      ] = await Promise.all([
        supabase.from('workers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('work_records').select('amount').gte('work_date', firstDay).lte('work_date', lastDay),
      ])

      setWorkerCount(wCount ?? 0)
      setProjectCount(pCount ?? 0)
      setMonthlyAmount(records?.reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0)
      setLoading(false)
    }
    checkAndFetch()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>内職管理システム</h1>
          <button
            onClick={handleLogout}
            style={{ fontSize: '0.875rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ログアウト
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '1.5rem' }}>ダッシュボード</h2>

        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>稼働中ワーカー数</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', margin: '0.5rem 0 0' }}>{workerCount}人</p>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>進行中の案件</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', margin: '0.5rem 0 0' }}>{projectCount}件</p>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>今月の支払い総額</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9333ea', margin: '0.5rem 0 0' }}>¥{monthlyAmount.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: '👷 ワーカー管理', path: '/workers', color: '#2563eb' },
            { label: '📋 案件管理', path: '/projects', color: '#16a34a' },
            { label: '📝 作業記録', path: '/records', color: '#9333ea' },
            { label: '💰 支払い管理', path: '/payments', color: '#d97706' },
            { label: '📊 月別レポート', path: '/reports', color: '#0891b2' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                padding: '1rem',
                backgroundColor: 'white',
                border: `2px solid ${item.color}`,
                borderRadius: '10px',
                color: item.color,
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}