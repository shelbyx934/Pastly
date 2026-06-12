# 🚀 Pastly

<div align="center">
  <p align="center">
    <strong>A high-performance, zero-buffering file transfer and paste-sharing platform.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </p>
</div>

---

## 🌟 Introduction

**Pastly** is a modern MERN stack application designed for lighting-fast text/code pasting and secure, transient peer-to-peer file transfers. 

Unlike typical file-sharing tools that buffer entire uploads to local server disk storage before uploading them to the cloud (creating massive RAM/disk footprints and slowing down transfers), Pastly implements a **direct streaming pipeline**. Files are parsed on the fly by Express using `busboy` and instantly piped straight to the **pCloud API**. The backend acts as a lightweight, stateless conduit with a near-zero memory footprint.

---

## ✨ Features

- **⚡ Fast Code Pastes**: Share formatted code or plain text instantly upto 10MB and simple click-to-copy with a short link.
- **📦 Zero-Disk File Transfers**: Securely transfer files up to 1GB. Uploads stream straight through Node to pCloud without ever touching the server's hard drive.
- **🔄 Real-time Cloud Progress**: Rather than relying on simple browser-side upload calculations, Pastly polls pCloud's actual server-side progress endpoint, providing true, accurate progress states.
- **🛡️ Client-Side CDN Resolution**: File transfers are single-use. The code is verified on first load and redeemed. To bypass pCloud's IP-session locks, the frontend fetches the pCloud public share link returned by the backend, extracts the direct CDN link from the HTML, strips the transient transfer-code prefix, and triggers the download redirect directly from the client.
- **⏳ Automatic Cleanup**: Scheduled background cron tasks run every 7.5 minutes to clean up expired pastes, redeemed transfers, and delete associated cloud storage assets.
- **🎨 Modern UX/UI**: Elegant glassmorphism interface with custom dark/light theme options, file drop zone micro-animations, keyboard shortcuts (`Ctrl + Enter` to upload, `Escape` to cancel), and quick manual/URL download mechanisms.

---

## 📁 Repository Structure

```text
Pastly/
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── controllers/      # Route logic (paste, transfer)
│   │   ├── jobs/             # Scheduled cleanups (expired transfers/pastes)
│   │   ├── models/           # Mongoose Schemas (paste, transfer)
│   │   ├── routes/           # Express Route definitions
│   │   ├── services/         # Business logic (pCloud API integration, streams)
│   │   └── utils/            # Helper generators (slugs, transfer codes)
│   ├── server.js             # Server entrypoint & DB connection
│   └── package.json
├── frontend/                  # React Application
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, DropZone, etc.)
│   │   ├── pages/            # Page layouts (Landing, Send, Receive, NotFound)
│   │   ├── lib/              # Axios request APIs
│   │   ├── router.jsx        # Routing configuration
│   │   ├── index.css         # Styling system & theme custom tokens
│   │   └── main.jsx          # Frontend entrypoint
│   └── package.json
```

---

## 🛠️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally or an Atlas URI
- A **pCloud** account with developer API credentials

### 1. Environment Configuration

#### Backend — `backend/.env`

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/pastly
PCLOUD_AUTH_TOKEN=your_pcloud_developer_auth_token
PASTE_FOLDER_ID=your_pcloud_paste_folder_id
TRANSFER_FOLDER_ID=your_pcloud_transfer_folder_id
FRONTEND_URL=http://localhost:5173
```

> [!TIP]
> Retrieve folder IDs from the URL when viewing target folders in your pCloud web panel.

#### Frontend — `frontend/.env` (production only)

```env
VITE_API_BASE_URL=https://your-backend.railway.app
```

| Variable | Description |
| :--- | :--- |
| `VITE_API_BASE_URL` | The **origin** of your deployed backend (no trailing slash, no `/api`). The frontend automatically appends `/api` to all requests. Leave this unset in local development — Vite's dev-server proxy forwards `/api/*` to `http://localhost:3000` instead. |

> [!IMPORTANT]
> **Do not include `/api` in `VITE_API_BASE_URL`.** The frontend code always appends it automatically:
> ```
> baseURL = VITE_API_BASE_URL + "/api"
> ```
> So setting it to `https://your-backend.railway.app` will correctly produce requests to `https://your-backend.railway.app/api/paste`, `https://your-backend.railway.app/api/transfer`, etc.

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

### 3. Run Locally in Development

Start both the backend server and frontend Vite development server:

```bash
# Start Backend (runs on http://localhost:3000)
npm run dev --prefix backend

# Start Frontend (runs on http://localhost:5173)
npm run dev --prefix frontend
```

> [!NOTE]
> In development, **do not set `VITE_API_BASE_URL`**. Vite's dev proxy (configured in `vite.config.js`) automatically forwards all `/api/*` requests to `http://localhost:3000`, so no extra configuration is needed.

---

## 📡 API Reference

### Paste Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/paste` | Creates a new text paste. Uploads content as a text file to pCloud. |
| `GET` | `/api/paste/:slug` | Retrieves the content of an active text paste. |

### Transfer Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/transfer` | Streams file upload from form data to pCloud. Expects `X-Progress-Hash`. |
| `GET` | `/api/transfer/:code/status` | Lightweight verification check before redeeming. Returns file name & status. |
| `GET` | `/api/transfer/:code` | Redeems the transfer, marks the code as used, and returns the pCloud public share link. |
| `GET` | `/api/transfer/progress/:progressHash` | Proxies upload progress state direct from pCloud's server queue. |

---

## 🔒 Security & Expiration

- **Transient Files**: Once a file transfer is successfully downloaded (redeemed), it is deleted from both pCloud and MongoDB on the next automatic cron cycle (running every 7.5 minutes).
- **Auto Expiration**: All non-downloaded file transfers expire after **10 minutes** to keep cloud space optimized. Pastes will be expired if not opened for 10 days by anyone.
- **Stream Termination**: If an upload is canceled mid-stream by the client, the network pipe closes immediately, stopping pCloud stream consumption and freeing memory buffers.
