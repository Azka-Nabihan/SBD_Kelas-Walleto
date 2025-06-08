# 💰 Walleto - Financial Tracker

Aplikasi pelacak keuangan yang dapat dijalankan langsung dari Docker Hub.

## 📥 Pull dari Docker Hub

### 1. Pull Images
```bash
# Pull Backend Image
docker pull abshar/sbd_kelas:backend-v1.0

# Pull Frontend Image
docker pull abshar/sbd_kelas:frontend-v1.0

# Verifikasi images berhasil di-pull
docker images | findstr abshar/sbd_kelas
```

### 2. Setup Environment
Buat file `.env`:

### 3. Jalankan Hasil Pull
```bash
# Jalankan Backend
docker run -d \
  --name walleto-backend \
  -p 3001:3000 \
  abshar/sbd_kelas:backend-v1.0

# Jalankan Frontend
docker run -d \
  --name walleto-frontend \
  -p 5173:5173 \
  abshar/sbd_kelas:frontend-v1.0

# Cek status containers
docker ps
```

### 4. Akses Aplikasi
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## 📦 Isi dari Pull
### Backend Image (`abshar/sbd_kelas:backend-v1.0`)
```
Ukuran: ~150-200 MB
Berisi:
├── Node.js 18 Alpine Linux
├── Dependencies:
│   ├── express (^4.18.2)
│   ├── mongoose (^7.5.3)
│   ├── mongodb (^6.1.0)
│   ├── body-parser (^1.20.2)
│   └── dotenv (^16.5.0)
├── Application Code:
│   ├── index.js (server utama)
│   ├── package.json
│   └── src/ (API routes & models)
└── Port: 3000 (internal)
```

### Frontend Image (`abshar/sbd_kelas:frontend-v1.0`)
```
Ukuran: ~200-300 MB
Berisi:
├── Node.js 18 Alpine Linux
├── React Application
├── Vite Development Server
├── Frontend Dependencies
└── Port: 5173 (internal)
```

---
📚 Ready-to-run Docker Images untuk Walleto Financial Tracker