import type { Db, LatLng, Review, ServiceCategory, ServiceRequest, Session, Worker } from './types'

const STORAGE_KEY = 'nsm_demo_v1'
const SESSION_KEY = 'nsm_session_v1'
export const DEFAULT_ADMIN_ID = 'admin'
export const DEFAULT_ADMIN_PASSWORD = 'admin123'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function jitterLocation(loc: LatLng, meters: number): LatLng {
  const d = meters / 111_000
  const lat = loc.lat + (Math.random() * 2 - 1) * d
  const lng = loc.lng + (Math.random() * 2 - 1) * d
  return { lat, lng }
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa))
  return R * c
}

export function readDb(): Db {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return seedDb()
  try {
    const parsed = JSON.parse(raw) as Db
    if (!parsed?.workers || !parsed?.requests || !parsed?.reviews) return seedDb()
    return parsed
  } catch {
    return seedDb()
  }
}

export function writeDb(next: Db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function resetDb() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(SESSION_KEY)
}

export function seedDb(): Db {
  const base: LatLng = { lat: 26.8467, lng: 80.9462 } // Lucknow-ish demo
  const workers: Worker[] = [
    {
      id: uid('w'),
      name: 'Aman Verma',
      aadhaarLast4: '4821',
      profession: 'Electrician',
      mobile: '9876500001',
      password: 'worker123',
      status: 'approved',
      ratingAvg: 4.7,
      ratingCount: 32,
      baseLocation: jitterLocation(base, 900),
    },
    {
      id: uid('w'),
      name: 'Sana Khan',
      aadhaarLast4: '9134',
      profession: 'Plumber',
      mobile: '9876500002',
      password: 'worker123',
      status: 'approved',
      ratingAvg: 4.5,
      ratingCount: 21,
      baseLocation: jitterLocation(base, 1400),
    },
    {
      id: uid('w'),
      name: 'Rohit Sharma',
      aadhaarLast4: '2210',
      profession: 'AC Repair',
      mobile: '9876500003',
      password: 'worker123',
      status: 'pending',
      ratingAvg: 0,
      ratingCount: 0,
      baseLocation: jitterLocation(base, 1600),
    },
    {
      id: uid('w'),
      name: 'Meera Singh',
      aadhaarLast4: '0049',
      profession: 'House Cleaning',
      mobile: '9876500004',
      password: 'worker123',
      status: 'approved',
      ratingAvg: 4.8,
      ratingCount: 40,
      baseLocation: jitterLocation(base, 1100),
    },
    {
      id: uid('w'),
      name: 'Dev Patel',
      aadhaarLast4: '7788',
      profession: 'Carpenter',
      mobile: '9876500005',
      password: 'worker123',
      status: 'approved',
      ratingAvg: 4.2,
      ratingCount: 12,
      baseLocation: jitterLocation(base, 1800),
    },
    {
      id: uid('w'),
      name: 'Neha Gupta',
      aadhaarLast4: '6502',
      profession: 'Tutor',
      mobile: '9876500006',
      password: 'worker123',
      status: 'approved',
      ratingAvg: 4.9,
      ratingCount: 18,
      baseLocation: jitterLocation(base, 2000),
    },
  ]

  const db: Db = { workers, requests: [], reviews: [] }
  writeDb(db)
  return db
}

export function listWorkers() {
  return readDb().workers
}

export function listRequests() {
  return readDb().requests.slice().sort((a, b) => b.createdAt - a.createdAt)
}

export function listReviewsForWorker(workerId: string) {
  return readDb().reviews.filter((r) => r.workerId === workerId).sort((a, b) => b.createdAt - a.createdAt)
}

export function registerWorker(input: {
  name: string
  aadhaarLast4: string
  profession: ServiceCategory
  mobile: string
  password: string
}): Worker {
  const db = readDb()
  const base: LatLng = { lat: 26.8467, lng: 80.9462 }
  const worker: Worker = {
    id: uid('w'),
    name: input.name,
    aadhaarLast4: input.aadhaarLast4,
    profession: input.profession,
    mobile: input.mobile,
    password: input.password,
    status: 'pending',
    ratingAvg: 0,
    ratingCount: 0,
    baseLocation: jitterLocation(base, 2500),
  }
  db.workers.push(worker)
  writeDb(db)
  return worker
}

export function setWorkerStatus(workerId: string, status: Worker['status']) {
  const db = readDb()
  const w = db.workers.find((x) => x.id === workerId)
  if (!w) return
  w.status = status
  writeDb(db)
}

export function deleteWorker(workerId: string) {
  const db = readDb()
  db.workers = db.workers.filter((w) => w.id !== workerId)
  db.requests = db.requests
    .map((r) => ({
      ...r,
      nearbyWorkerIds: r.nearbyWorkerIds.filter((id) => id !== workerId),
      acceptedByWorkerId: r.acceptedByWorkerId === workerId ? undefined : r.acceptedByWorkerId,
      status: r.acceptedByWorkerId === workerId && r.status === 'accepted' ? 'open' : r.status,
      liveLocation: r.acceptedByWorkerId === workerId ? undefined : r.liveLocation,
      liveUpdatedAt: r.acceptedByWorkerId === workerId ? undefined : r.liveUpdatedAt,
    }))
    .filter((r) => r.nearbyWorkerIds.length > 0 || r.status === 'completed')
  db.reviews = db.reviews.filter((rev) => rev.workerId !== workerId)
  writeDb(db)

  const session = readSession()
  if (session.workerId === workerId) {
    writeSession({ ...session, workerId: undefined })
  }
}

function scoreWorkerForRequest(w: Worker, category: ServiceCategory) {
  const categoryBoost = w.profession === category ? 0.7 : 0
  const ratingBoost = clamp(w.ratingAvg / 5, 0, 1) * 0.6
  const random = Math.random() * 0.2
  return categoryBoost + ratingBoost + random
}

export function findNearby5Workers(category: ServiceCategory, userLocation?: LatLng): Worker[] {
  const db = readDb()
  const pool = db.workers.filter((w) => w.status === 'approved')
  const ranked = pool.slice().sort((a, b) => {
    const base = scoreWorkerForRequest(b, category) - scoreWorkerForRequest(a, category)
    if (!userLocation) return base
    const da = haversineKm(userLocation, a.baseLocation)
    const dbb = haversineKm(userLocation, b.baseLocation)
    // closer should come first, so subtract distance (scaled)
    return base + (da - dbb) * 0.12
  })
  return ranked.slice(0, 5)
}

export function createRequest(input: {
  userName: string
  userMobile: string
  address: string
  userLocation?: LatLng
  category: ServiceCategory
  details: string
  priority: ServiceRequest['priority']
}): ServiceRequest {
  const db = readDb()
  const nearby = findNearby5Workers(input.category, input.userLocation)
  const req: ServiceRequest = {
    id: uid('req'),
    createdAt: Date.now(),
    userName: input.userName,
    userMobile: input.userMobile,
    address: input.address,
    userLocation: input.userLocation,
    category: input.category,
    details: input.details,
    priority: input.priority,
    status: 'open',
    nearbyWorkerIds: nearby.map((w) => w.id),
  }
  db.requests.push(req)
  writeDb(db)
  return req
}

export function distanceKm(a?: LatLng, b?: LatLng) {
  if (!a || !b) return undefined
  return haversineKm(a, b)
}

export function acceptRequest(requestId: string, workerId: string) {
  const db = readDb()
  const req = db.requests.find((r) => r.id === requestId)
  if (!req || req.status !== 'open') return
  if (!req.nearbyWorkerIds.includes(workerId)) return
  req.status = 'accepted'
  req.acceptedByWorkerId = workerId
  const worker = db.workers.find((w) => w.id === workerId)
  if (worker) req.liveLocation = jitterLocation(worker.baseLocation, 150)
  req.liveUpdatedAt = Date.now()
  writeDb(db)
}

export function completeRequest(requestId: string) {
  const db = readDb()
  const req = db.requests.find((r) => r.id === requestId)
  if (!req || req.status !== 'accepted') return
  req.status = 'completed'
  writeDb(db)
}

export function stepLiveLocation(requestId: string) {
  const db = readDb()
  const req = db.requests.find((r) => r.id === requestId)
  if (!req || req.status !== 'accepted' || !req.liveLocation) return
  req.liveLocation = jitterLocation(req.liveLocation, 60)
  req.liveUpdatedAt = Date.now()
  writeDb(db)
}

export function sendWorkerLiveLocation(requestId: string, workerId: string) {
  const db = readDb()
  const req = db.requests.find((r) => r.id === requestId)
  const worker = db.workers.find((w) => w.id === workerId)
  if (!req || !worker || req.status !== 'accepted' || req.acceptedByWorkerId !== workerId) return
  req.liveLocation = jitterLocation(worker.baseLocation, 120)
  req.liveUpdatedAt = Date.now()
  writeDb(db)
}

export function readSession(): Session {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return { adminLoggedIn: false }
  try {
    const parsed = JSON.parse(raw) as Session
    return {
      adminLoggedIn: Boolean(parsed.adminLoggedIn),
      workerId: parsed.workerId,
    }
  } catch {
    return { adminLoggedIn: false }
  }
}

export function writeSession(next: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(next))
}

export function adminLogin(adminId: string, password: string) {
  if (adminId.trim() !== DEFAULT_ADMIN_ID || password !== DEFAULT_ADMIN_PASSWORD) return false
  const s = readSession()
  writeSession({ ...s, adminLoggedIn: true })
  return true
}

export function adminLogout() {
  const s = readSession()
  writeSession({ ...s, adminLoggedIn: false })
}

export function workerLogin(mobile: string, password: string) {
  const db = readDb()
  const worker = db.workers.find((w) => w.mobile === mobile && w.password === password)
  if (!worker) return false
  const s = readSession()
  writeSession({ ...s, workerId: worker.id })
  return true
}

export function workerLogout() {
  const s = readSession()
  writeSession({ ...s, workerId: undefined })
}

export function submitReview(input: {
  requestId: string
  workerId: string
  stars: 1 | 2 | 3 | 4 | 5
  comment: string
}): Review {
  const db = readDb()
  const review: Review = {
    id: uid('rev'),
    requestId: input.requestId,
    workerId: input.workerId,
    stars: input.stars,
    comment: input.comment.trim(),
    createdAt: Date.now(),
  }
  db.reviews.push(review)

  const worker = db.workers.find((w) => w.id === input.workerId)
  if (worker) {
    const total = worker.ratingAvg * worker.ratingCount + input.stars
    worker.ratingCount += 1
    worker.ratingAvg = Number((total / worker.ratingCount).toFixed(2))
  }

  writeDb(db)
  return review
}
