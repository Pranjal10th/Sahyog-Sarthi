import { useMemo, useState } from 'react'
import { CheckCircle2, Shield, Trash2, XCircle } from 'lucide-react'
import {
  adminLogin,
  adminLogout,
  deleteWorker,
  DEFAULT_ADMIN_ID,
  DEFAULT_ADMIN_PASSWORD,
  listWorkers,
  readSession,
  resetDb,
  seedDb,
  setWorkerStatus,
} from '../../lib/store'

export function AdminPage() {
  const [tick, setTick] = useState(0)
  const [adminId, setAdminId] = useState(DEFAULT_ADMIN_ID)
  const [adminPass, setAdminPass] = useState(DEFAULT_ADMIN_PASSWORD)
  const [loginError, setLoginError] = useState('')
  const workers = useMemo(() => listWorkers(), [tick])
  const session = readSession()

  const pending = workers.filter((w) => w.status === 'pending')
  const approved = workers.filter((w) => w.status === 'approved')
  const rejected = workers.filter((w) => w.status === 'rejected')

  function approve(id: string) {
    setWorkerStatus(id, 'approved')
    setTick((x) => x + 1)
  }

  function reject(id: string) {
    setWorkerStatus(id, 'rejected')
    setTick((x) => x + 1)
  }

  function removeWorker(id: string) {
    deleteWorker(id)
    setTick((x) => x + 1)
  }

  function reset() {
    resetDb()
    seedDb()
    setTick((x) => x + 1)
  }

  function onLogin(e: React.FormEvent) {
    e.preventDefault()
    const ok = adminLogin(adminId, adminPass)
    if (!ok) {
      setLoginError('Invalid admin ID or password')
      return
    }
    setLoginError('')
    setTick((x) => x + 1)
  }

  function onLogout() {
    adminLogout()
    setTick((x) => x + 1)
  }

  if (!session.adminLoggedIn) {
    return (
      <div className="glass mx-auto max-w-xl rounded-3xl p-6 md:p-8">
        <div className="text-2xl font-black text-white">Admin Login</div>
        <div className="mt-1 text-sm text-slate-300">Use default credentials to manage worker approvals and reports.</div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          Default Admin ID: <span className="font-mono text-white">{DEFAULT_ADMIN_ID}</span> • Password:{' '}
          <span className="font-mono text-white">{DEFAULT_ADMIN_PASSWORD}</span>
        </div>
        <form className="mt-4 grid gap-3" onSubmit={onLogin}>
          <div>
            <div className="label">Admin ID</div>
            <input className="input mt-1" value={adminId} onChange={(e) => setAdminId(e.target.value)} />
          </div>
          <div>
            <div className="label">Password</div>
            <input className="input mt-1" type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
          </div>
          {loginError ? <div className="text-sm text-rose-300">{loginError}</div> : null}
          <button className="btn-primary w-fit" type="submit">
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-black text-white">Admin verification</div>
            <div className="mt-1 text-sm text-slate-300">
              Verify worker details (Aadhaar last-4 + profession) and approve/reject to unlock requests.
            </div>
          </div>
          <span className="chip">
            <Shield className="mr-2 h-4 w-4 text-emerald-200" />
            Trust control
          </span>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Pending: <span className="font-black text-white">{pending.length}</span> • Approved:{' '}
            <span className="font-black text-white">{approved.length}</span> • Rejected:{' '}
            <span className="font-black text-white">{rejected.length}</span>
          </div>
          <button className="btn-ghost w-fit" type="button" onClick={reset}>
            <Trash2 className="h-4 w-4" />
            Reset data
          </button>
          <button className="btn-ghost w-fit" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="text-2xl font-black text-white">Pending workers</div>
        <div className="mt-1 text-sm text-slate-300">Approve them so they can receive user requests.</div>

        <div className="mt-6 space-y-4">
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              No pending workers right now. Create one from Worker dashboard.
            </div>
          ) : null}

          {pending.map((w) => (
            <div key={w.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">{w.name}</div>
                  <div className="mt-1 text-xs text-slate-300">
                    Profession: <span className="font-bold text-white">{w.profession}</span> • Aadhaar ****{w.aadhaarLast4}{' '}
                    • Mobile {w.mobile}
                  </div>
                </div>
                <span className="chip">Pending</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary" type="button" onClick={() => approve(w.id)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </button>
                <button className="btn-danger" type="button" onClick={() => reject(w.id)}>
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button className="btn-ghost" type="button" onClick={() => removeWorker(w.id)}>
                  Delete account
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm font-bold text-white">All workers</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {workers.map((w) => (
            <div key={w.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">{w.name}</div>
                  <div className="text-xs text-slate-300">
                    {w.profession} • Aadhaar ****{w.aadhaarLast4} • {w.mobile}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">Status: {w.status}</div>
                </div>
                <button className="btn-ghost" type="button" onClick={() => removeWorker(w.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

