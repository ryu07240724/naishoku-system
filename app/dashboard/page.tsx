'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">内職管理システム</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ログアウト
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">ダッシュボード</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">ワーカー数</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">0人</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">進行中の案件</p>
            <p className="text-3xl font-bold text-green-600 mt-2">0件</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">今月の支払い総額</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">¥0</p>
          </div>
        </div>
      </main>
    </div>
  )
}