# Guest QR Code

A simple web app that generates a unique QR code for each visitor and lets an admin scan it at the entrance to register their visit.

## Features

- Each visitor gets a unique 6-character code and QR image
- Visitor codes are persisted in the browser so returning visitors keep the same QR
- Admin page with camera-based QR scanner and manual code entry
- Visit limit cap (default 55) to control capacity
- SQLite database for storage — no external DB setup needed

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** SQLite (via better-sqlite3)
- **QR Generation:** qrcode
- **QR Scanning:** html5-qrcode (loaded via CDN)

## Project Structure

```
├── package.json
├── server/
│   ├── index.js        # Express server and API routes
│   └── db.js           # SQLite setup and queries
└── client/
    ├── index.html      # Visitor page — displays QR code
    ├── validate.html   # Admin page — scan/validate QR codes
    └── style.css       # Shared styles
```

## Setup

```bash
npm install
npm start
```

The server starts on **<http://localhost:3000>**.

## Pages

| Route       | Description                        |
| ----------- | ---------------------------------- |
| `/`         | Visitor page — shows their QR code |
| `/validate` | Admin page — scan or enter codes   |

## API

| Method | Endpoint                       | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| GET    | `/api/qr`                      | Generate or retrieve a visitor QR |
| GET    | `/api/visitors`                | List all visitors                 |
| POST   | `/api/visitors/register-visit` | Mark a visitor as visited         |
