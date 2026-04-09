# Neighbourhood Service Marketplace (Hyperlocal Service Platform)

A hackathon-ready hyperlocal service marketplace with **User / Worker / Admin** flows, **WhatsApp booking**, **Emergency calling**, **live worker tracking**, and **ratings & reviews**.

## What this platform provides

- **Verified workers**: Admin verifies and approves worker accounts before they can take jobs.
- **Fast booking**: Users can book services from the website or via WhatsApp.
- **Emergency mode**: In emergency, user can **directly call** a worker.
- **Nearby matching**: Requests are sent to the **nearest 5 approved workers** (based on user location + rating + category match).
- **Live tracking**: After a worker accepts, the worker can send live location updates and the user can track them.
- **Ratings & reviews**: After service completion, users can submit a rating and feedback.

## Roles & workflow (high level)

### Admin
- Login
- Review pending workers
- Approve / Reject
- Delete worker accounts

### Worker
- Create account (mobile + password + profession)
- Wait for admin approval
- Login
- Receive requests
- Accept request
- Send live location updates to user

### User
- Choose service category
- (Optional) use “Use my location”
- Submit request (Normal / Emergency)
- Request goes to nearby 5 workers
- Track request
- Rate after completion

## Default credentials

### Admin
- **Admin ID**: `admin`
- **Password**: `admin123`

### Seed workers (example)
Seed workers are created automatically on first run with `password = worker123`.
You can also create your own worker account from the Worker page.

## Run locally

### 1) Install
```bash
npm install
```

### 2) Start dev server
```bash
npm run dev
```

### 3) Build
```bash
npm run build
```

## Demo script (for presentation)

1. Open **Book Service**
2. Click **Use my location** (allow permission)
3. Choose a service (e.g. Electrician)
4. Pick **Normal** and submit
5. Open **Worker** → login with a worker mobile + `worker123`
6. Accept the request
7. Click **Send live location** (worker)
8. Open **Track** with Request ID → see live tracking update time
9. Mark completed → submit rating & review

### Emergency demo
1. Open **Book Service**
2. Select **Emergency**
3. Submit request
4. You will see a **Call** button with the worker contact number.

## Tech stack

- React + TypeScript (Vite)
- TailwindCSS
- React Router
- lucide-react icons

## Notes

- This project stores data in the browser for demo purposes (workers, requests, sessions, reviews).
- For production, move auth + verification + request routing to a secure backend and store secrets server-side.

