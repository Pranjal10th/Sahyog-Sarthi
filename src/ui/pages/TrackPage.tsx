import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Star, Timer, Wrench } from 'lucide-react'
import type { ServiceRequest } from '../../lib/types'
import { completeRequest, readDb, stepLiveLocation, submitReview } from '../../lib/store'

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}

function StarsPicker(props: { value: number; onChange: (n: 1 | 2 | 3 | 4 | 5) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={props.value >= n ? 'btn-primary' : 'btn-ghost'}
          onClick={() => props.onChange(n as 1 | 2 | 3 | 4 | 5)}
        >
          {n}★
        </button>
      ))}
    </div>
  )
}

function MiniMap(props: { req: ServiceRequest }) {
  const loc = props.req.liveLocation
  const x = loc ? ((loc.lng + 180) / 360) * 100 : 50
  const y = loc ? ((90 - loc.lat) / 180) * 100 : 50
  return (
    <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute left-4 top-4 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-200 border border-white/10">
        Live tracking
      </div>
      <div
        className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30"
        style={{ left: `${x}%`, top: `${y}%` }}
        title="Worker location"
      />
      <div
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400"
        style={{ left: `50%`, top: `58%` }}
        title="User location"
      />
    </div>
  )
}

export function TrackPage() {
  const [params] = useSearchParams()
  const requestId = params.get('requestId') || ''
  const [tick, setTick] = useState(0)

  const { req, worker } = useMemo(() => {
    const db = readDb()
    const r = db.requests.find((x) => x.id === requestId)
    const w = r?.acceptedByWorkerId ? db.workers.find((x) => x.id === r.acceptedByWorkerId) : undefined
    return { req: r, worker: w }
  }, [requestId, tick])

  useEffect(() => {
    if (!req || req.status !== 'accepted') return
    const id = window.setInterval(() => {
      stepLiveLocation(req.id)
      setTick((x) => x + 1)
    }, 1500)
    return () => window.clearInterval(id)
  }, [req?.id, req?.status])

  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [comment, setComment] = useState('')
  const [reviewDone, setReviewDone] = useState(false)

  const canReview = Boolean(req?.status === 'completed' && req.acceptedByWorkerId)

  function onComplete() {
    if (!req) return
    completeRequest(req.id)
    setTick((x) => x + 1)
  }

  function onReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!req?.acceptedByWorkerId) return
    submitReview({
      requestId: req.id,
      workerId: req.acceptedByWorkerId,
      stars,
      comment,
    })
    setReviewDone(true)
    setTick((x) => x + 1)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-2xl font-black text-white">Track request</div>
            <div className="mt-1 text-sm text-slate-300">
              Paste your request ID from booking to track status and (after accept) live location.
            </div>
          </div>
          <div className="chip">
            <Timer className="mr-2 h-4 w-4 text-indigo-200" />
            Auto-updates when accepted
          </div>
        </div>

        {!requestId ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            No request ID found. Go to <span className="font-bold text-white">Book Service</span> and submit a request,
            then click Track.
          </div>
        ) : !req ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            Request not found for ID <span className="font-mono text-slate-200">{requestId}</span>.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">
                    {req.category} • {req.priority.toUpperCase()}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    Created: {formatTime(req.createdAt)} • Status:{' '}
                    <span className="font-bold text-white">{req.status.toUpperCase()}</span>
                  </div>
                </div>
                <div className="chip">
                  <MapPin className="mr-2 h-4 w-4 text-emerald-200" />
                  {req.address}
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-300">{req.details}</div>
            </div>

            {req.status === 'open' ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 border border-white/10">
                    <Wrench className="h-5 w-5 text-indigo-200" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Waiting for a worker to accept</div>
                    <div className="mt-1 text-sm text-slate-300">
                      Open the <span className="font-bold text-white">Worker</span> dashboard and accept this request.
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {req.status === 'accepted' && worker ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-bold text-white">Accepted by</div>
                  <div className="mt-1 text-sm text-slate-300">
                    <span className="font-black text-white">{worker.name}</span> • {worker.profession} • Aadhaar ****
                    {worker.aadhaarLast4}
                  </div>
                  {req.liveUpdatedAt ? (
                    <div className="mt-2 text-xs text-emerald-300">
                      Live location last sent: {new Date(req.liveUpdatedAt).toLocaleTimeString()}
                    </div>
                  ) : null}
                </div>
                <MiniMap req={req} />
                <button className="btn-primary w-fit" type="button" onClick={onComplete}>
                  Mark service completed
                </button>
              </div>
            ) : null}

            {req.status === 'completed' && worker ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-bold text-white">Service completed</div>
                <div className="mt-1 text-sm text-slate-300">
                  Please rate <span className="font-black text-white">{worker.name}</span> to improve trust + priority.
                </div>

                {canReview && !reviewDone ? (
                  <form className="mt-4 grid gap-3" onSubmit={onReviewSubmit}>
                    <div className="text-sm font-semibold text-slate-200">
                      <Star className="mr-2 inline h-4 w-4 text-amber-200" />
                      Rating
                    </div>
                    <StarsPicker value={stars} onChange={setStars} />
                    <div>
                      <div className="label">Feedback</div>
                      <textarea
                        className="input mt-1 min-h-24"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Quick feedback..."
                      />
                    </div>
                    <button className="btn-primary w-fit" type="submit">
                      Submit review
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-emerald-200">
                    Review submitted. Thanks!
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="text-sm font-bold text-white">Tips</div>
        <div className="mt-3 grid gap-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            - Submit a request in <span className="font-bold text-white">Book Service</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            - Go to <span className="font-bold text-white">Worker</span> dashboard and accept it
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            - Return here: you’ll see live tracking + completion + rating flow
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/book">
            Book Service
          </Link>
          <Link className="btn-ghost" to="/worker">
            Worker Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

