# 🎯 Walleto - Personal Finance Tracker

> Aplikasi pengelola keuangan pribadi untuk membantu mahasiswa dan anak muda mengatur uang bulanan dari orang tua.

![Preview Walleto](/public/walleto-preview.png)

**Walleto** adalah aplikasi web frontend berbasis React + TailwindCSS yang membantu pengguna mencatat transaksi harian, melihat ringkasan keuangan, serta membuat alokasi dana untuk tujuan tertentu (seperti membeli gadget atau liburan).

---

## 🧩 Fitur Utama

- 🔐 **Autentikasi**
  - Register & Login akun
  - Setelah login langsung masuk ke dashboard

- 📊 **Dashboard**
  - Ringkasan keuangan: Balance, Income, Expense
  - Grafik pengeluaran mingguan dan bulanan
  - Form pencatatan transaksi (Income / Expense)

- 💰 **Goals / Allocation System**
  - Tambah goals dengan nama dan target nominal
  - Transfer sebagian balance ke goals
  - Progress bar untuk melacak pencapaian

- 🗂️ **Kategori Transaksi**
  - Kategorisasi income dan expense
  - Filter transaksi berdasarkan kategori

- 📱 **Mobile-Friendly UI**
  - Desain responsif untuk semua ukuran layar
  - Mode gelap (dark mode) tersedia

---

## 🎨 Tema Desain

- **Primary Color**: `#6200EE` (Ungu)
- **Accent Color**: `#03DAC6` (Cyan)
- **Gradient**: `linear-gradient(to right, #6200EE, #03DAC6)`
- **Font**: Inter / Open Sans
- **UI Framework**: TailwindCSS

---

## 🧰 Teknologi yang Digunakan

| Tool/Technology     | Description                         |
|---------------------|-------------------------------------|
| React               | Library UI                          |
| Vite                | Development server & build tool     |
| TailwindCSS         | Utility-first CSS framework         |
| Zustand             | State management                    |
| Recharts            | Visualisasi grafik                  |
| Axios               | HTTP client untuk API calls         |
| React Router        | Navigasi halaman                    |

---

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