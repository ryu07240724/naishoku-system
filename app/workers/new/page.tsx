'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function NewWorkerPage() {
  const router = useRouter()
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
    custom_label_1: '',
    custom_value_1: '',
    custom_label_2: '',
    custom_value_2: '',
    custom_label_3: '',
    custom_value_3: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name) {
      setError('名前は必須です')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('workers').insert([form])
    if (error) {
      setError('登録に失敗しました: ' + error.message)
      setLoading(false)
      return
    }
    router.push('/workers')
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

  const customFields = [1, 2, 3]

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111827' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>👷 ワーカー新規登録</h1>

      {error && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
      )}

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

      <div style={{ borderTop: '2px dashed #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '1rem', color: '#6b7280' }}>
          📋 未分類項目（項目名と内容を自由に入力できます）
        </p>
        {customFields.map((n) => (
          <div key={n} style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.85rem', color: '#374151' }}>
                項目名 {n}
              </label>
              <input
                type="text"
                name={`custom_label_${n}`}
                value={form[`custom_label_${n}` as keyof typeof form]}
                onChange={handleChange}
                placeholder={`例：スキル、担当エリア、備考${n} など`}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', color: '#111827' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.85rem', color: '#374151' }}>
                内容 {n}
              </label>
              <input
                type="text"
                name={`custom_value_${n}`}
                value={form[`custom_value_${n}` as keyof typeof form]}
                onChange={handleChange}
                placeholder="内容を入力"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', color: '#111827' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          {loading ? '登録中...' : '登録する'}
        </button>
        <button
          onClick={() => router.push('/workers')}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          キャンセル
        </button>
      </div>
    </div>
    </div>
  )
}