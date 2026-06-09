# 🚀 Pastly

Pastly is a modern MERN stack application designed for fast, seamless pasting of text/code and peer-to-peer file transfers. It leverages high-performance streaming to transfer files directly to cloud storage without overloading the server.

---

## ✨ Features

- **Pastes**: Easily share formatted code or plain text with customizable expiration times.
- **File Transfers**: Upload files and share them via an auto-expiring secure link or code.
- **Real-Time Progress**: Interactive upload progress tracked directly from the cloud upload queue.
- **Automatic Cleanup**: Background cron jobs automatically clean up expired pastes and transfers.

---

## 🛠️ Technology Stack

### 💻 Frontend
- **React (Vite)**: A fast, reactive client interface.
- **TailwindCSS**: Sleek, modern styling with clean transitions and animations.
- **State & Routing**: React Router for client-side routing, and native hooks for responsive UI states.

### ⚙️ Backend
- **Node.js & Express**: High-performance REST APIs.
- **MongoDB & Mongoose**: Flexible schema design for storing paste metadata and transfer job states.
- **Stream-based Processing**: Parses file uploads on the fly with **Busboy**, feeding data directly into cloud streams.

---

## ⚡ Core Concepts & Architecture

### 🔄 Stream-Based File Uploads
Instead of downloading files onto the server's disk first (which consumes RAM and storage), Pastly uses **Node.js streams**:
1. Incoming multi-part requests are parsed reactively using `busboy`.
2. As chunks arrive, they are piped directly to the **pCloud API**.
3. This creates a low-memory footprint, allowing the backend to scale effortlessly even with large file uploads.

### ☁️ Background Job Queue
- The backend responds immediately with a `202 Accepted` status and a retrieval code once the stream is established.
- The actual cloud upload finishes in the background. A polling endpoint tracks this background progress using pCloud’s upload progress API.

---

## 🚀 Getting Started

### Environment Variables
Create a `.env` file in the `/backend` directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pastly
PCLOUD_AUTH_TOKEN=your_pcloud_token
PASTE_FOLDER_ID=your_paste_folder_id
TRANSFER_FOLDER_ID=your_transfer_folder_id
FRONTEND_URL=http://localhost:5173
```

### Installation
1. Install dependencies for the entire project:
   ```bash
   npm run build
   ```
2. Start the development environment:
   - Run backend: `npm run dev --prefix backend`
   - Run frontend: `npm run dev --prefix frontend`
