'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function EditWorkerPage() {
  const router = useRouter()
  const { id } = useParams()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    bank_name: '',
    bank_branch: '',
    bank_account_number: '',
    bank_account_holder: '',
    note: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWorker = async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) { setLoading(false); return }
      setForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        bank_name: data.bank_name ?? '',
        bank_branch: data.bank_branch ?? '',
        bank_account_number: data.bank_account_number ?? '',
        bank_account_holder: data.bank_account_holder ?? '',
        note: data.note ?? '',
      })
      setLoading(false)
    }
    fetchWorker()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name) {
      setError('名前は必須です')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('workers').update(form).eq('id', id)
    if (error) {
      setError('更新に失敗しました: ' + error.message)
      setSaving(false)
      return
    }
    router.push(`/workers/${id}`)
  }

  const fields = [
    { label: '名前*', name: 'name', type: 'input' },
    { label: '電話番号', name: 'phone', type: 'input' },
    { label: 'メールアドレス', name: 'email', type: 'input' },
    { label: '住所', name: 'address', type: 'input' },
    { label: '銀行名', name: 'bank_name', type: 'input' },
    { label: '支店名', name: 'bank_branch', type: 'input' },
    { label: '口座番号', name: 'bank_account_number', type: 'input' },
    { label: '口座名義', name: 'bank_account_holder', type: 'input' },
    { label: 'メモ', name: 'note', type: 'textarea' },
  ]

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中...</p>

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>👷 ワーカー編集</h1>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {fields.map((f) => (
        <div key={f.name} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {f.label}
          </label>
          {f.type === 'textarea' ? (
            <textarea
              name={f.name}
              value={form[f.name as keyof typeof form]}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
            />
          ) : (
            <input
              type="text"
              name={f.name}
              value={form[f.name as keyof typeof form]}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
            />
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          {saving ? '保存中...' : '保存する'}
        </button>
        <button
          onClick={() => router.push(`/workers/${id}`)}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          キャンセル
        </button>
      </div>
    </div>
    </div>
  )
}