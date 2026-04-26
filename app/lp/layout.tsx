import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tanomi｜外注管理をクラウドで一元化',
  description: 'ワーカーの記録・集計・支払いをスマホ1台で管理。Excelや紙の外注管理から卒業できる、中小企業向けクラウドシステムです。まずは無料相談から。',
  openGraph: {
    title: 'Tanomi｜外注管理をクラウドで一元化',
    description: 'ワーカーの記録・集計・支払いをスマホ1台で管理。まずは無料相談から。',
    url: 'https://naishoku-system.vercel.app/lp',
  },
}

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}