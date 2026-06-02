# Pastly Frontend

React + Vite frontend for Pastly's paste-sharing flow.

## What it does

- Landing page for the product
- Paste creation form with live size stats and limit checks
- Shareable paste route at `/p/:slug`
- Dark and light theme toggle
- Backend integration through the paste API

## Local development

1. Start the backend on `http://localhost:3000`.
2. Start the frontend:

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:3000`.

## Environment

- `VITE_API_BASE_URL` optional override for the API base path

If `VITE_API_BASE_URL` is not set, the app uses `/api`.
