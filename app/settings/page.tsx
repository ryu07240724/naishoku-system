'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

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
      setLoading(false)
    }
    fetch()
  }, [])

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

          </div>
        )}
      </div>
    </div>
  )
}