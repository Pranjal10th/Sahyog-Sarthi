import { Link, NavLink } from 'react-router-dom'
import { APP_NAME, WHATSAPP_BOT_URL } from '../../lib/constants'
import { LayoutDashboard, Menu, MessageCircle, UserCog, Wrench } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { readSession } from '../../lib/store'

function TopNav() {
  const session = readSession()
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
    }`

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <img src="/logo-sahyog-sarthi.svg" alt="Sahyog Sarthi" className="h-8 w-8" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white">{APP_NAME}</div>
            <div className="text-xs text-slate-300">Your neighbourhood support companion</div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/book" className={navClass}>
            Book Service
          </NavLink>
          <NavLink to="/track" className={navClass}>
            Track
          </NavLink>
          <NavLink to="/worker" className={navClass}>
            Worker
          </NavLink>
          <NavLink to="/admin" className={navClass}>
            Admin
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <details className="relative">
            <summary className="btn-ghost list-none cursor-pointer">
              <Menu className="h-4 w-4" />
              Menu
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
              <Link className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10" to="/admin">
                Admin Login
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10" to="/worker">
                Worker Login
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10" to="/track">
                Track Order
              </Link>
              <Link className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10" to="/worker">
                Manage Report
              </Link>
            </div>
          </details>
          <a className="btn-whatsapp" href={WHATSAPP_BOT_URL} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" />
            WhatsApp Bot
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 pb-2 text-xs text-slate-300">
        <LayoutDashboard className="h-3.5 w-3.5" />
        Admin: {session.adminLoggedIn ? 'Logged in' : 'Logged out'} • Worker:{' '}
        {session.workerId ? 'Logged in' : 'Logged out'}
      </div>
    </div>
  )
}

function Footer() {
  return (
    <div className="mt-12 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-bold text-white">{APP_NAME}</div>
            <div className="text-sm text-slate-300">
              Trust-first hyperlocal platform for daily + emergency services.
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="chip">Admin verification</span>
              <span className="chip">Nearby 5 workers</span>
              <span className="chip">Emergency mode</span>
              <span className="chip">Ratings</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold text-white">Dashboards</div>
            <div className="grid gap-2 text-sm">
              <Link className="text-slate-300 hover:text-white" to="/admin">
                <UserCog className="mr-2 inline h-4 w-4" />
                Admin verification
              </Link>
              <Link className="text-slate-300 hover:text-white" to="/worker">
                <Wrench className="mr-2 inline h-4 w-4" />
                Worker requests
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold text-white">WhatsApp booking</div>
            <div className="text-sm text-slate-300">
              No website? Book via chatbot and follow the same flow.
            </div>
            <a className="btn-whatsapp w-fit" href={WHATSAPP_BOT_URL} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-400">{APP_NAME}</div>
      </div>
    </div>
  )
}

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-full">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>
      <Footer />
    </div>
  )
}
