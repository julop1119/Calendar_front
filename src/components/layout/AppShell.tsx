import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TopBar />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
