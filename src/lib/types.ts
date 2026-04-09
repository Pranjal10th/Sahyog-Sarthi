export type Role = 'user' | 'worker' | 'admin'

export type WorkerStatus = 'pending' | 'approved' | 'rejected'

export type ServiceCategory =
  | 'Electrician'
  | 'Plumber'
  | 'Carpenter'
  | 'Barber'
  | 'Car Mechanic'
  | 'Bike Mechanic'
  | 'AC Repair'
  | 'Appliance Repair'
  | 'House Cleaning'
  | 'Beautician'
  | 'Gardener'
  | 'Driver'
  | 'Laundry'
  | 'Cook'
  | 'Tutor'
  | 'Painter'
  | 'Other'

export type RequestPriority = 'normal' | 'emergency'
export type RequestStatus = 'open' | 'accepted' | 'completed' | 'cancelled'

export type LatLng = { lat: number; lng: number }

export type Worker = {
  id: string
  name: string
  aadhaarLast4: string
  profession: ServiceCategory
  mobile: string
  password: string
  status: WorkerStatus
  ratingAvg: number
  ratingCount: number
  baseLocation: LatLng
}

export type ServiceRequest = {
  id: string
  createdAt: number
  userName: string
  userMobile: string
  address: string
  userLocation?: LatLng
  category: ServiceCategory
  details: string
  priority: RequestPriority
  status: RequestStatus
  nearbyWorkerIds: string[]
  acceptedByWorkerId?: string
  liveLocation?: LatLng
  liveUpdatedAt?: number
}

export type Review = {
  id: string
  requestId: string
  workerId: string
  stars: 1 | 2 | 3 | 4 | 5
  comment: string
  createdAt: number
}

export type Db = {
  workers: Worker[]
  requests: ServiceRequest[]
  reviews: Review[]
}

export type Session = {
  adminLoggedIn: boolean
  workerId?: string
}
