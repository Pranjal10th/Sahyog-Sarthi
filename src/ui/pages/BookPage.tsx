import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LocateFixed, MessageCircle, Phone, Send, Siren } from 'lucide-react'
import type { ServiceCategory, ServiceRequest, Worker } from '../../lib/types'
import { WHATSAPP_BOT_URL } from '../../lib/constants'
import type { LatLng } from '../../lib/types'
import { createRequest, distanceKm, listWorkers, readDb } from '../../lib/store'

const CATEGORIES: ServiceCategory[] = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Barber',
  'Car Mechanic',
  'Bike Mechanic',
  'AC Repair',
  'Appliance Repair',
  'House Cleaning',
  'Beautician',
  'Gardener',
  'Driver',
  'Laundry',
  'Cook',
  'Tutor',
  'Painter',
  'Other',
]

function Stars({ value }: { value: number }) {
  const full = Math.round(value)
  return (
    <span className="text-amber-200" title={`${value.toFixed(2)} / 5`}>
      {'★★★★★'.slice(0, full)}
      <span className="text-white/20">{'★★★★★'.slice(full)}</span>
    </span>
  )
}

export function BookPage() {
  const [priority, setPriority] = useState<ServiceRequest['priority']>('normal')
  const [category, setCategory] = useState<ServiceCategory>('Electrician')
  const [userName, setUserName] = useState('')
  const [userMobile, setUserMobile] = useState('')
  const [address, setAddress] = useState('')
  const [details, setDetails] = useState('')
  const [userLocation, setUserLocation] = useState<LatLng | undefined>(undefined)
  const [locError, setLocError] = useState('')
  const [submitted, setSubmitted] = useState<ServiceRequest | null>(null)

  const allWorkers = useMemo(() => listWorkers(), [submitted])

  const nearbyWorkers: Worker[] = useMemo(() => {
    if (!submitted) return []
    const db = readDb()
    return submitted.nearbyWorkerIds
      .map((id) => db.workers.find((w) => w.id === id))
      .filter(Boolean) as Worker[]
  }, [submitted])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const req = createRequest({
      userName: userName.trim() || 'Guest',
      userMobile: userMobile.trim() || '9XXXXXXXXX',
      address: address.trim() || 'Near my location',
      userLocation,
      category,
      details: details.trim() || 'Please contact me',
      priority,
    })
    setSubmitted(req)
  }

  async function useMyLocation() {
    setLocError('')
    if (!navigator.geolocation) {
      setLocError('Location not supported in this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        setLocError('Could not access location. Please allow GPS permission.')
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-black text-white">Book a service</div>
            <div className="mt-1 text-sm text-slate-300">
              Normal requests go to nearby 5 workers. Emergency requests prioritize direct contact.
            </div>
          </div>
          <a className="btn-whatsapp" href={WHATSAPP_BOT_URL} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="label">Your name</div>
              <input className="input mt-1" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div>
              <div className="label">Mobile</div>
              <input
                className="input mt-1"
                value={userMobile}
                onChange={(e) => setUserMobile(e.target.value)}
                placeholder="10-digit number"
              />
            </div>
          </div>

          <div>
            <div className="label">Address / locality</div>
            <input className="input mt-1" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">Your location</div>
                <div className="text-xs text-slate-300">
                  {userLocation ? `Lat ${userLocation.lat.toFixed(4)}, Lng ${userLocation.lng.toFixed(4)}` : 'Not set'}
                </div>
              </div>
              <button className="btn-ghost" type="button" onClick={useMyLocation}>
                <LocateFixed className="h-4 w-4" />
                Use my location
              </button>
            </div>
            {locError ? <div className="mt-2 text-sm text-rose-300">{locError}</div> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="label">Service</div>
              <div className="mt-1 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-slate-300">Select a service</div>
                <div className="max-h-52 overflow-auto pr-1">
                  <div className="grid gap-2">
                    {CATEGORIES.map((c) => (
                      <label
                        key={c}
                        className={
                          category === c
                            ? 'rounded-xl border border-indigo-400/30 bg-indigo-400/10 px-3 py-2 text-sm text-white cursor-pointer'
                            : 'rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 cursor-pointer'
                        }
                      >
                        <input
                          className="mr-2 align-middle"
                          type="radio"
                          name="category"
                          value={c}
                          checked={category === c}
                          onChange={() => setCategory(c)}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="label">Priority</div>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  className={priority === 'normal' ? 'btn-primary flex-1' : 'btn-ghost flex-1'}
                  onClick={() => setPriority('normal')}
                >
                  Normal
                </button>
                <button
                  type="button"
                  className={priority === 'emergency' ? 'btn-danger flex-1' : 'btn-ghost flex-1'}
                  onClick={() => setPriority('emergency')}
                >
                  <Siren className="h-4 w-4" />
                  Emergency
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="label">Problem details</div>
            <textarea
              className="input mt-1 min-h-24"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Example: Fan not working, urgent..."
            />
          </div>

          <button className="btn-primary w-fit" type="submit">
            <Send className="h-4 w-4" />
            Submit request
          </button>
        </form>

        {submitted && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-bold text-white">Request submitted</div>
                <div className="text-sm text-slate-300">
                  Request ID: <span className="font-mono text-slate-200">{submitted.id}</span>
                </div>
              </div>
              <Link className="btn-ghost w-fit" to={`/track?requestId=${encodeURIComponent(submitted.id)}`}>
                Track / status
              </Link>
            </div>

            <div className="mt-4 text-sm text-slate-300">
              Sent to <span className="font-bold text-white">{nearbyWorkers.length}</span> nearby verified workers.
              {priority === 'emergency' ? (
                <span className="ml-2 inline-flex items-center gap-2 text-rose-200">
                  <Siren className="h-4 w-4" />
                  Emergency: faster contact flow
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {nearbyWorkers.map((w) => (
                <div key={w.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-white">{w.name}</div>
                      <div className="text-xs text-slate-300">{w.profession}</div>
                      {submitted.userLocation ? (
                        <div className="mt-1 text-xs text-slate-300">
                          Distance:{' '}
                          <span className="text-white">
                            {distanceKm(submitted.userLocation, w.baseLocation)?.toFixed(1)} km
                          </span>
                        </div>
                      ) : null}
                      <div className="mt-1 text-xs text-slate-300">
                        Rating: <Stars value={w.ratingAvg || 0} />{' '}
                        <span className="text-white/50">({w.ratingCount})</span>
                      </div>
                    </div>
                    <span className="chip">Verified</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link className="btn-ghost" to={`/worker?focusRequestId=${encodeURIComponent(submitted.id)}&as=${encodeURIComponent(w.id)}`}>
                      View as worker
                    </Link>
                    {priority === 'emergency' ? (
                      <a className="btn-danger" href={`tel:${w.mobile}`}>
                        <Phone className="h-4 w-4" />
                        Call {w.mobile}
                      </a>
                    ) : (
                      <a className="btn-whatsapp" href={WHATSAPP_BOT_URL} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="text-sm font-bold text-white">Verified workers</div>
        <div className="mt-2 text-sm text-slate-300">
          Admin-approved workers show here. Pending workers will appear in Admin dashboard for verification.
        </div>

        <div className="mt-4 grid gap-3">
          {allWorkers
            .slice()
            .sort((a, b) => (b.status === 'approved' ? 1 : 0) - (a.status === 'approved' ? 1 : 0))
            .map((w) => (
              <div key={w.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-white">{w.name}</div>
                    <div className="text-xs text-slate-300">
                      {w.profession} • Aadhaar ****{w.aadhaarLast4}
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      Rating: <Stars value={w.ratingAvg || 0} />{' '}
                      <span className="text-white/50">({w.ratingCount})</span>
                    </div>
                  </div>
                  <span className="chip">{w.status === 'approved' ? 'Approved' : w.status === 'pending' ? 'Pending' : 'Rejected'}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

