import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME, WHATSAPP_BOT_URL } from '../../lib/constants'
import { listWorkers } from '../../lib/store'
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  MessageCircle,
  Siren,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'

function FeatureCard(props: { title: string; desc: string; icon: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-white">
        <span className="text-indigo-200">{props.icon}</span>
        {props.title}
      </div>
      <div className="text-sm text-slate-300">{props.desc}</div>
    </div>
  )
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value)
  return (
    <span className="text-amber-200" title={`${value.toFixed(2)} / 5`}>
      {'★★★★★'.slice(0, full)}
      <span className="text-white/20">{'★★★★★'.slice(full)}</span>
    </span>
  )
}

export function HomePage() {
  const trustedWorkers = useMemo(
    () =>
      listWorkers()
        .filter((w) => w.status === 'approved')
        .sort((a, b) => b.ratingAvg - a.ratingAvg)
        .slice(0, 6),
    [],
  )

  return (
    <div className="space-y-10">
      <div className="glass rounded-3xl p-6 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              <Sparkles className="h-4 w-4 text-indigo-200" />
              Hyperlocal • Verified • Emergency-ready
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              {APP_NAME}
            </h1>
            <p className="mt-3 text-base text-slate-300 md:text-lg">
              Find trusted neighbourhood workers in seconds. Admin-verified professionals, WhatsApp booking,
              emergency mode, live tracking, and ratings for real trust.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/book">
                Book a service
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a className="btn-whatsapp" href={WHATSAPP_BOT_URL} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Book via WhatsApp
              </a>
              <Link className="btn-ghost" to="/track">
                <MapPin className="h-4 w-4" />
                Track worker
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip">
                <BadgeCheck className="mr-2 h-4 w-4 text-emerald-200" />
                Admin verification
              </span>
              <span className="chip">
                <Users className="mr-2 h-4 w-4 text-indigo-200" />
                Nearby 5 workers
              </span>
              <span className="chip">
                <Siren className="mr-2 h-4 w-4 text-rose-200" />
                Emergency response
              </span>
              <span className="chip">
                <Star className="mr-2 h-4 w-4 text-amber-200" />
                Ratings & reviews
              </span>
            </div>
          </div>

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/15 via-white/5 to-emerald-500/10 p-6">
            <div className="text-sm font-bold text-white">Quick actions</div>
            <div className="mt-3 grid gap-3 text-sm text-slate-200">
              <Link className="rounded-2xl bg-black/20 p-4 hover:bg-black/30" to="/book">
                Book daily services
              </Link>
              <Link className="rounded-2xl bg-black/20 p-4 hover:bg-black/30" to="/track">
                Track accepted worker live
              </Link>
              <Link className="rounded-2xl bg-black/20 p-4 hover:bg-black/30" to="/worker">
                Worker login & requests
              </Link>
              <Link className="rounded-2xl bg-black/20 p-4 hover:bg-black/30" to="/admin">
                Admin approvals
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 md:p-10">
        <div className="text-xl font-black text-white">What we provide on our platform</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            'Verified local workers for home and personal services',
            'Fast booking from website or WhatsApp chatbot',
            'Emergency mode for urgent service needs',
            'Nearby worker matching for quicker response',
            'Live tracking after worker accepts your request',
            'Rating and review system for better trust',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-6 md:p-10">
        <div className="text-xl font-black text-white">Trusted workers with ratings</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {trustedWorkers.map((w) => (
            <div key={w.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">{w.name}</div>
                  <div className="text-xs text-slate-300">{w.profession}</div>
                  <div className="mt-1 text-xs text-slate-300">
                    Rating: <Stars value={w.ratingAvg || 0} /> <span className="text-white/50">({w.ratingCount})</span>
                  </div>
                </div>
                <span className="chip">Trusted</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Trust problem solved"
          icon={<BadgeCheck className="h-4 w-4" />}
          desc="Workers are verified by Admin (Aadhaar last-4 + details). Users see status + ratings before choosing."
        />
        <FeatureCard
          title="Emergency mode"
          icon={<Siren className="h-4 w-4" />}
          desc="Emergency requests prioritize fast contact. Normal requests broadcast to the nearest 5 workers."
        />
        <FeatureCard
          title="Future scope (Phase 4)"
          icon={<Sparkles className="h-4 w-4" />}
          desc="AI best-worker suggestion, voice booking, live tracking, smart emergency response, multi-city expansion."
        />
      </div>

    </div>
  )
}

