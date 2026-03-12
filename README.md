# Versoek – Corporate Carpooling Platform

Versoek is a production‑ready corporate carpooling platform that helps organizations reduce commuting costs, parking pressure, and environmental impact by connecting employees who travel similar routes.

> Pay‑per‑successful‑carpool pricing model, bilingual NL/EN UI, and a complete full‑stack implementation (React + Node.js + MySQL) ready for self‑hosting.

***

## Features

- Full ride management: create, edit, cancel single and recurring rides.  
- Booking system: request to join rides, accept/decline, automatic seat tracking.  
- Calendar dashboard: day/week/month views, color‑coded driver vs passenger rides.  
- Notifications: email (HTML, .ics calendar invites) and in‑app notifications.  
- Security: JWT auth, email verification, bcrypt, validated inputs, HTTPS‑ready.  
- Bilingual: complete Dutch and English interface with language switcher.  
- Production‑grade deployment: tested on Raspberry Pi with Apache reverse proxy and SSL.

***

## Tech Stack

**Frontend**

- React 18+ (Vite)  
- JavaScript (JSX), custom CSS  
- React Router v6  
- Axios  
- Custom i18n (Dutch/English)

**Backend**

- Node.js (Express.js)  
- Sequelize ORM (MySQL / MariaDB)  
- JWT + bcrypt authentication  
- Nodemailer (Gmail SMTP)  
- node-cron (recurring rides)  
- ical-generator (.ics calendar files)

**Infrastructure**

- MySQL 8 / MariaDB 11  
- Apache2 reverse proxy (HTTPS with Let’s Encrypt)  
- PM2 process manager  
- Raspberry Pi / Linux server

***

## Repository Structure

```text
versoek/
├── client/                          # React frontend (Vite)
│   ├── public/                      # Static assets, manifest
│   ├── src/
│   │   ├── components/              # Header, Footer, notifications, etc.
│   │   ├── contexts/                # Auth + Language context
│   │   ├── pages/                   # Home, Login, Dashboard, My Rides, Admin, etc.
│   │   ├── translations/            # en.js, nl.js
│   │   ├── utils/                   # api.js, auth helpers
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point
│   ├── index.html
│   └── package.json
│
├── server/                          # Node.js backend (Express)
│   ├── config/                      # database.js (Sequelize)
│   ├── models/                      # User, Ride, RecurringRide, RideRequest, Notification
│   ├── routes/                      # auth, users, rides, recurring-rides, ride-requests, notifications, admin, contact
│   ├── middleware/                  # auth, upload (Multer)
│   ├── services/                    # emailService, recurringRideGenerator
│   ├── uploads/                     # Avatar storage
│   ├── index.js                     # Server entry
│   └── package.json
│
├── docs/                            # Optional extra docs (flows, architecture)
└── README.md
```

***

## Core Functionality

### User Management

- Registration with email, username, password, name, phone.  
- Email verification with time‑limited tokens.  
- Login with JWT, profile management, avatar upload.  
- Roles: user and admin, with protected admin routes.

### Ride & Booking

- Single and recurring rides with origin, destination, date/time, seats, price, notes.  
- Daily cron job that generates upcoming rides from recurring templates.  
- Ride search with filters (origin, destination, date, seats).  
- Request/accept/decline/cancel flows with automatic seat updates and duplicate‑request prevention.

### Communication & Notifications

- Email notifications for new requests, accept/decline, cancellations, and email verification.  
- Calendar invites (.ics) on accepted rides for easy calendar integration.  
- In‑app notifications with unread badge in the UI.  
- Contact form with reCAPTCHA and auto‑reply email.

***

## Database Schema (Overview)

The platform uses a relational schema optimized for corporate carpooling:

- `users` – accounts, roles, profile data, verification status.  
- `rides` – individual rides, linked to drivers and (optionally) recurring templates.  
- `recurring_rides` – templates for generating rides on specific weekdays and date ranges.  
- `ride_requests` – join requests with status (pending, accepted, declined, cancelled).  
- `notifications` – in‑app notifications mapped to users.

You can either let Sequelize create tables or apply the provided SQL schema (see `/docs` or server docs).

***

## Getting Started (Development)

### Prerequisites

- Node.js (LTS)  
- npm  
- MySQL 8 or MariaDB 10+  
- Git

### 1. Clone the repository

```bash
git clone https://github.com/MatthijsPlatje/versoek.git
cd versoek
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env   # create your local config
```

Update `.env` with your own settings:

```text
DB_HOST=localhost
DB_USER=versoek_user
DB_PASSWORD=your_secure_password
DB_NAME=versoek

JWT_SECRET=your_jwt_secret_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@versoek.nl

CLIENT_URL=http://localhost:5173

RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

PORT=5000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev   # or: node index.js
```

### 3. Frontend setup

```bash
cd ../client
npm install
cp .env.example .env
```

Update `.env`:

```text
VITE_API_URL=http://localhost:5000/api
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

Start the frontend (Vite dev server):

```bash
npm run dev
```

The app should now be available at `http://localhost:5173` with the API on `http://localhost:5000`.

***

## Production Deployment (Summary)

Versoek was designed and tested in a self‑hosted environment:

- Raspberry Pi (Debian / Raspberry Pi OS).  
- Apache2 reverse proxy, forwarding HTTPS traffic to the Node.js app.  
- PM2 for managing the Node.js process (start, restart, logs).  
- MySQL/MariaDB on localhost, locked down to 127.0.0.1.  
- Let’s Encrypt certificates with automatic renewal.

You can adapt this to any Linux server or containerized environment (Docker, Kubernetes, etc.) by mapping the same components: reverse proxy, Node backend, static React build, and MySQL/MariaDB.

***

## API Overview

The backend exposes a JSON REST API under `/api`:

- `POST /api/auth/register` – register user  
- `POST /api/auth/login` – login and receive JWT  
- `GET /api/auth/verify-email/:token` – verify email  
- `GET /api/auth/me` – current user

- `GET /api/rides` – search rides  
- `GET /api/rides/:id` – ride details  
- `POST /api/rides` – create ride (auth)  
- `PUT /api/rides/:id` – update ride (driver)  
- `DELETE /api/rides/:id` – cancel ride (driver)  
- `GET /api/rides/my-rides` – all rides as driver/passenger

- `GET /api/recurring-rides` – list user’s recurring templates  
- `POST /api/recurring-rides` – create template  
- `PUT /api/recurring-rides/:id` – update template  
- `DELETE /api/recurring-rides/:id` – delete template

- `POST /api/ride-requests` – request to join ride  
- `GET /api/ride-requests/ride/:rideId` – requests for a ride (driver)  
- `GET /api/ride-requests/my-requests` – own requests  
- `PUT /api/ride-requests/:id/accept` – accept request (driver)  
- `PUT /api/ride-requests/:id/decline` – decline request (driver)  
- `PUT /api/ride-requests/:id/cancel` – cancel (passenger)

- `GET /api/notifications` – list notifications  
- `GET /api/notifications/unread-count` – unread count  
- `PUT /api/notifications/:id/read` – mark as read

- `POST /api/contact` – send contact form (reCAPTCHA)  

- `GET /api/admin/users` – list users (admin)  
- `PUT /api/admin/users/:id/role` – change role (admin)  
- `DELETE /api/admin/users/:id` – delete user (admin)

More detailed API documentation can live under `/docs/api.md` if you wish.

***

## Security Considerations

- JWT authentication and protected routes.  
- Password hashing with bcrypt.  
- Email verification required before full access.  
- Input validation and sanitization via middleware.  
- File upload restrictions (type and size) for avatars.  
- CORS configuration for frontend/backend separation.  
- HTTPS recommended in production (reverse proxy with SSL).

***

## Internationalization

- Dutch (NL) as primary language, English (EN) as secondary.  
- Language switcher in the header.  
- Translations stored in `client/src/translations/en.js` and `nl.js`.  
- Selected language persisted in `localStorage`.

***

## Contributing

Contributions, bug reports, and feature ideas are welcome.

- Fork the repository.  
- Create a feature branch.  
- Commit your changes with clear messages.  
- Open a pull request describing your changes and rationale.

***

## License

License: To be decided; not open source yet

***