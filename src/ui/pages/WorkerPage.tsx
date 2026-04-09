import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BadgeCheck, Clock, Inbox, LocateFixed, LogOut, ShieldAlert, UserPlus } from 'lucide-react'
import type { ServiceCategory, Worker } from '../../lib/types'
import {
  acceptRequest,
  listRequests,
  listWorkers,
  readDb,
  readSession,
  registerWorker,
  sendWorkerLiveLocation,
  workerLogin,
  workerLogout,
} from '../../lib/store'

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

function ProfessionPicker(props: { value: ServiceCategory; onChange: (v: ServiceCategory) => void }) {
  return (
    <div className="mt-1 max-h-56 overflow-auto rounded-2xl border border-white/10 bg-black/20 p-2">
      <div className="grid gap-2">
        {CATEGORIES.map((c) => (
          <label
            key={c}
            className={
              props.value === c
                ? 'rounded-xl border border-indigo-400/30 bg-indigo-400/10 px-3 py-2 text-sm text-white cursor-pointer'
                : 'rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 cursor-pointer'
            }
          >
            <input
              className="mr-2 align-middle"
              type="radio"
              name="profession"
              value={c}
              checked={props.value === c}
              onChange={() => props.onChange(c)}
            />
            {c}
          </label>
        ))}
      </div>
    </div>
  )
}

export function WorkerPage() {
  const [params] = useSearchParams()
  const asWorkerId = params.get('as') || ''
  const focusRequestId = params.get('focusRequestId') || ''

  const [tick, setTick] = useState(0)
  const [loginMobile, setLoginMobile] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const session = readSession()

  const workers = useMemo(() => listWorkers(), [tick])
  const defaultWorker = workers.find((w) => w.id === asWorkerId) || workers.find((w) => w.status === 'approved') || workers[0]
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(session.workerId || defaultWorker?.id || '')

  const worker: Worker | undefined = useMemo(
    () => workers.find((w) => w.id === selectedWorkerId),
    [workers, selectedWorkerId],
  )

  const requests = useMemo(() => {
    if (!worker) return []
    return listRequests().filter((r) => r.nearbyWorkerIds.includes(worker.id))
  }, [worker, tick])

  const open = requests.filter((r) => r.status === 'open')
  const accepted = requests.filter((r) => r.status === 'accepted' && r.acceptedByWorkerId === worker?.id)

  function onAccept(requestId: string) {
    if (!worker) return
    acceptRequest(requestId, worker.id)
    setTick((x) => x + 1)
  }

  const [regName, setRegName] = useState('')
  const [regAadhaar, setRegAadhaar] = useState('')
  const [regMobile, setRegMobile] = useState('')
  const [regProfession, setRegProfession] = useState<ServiceCategory>('Electrician')

  function onRegister(e: React.FormEvent) {
    e.preventDefault()
    const w = registerWorker({
      name: regName.trim() || 'New Worker',
      aadhaarLast4: (regAadhaar.trim() || '0000').slice(-4),
      profession: regProfession,
      mobile: regMobile.trim() || '9XXXXXXXXX',
      password: regPassword.trim() || 'worker123',
    })
    setSelectedWorkerId(w.id)
    setRegName('')
    setRegAadhaar('')
    setRegMobile('')
    setTick((x) => x + 1)
  }
  const [regPassword, setRegPassword] = useState('')

  function onLogin(e: React.FormEvent) {
    e.preventDefault()
    const ok = workerLogin(loginMobile, loginPassword)
    if (!ok) {
      setLoginError('Invalid worker mobile or password')
      return
    }
    const next = readSession()
    setSelectedWorkerId(next.workerId || '')
    setLoginError('')
    setTick((x) => x + 1)
  }

  function onLogout() {
    workerLogout()
    setSelectedWorkerId('')
    setTick((x) => x + 1)
  }

  const statusChip =
    worker?.status === 'approved'
      ? { label: 'Approved', icon: <BadgeCheck className="h-4 w-4 text-emerald-200" /> }
      : worker?.status === 'pending'
        ? { label: 'Pending', icon: <Clock className="h-4 w-4 text-amber-200" /> }
        : { label: 'Rejected', icon: <ShieldAlert className="h-4 w-4 text-rose-200" /> }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="text-2xl font-black text-white">Worker dashboard</div>
        <div className="mt-1 text-sm text-slate-300">Register → wait for approval → receive requests → accept & contact user.</div>

        {!session.workerId ? (
          <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-6">
            <div className="text-sm font-bold text-white">Worker Login</div>
            <form className="mt-3 grid gap-3" onSubmit={onLogin}>
              <div>
                <div className="label">Mobile</div>
                <input className="input mt-1" value={loginMobile} onChange={(e) => setLoginMobile(e.target.value)} />
              </div>
              <div>
                <div className="label">Password</div>
                <input
                  className="input mt-1"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              {loginError ? <div className="text-sm text-rose-300">{loginError}</div> : null}
              <button className="btn-primary w-fit" type="submit">
                Login
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-5">
            <button className="btn-ghost" type="button" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Worker logout
            </button>
          </div>
        )}

        <div className="mt-5">
          <div className="label">Switch worker</div>
          <select className="input mt-1" value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)}>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} • {w.profession} • {w.status}
              </option>
            ))}
          </select>
        </div>

        {worker && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-white">{worker.name}</div>
                <div className="text-xs text-slate-300">
                  {worker.profession} • Aadhaar ****{worker.aadhaarLast4} • Mobile {worker.mobile}
                </div>
              </div>
              <span className="chip">
                {statusChip.icon}
                <span className="ml-2">{statusChip.label}</span>
              </span>
            </div>

            {worker.status !== 'approved' ? (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                Waiting for Admin verification. Go to Admin dashboard and approve this worker.
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <UserPlus className="h-4 w-4 text-indigo-200" />
            New worker registration
          </div>
          <form className="mt-4 grid gap-3" onSubmit={onRegister}>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="label">Name</div>
                <input className="input mt-1" value={regName} onChange={(e) => setRegName(e.target.value)} />
              </div>
              <div>
                <div className="label">Mobile</div>
                <input className="input mt-1" value={regMobile} onChange={(e) => setRegMobile(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="label">Aadhaar last 4</div>
                <input className="input mt-1" value={regAadhaar} onChange={(e) => setRegAadhaar(e.target.value)} />
              </div>
              <div>
                <div className="label">Profession</div>
                <ProfessionPicker value={regProfession} onChange={setRegProfession} />
              </div>
            </div>
            <div>
              <div className="label">Create password</div>
              <input className="input mt-1" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            </div>
            <button className="btn-primary w-fit" type="submit">
              Submit for approval
            </button>
          </form>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-2xl font-black text-white">Requests</div>
            <div className="mt-1 text-sm text-slate-300">Requests that were sent to this worker (nearby 5).</div>
          </div>
          <span className="chip">
            <Inbox className="mr-2 h-4 w-4 text-indigo-200" />
            Open: {open.length} • Accepted: {accepted.length}
          </span>
        </div>

        {!worker ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            No worker selected.
          </div>
        ) : session.workerId !== worker.id ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            Login as this worker to manage requests and reports.
          </div>
        ) : worker.status !== 'approved' ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            This worker is not approved yet, so requests won’t be active.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                No requests yet. Create one from Book Service.
              </div>
            ) : null}

            {requests
              .slice()
              .sort((a, b) => (a.id === focusRequestId ? -1 : 0) - (b.id === focusRequestId ? -1 : 0))
              .map((r) => {
                const focused = r.id === focusRequestId
                const db = readDb()
                const acceptedBy = r.acceptedByWorkerId ? db.workers.find((w) => w.id === r.acceptedByWorkerId) : undefined
                const canAccept = r.status === 'open' && r.nearbyWorkerIds.includes(worker.id)
                return (
                  <div
                    key={r.id}
                    className={
                      focused
                        ? 'rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-5'
                        : 'rounded-2xl border border-white/10 bg-white/5 p-5'
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-white">
                          {r.category} • {r.priority.toUpperCase()}
                        </div>
                        <div className="mt-1 text-xs text-slate-300">
                          Request ID: <span className="font-mono text-slate-200">{r.id}</span> • Status:{' '}
                          <span className="font-bold text-white">{r.status.toUpperCase()}</span>
                        </div>
                      </div>
                      <span className="chip">{r.priority === 'emergency' ? 'Emergency' : 'Normal'}</span>
                    </div>

                    <div className="mt-3 text-sm text-slate-200">{r.details}</div>
                    <div className="mt-2 text-xs text-slate-400">
                      User: {r.userName} • Mobile: {r.userMobile} • Address: {r.address}
                    </div>

                    {acceptedBy ? (
                      <div className="mt-3 text-xs text-slate-300">
                        Accepted by: <span className="font-bold text-white">{acceptedBy.name}</span>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {canAccept ? (
                        <button className="btn-primary" type="button" onClick={() => onAccept(r.id)}>
                          Accept request
                        </button>
                      ) : null}
                      {r.status === 'accepted' && r.acceptedByWorkerId === worker.id ? (
                        <button
                          className="btn-ghost"
                          type="button"
                          onClick={() => {
                            sendWorkerLiveLocation(r.id, worker.id)
                            setTick((x) => x + 1)
                          }}
                        >
                          <LocateFixed className="h-4 w-4" />
                          Send live location
                        </button>
                      ) : null}
                      <button
                        className="btn-ghost"
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(r.id)
                        }}
                      >
                        Copy request ID
                      </button>
                    </div>
                    {r.liveUpdatedAt ? (
                      <div className="mt-2 text-xs text-emerald-300">
                        Last location update sent: {new Date(r.liveUpdatedAt).toLocaleTimeString()}
                      </div>
                    ) : null}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}

