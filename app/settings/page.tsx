'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

type Category = {
  id: string
  name: string
  sort_order: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // 大項目
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [catSaving, setCatSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('settings').select('*').eq('id', 'main').single()
      if (data) {
        setCompanyName(data.company_name || '')
        setOwnerName(data.owner_name || '')
        setAddress(data.address || '')
        setPhone(data.phone || '')
        setEmail(data.email || '')
      }
      await loadCategories()
      setLoading(false)
    }
    fetch()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase.from('project_categories').select('*').order('sort_order').order('created_at')
    setCategories(data || [])
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await supabase.from('settings').upsert({
      id: 'main',
      company_name: companyName,
      owner_name: ownerName,
      address: address,
      phone: phone,
      email: email,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    background: 'white',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <div style={{minHeight:'100vh', background:'#f9fafb', color:'#111827'}}>
      <div style={{maxWidth:'600px', margin:'0 auto', padding:'24px 16px'}}>

        {/* ヘッダー */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px'}}>
          <h1 style={{fontSize:'22px', fontWeight:'bold', color:'#111827', margin:0}}>⚙️ 設定</h1>
          <button onClick={() => router.push('/dashboard')}
            style={{padding:'8px 16px', background:'#6b7280', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer'}}>
            ダッシュボードへ
          </button>
        </div>

        {loading ? (
          <div style={{textAlign:'center', color:'#6b7280', marginTop:'60px'}}>読み込み中...</div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>

            {/* 発行者情報 */}
            <div style={{background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
              <h2 style={{fontSize:'16px', fontWeight:'bold', color:'#111827', margin:'0 0 8px', borderLeft:'4px solid #3b82f6', paddingLeft:'8px'}}>発行者情報</h2>
              <p style={{fontSize:'13px', color:'#6b7280', margin:'0 0 20px'}}>支払明細書などの帳票に表示される情報です。</p>
              <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                <div>
                  <label style={labelStyle}>会社名・屋号</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="例：中原内職センター" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>代表者名</label>
                  <input value={ownerName} onChange={e => setOwnerName(e.target.value)}
                    placeholder="例：中原 太郎" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>住所</label>
                  <input value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="例：岡山県岡山市〇〇町1-2-3" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>電話番号</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="例：086-000-0000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>メールアドレス</label>
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="例：info@example.com" style={inputStyle} />
                </div>
              </div>
              <div style={{marginTop:'24px', display:'flex', alignItems:'center', gap:'12px'}}>
                <button onClick={handleSave} disabled={saving}
                  style={{padding:'10px 28px', background:'#3b82f6', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer'}}>
                  {saving ? '保存中...' : '保存する'}
                </button>
                {saved && <span style={{color:'#10b981', fontSize:'14px', fontWeight:'600'}}>✅ 保存しました！</span>}
              </div>
            </div>

            {/* 案件大項目管理 */}
            <div style={{background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
              <h2 style={{fontSize:'16px', fontWeight:'bold', color:'#111827', margin:'0 0 8px', borderLeft:'4px solid #8b5cf6', paddingLeft:'8px'}}>案件の大項目管理</h2>
              <p style={{fontSize:'13px', color:'#6b7280', margin:'0 0 20px'}}>案件を選ぶときのグループ分けに使います。</p>

              {/* 新規追加 */}
              <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
                <input
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCategory() }}
                  placeholder="大項目名を入力（例：A社、縫製、検品）"
                  style={{...inputStyle, flex:1}}
                />
                <button onClick={handleAddCategory} disabled={catSaving || !newCategoryName.trim()}
                  style={{padding:'10px 16px', background:'#8b5cf6', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap'}}>
                  ＋追加
                </button>
              </div>

              {/* 一覧 */}
              {categories.length === 0 ? (
                <div style={{textAlign:'center', color:'#9ca3af', padding:'24px', fontSize:'14px'}}>
                  大項目がまだありません
                </div>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {categories.map(cat => (
                    <div key={cat.id} style={{display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', background:'#f9fafb', borderRadius:'8px', border:'1px solid #e5e7eb'}}>
                      {editingId === cat.id ? (
                        <>
                          <input
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleUpdateCategory(cat.id) }}
                            style={{...inputStyle, flex:1, margin:0}}
                            autoFocus
                          />
                          <button onClick={() => handleUpdateCategory(cat.id)}
                            style={{padding:'6px 12px', background:'#10b981', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer'}}>
                            保存
                          </button>
                          <button onClick={() => { setEditingId(null); setEditingName('') }}
                            style={{padding:'6px 12px', background:'#6b7280', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer'}}>
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{flex:1, fontSize:'14px', color:'#111827', fontWeight:'500'}}>📁 {cat.name}</span>
                          <button onClick={() => { setEditingId(cat.id); setEditingName(cat.name) }}
                            style={{padding:'6px 12px', background:'#3b82f6', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer'}}>
                            編集
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)}
                            style={{padding:'6px 12px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer'}}>
                            削除
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}