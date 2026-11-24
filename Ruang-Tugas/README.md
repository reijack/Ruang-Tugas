# Ruang Tugas

Website pribadi pencatat tugas sekolah dan foto catatan, sesuai ide dalam dokumen. Antarmuka berbahasa Indonesia, responsif untuk laptop dan HP.

## Teknologi

- HTML5: `dist/index.html`.
- CSS: `dist/styles.css`.
- Tailwind CSS 3.4.17: `src/tailwind.css`, konfigurasi `tailwind.config.cjs`, hasil kompilasi lokal `dist/tailwind.css`.
- JavaScript murni: `dist/app.js`. JavaScript dipakai untuk interaksi browser; proyek ini tidak memerlukan Java/JDK atau backend Java.
- IndexedDB: penyimpanan tugas, metadata, dan foto berbentuk Blob. Tidak ada login atau database cloud.
- Canvas API: kompresi foto WebP dengan sisi terpanjang maksimum 1600 piksel, kualitas 82% agar tulisan tetap mudah dibaca.
- Service worker: menyimpan aset lokal untuk akses offline setelah kunjungan awal berhasil. Font daring memakai font sistem sebagai fallback.

## Menjalankan tanpa instalasi Node.js

1. Ekstrak ZIP ini.
2. Buka terminal di folder proyek.
3. Jalankan `python -m http.server 8080 --directory dist` (atau `python3` di Linux/macOS).
4. Buka http://localhost:8080 di browser modern.

Gunakan server HTTP/HTTPS, jangan membuka index.html dengan klik dua kali melalui file://. Bisa juga memakai ekstensi Live Server di VS Code dengan folder dist sebagai root. Gunakan alamat/port yang sama pada penggunaan berikutnya: data browser terikat pada origin, termasuk nomor port.

## Mengembangkan CSS

Memerlukan Node.js dan npm:

```sh
npm ci
npm run build
npm run check
node tests/backup.test.cjs
```

Hasil Tailwind sudah disertakan; tidak ada CDN Tailwind yang harus dimuat untuk menjalankan website.

## Fitur yang tersedia

- Dashboard jumlah tugas aktif, deadline hari ini, proses pengerjaan, dan progres mingguan.
- Tambah, lihat detail, edit, hapus, tandai selesai, dan buka kembali tugas.
- Judul, mapel, deadline, catatan, prioritas biasa/penting, tiga status pengerjaan.
- Label Hari ini, Besok, dan Terlewat secara otomatis.
- Pencarian kata kunci, filter mapel, urutan deadline/terbaru/prioritas, tampilan kartu/daftar.
- Unggah beberapa foto melalui pemilih file, drag-and-drop, atau kamera pada HP yang mendukung. Maksimal 12 foto per tugas; input JPG/PNG/WebP hingga 20 MB per foto.
- Kompresi otomatis, ukuran hasil kompresi, pratinjau, hapus foto, dan keterangan per foto.
- Galeri layar penuh, zoom, rotasi, navigasi foto, dan tombol keyboard kiri/kanan.
- Kalender bulanan dengan navigasi bulan, tambah tugas dari tanggal, dan detail tugas dari kalender.
- Koleksi per mata pelajaran dan penambahan mapel sendiri.
- Profil pribadi dan tema terang/gelap.
- Ekspor cadangan JSON mencakup seluruh tugas dan foto. Impor menggabungkan berdasarkan ID tugas dan memperbarui tugas dengan ID sama, tanpa menggandakan data.
- Validasi struktur impor, tanggal, status, referensi foto, dan batas ukuran. Batas impor 50 MB berkas / 40 MB foto / 2.000 tugas.

## Data dan cadangan

Data disimpan hanya di browser/perangkat yang digunakan. Pengguna di perangkat lain memiliki data terpisah. Pengguna yang memakai profil browser yang sama akan melihat data yang sama. Belum ada sinkronisasi otomatis HP–laptop. Gunakan ekspor/impor untuk memindahkan tugas, dan ekspor berkala sebelum menghapus data browser. Mode privat bisa menghapus penyimpanan saat sesi berakhir.

Ruang Tugas dimulai dengan daftar kosong. Saat aplikasi diperbarui, tugas lama yang masih ditandai sebagai contoh beserta fotonya dibersihkan otomatis.

## Struktur

```text
dist/                 Website siap dijalankan / dihosting
  index.html          Struktur halaman dan dialog
  styles.css          Desain dan responsivitas
  tailwind.css        CSS Tailwind hasil kompilasi
  app.js              Logika, IndexedDB, foto, kalender, cadangan
  sw.js               Cache offline
  manifest.webmanifest
  icon.svg, planner.svg, note-*.svg
src/tailwind.css      Input kompilasi Tailwind
tailwind.config.cjs   Konfigurasi Tailwind
package.json          Dependensi dan skrip
package-lock.json     Versi dependensi terkunci
tests/backup.test.cjs Pemeriksaan validasi cadangan
```

## Verifikasi

Diuji melalui browser: tambah dan edit tugas; persistensi setelah reload; pencarian; upload JPEG dan kompresi; caption; lightbox, zoom dan rotasi; status selesai; kalender; ekspor dan impor cadangan dengan foto. Pemeriksaan Node: sintaks JavaScript serta validasi cadangan, tanggal, referensi foto dan 10 kasus input tidak valid.

Untuk hosting statis lain, unggah seluruh isi folder dist. Service worker dan fitur instalasi ke layar utama memerlukan HTTPS atau localhost. Opsi pemasangan ke layar utama bergantung pada browser/perangkat.


## Pembaruan: tambah mapel dan pengingat deadline

- **Mata pelajaran → Tambah mapel**: isikan nama dan warna label. Mapel otomatis tersedia di form tugas dan filter. Nama duplikat (termasuk beda huruf besar/spasi) dicegah. Penambahan dari dua tab disimpan dalam transaksi IndexedDB.
- **Form tugas → + Tambah mapel**: tambahkan mapel tanpa kehilangan isian tugas; mapel baru langsung terpilih.
- **Ikon lonceng**: lihat tugas aktif yang mendekati deadline, beserta tugas terlewat. Klik untuk membuka detail. Tugas selesai otomatis keluar dari pengingat.
- **Pengaturan & cadangan → Notifikasi deadline**: pilih H-1, H-2, H-3, atau H-7 serta jam pengingat (default 07:00 waktu perangkat). Klik Aktifkan notifikasi dan izinkan melalui browser. Tersedia tombol Coba notifikasi setelah izin diberikan.
- Notifikasi perangkat diperiksa setiap menit dan saat kembali ke website, mulai jam pilihanmu. Masing-masing tugas maksimal satu notifikasi per tanggal lokal dan tanggal deadline, termasuk jika beberapa tab terbuka.
- Perhitungan H-N berdasarkan tanggal kalender, karena deadline tugas tidak memiliki jam. Pengingat berlanjut setiap hari dari H-N hingga tugas ditandai selesai.
- **Batasan:** fitur ini memerlukan website tetap terbuka untuk memeriksa jadwal. Tidak ada server push atau alarm yang berjalan ketika seluruh tab/browser ditutup. Browser dapat menunda timer pada tab latar atau perangkat yang tidur; pengingat diperiksa kembali saat website aktif.
- Izin ditolak/tidak didukung: aplikasi menjelaskan langkah berikutnya, dan pengingat di dalam website tetap berfungsi. Izin tidak diminta otomatis.
- Pengaturan pengingat disimpan lokal di perangkat. Cadangan JSON tugas/foto tetap kompatibel dengan versi pertama.

Uji tambahan: `node tests/reminders.test.cjs` (batas tanggal/tahun, leap day, DST, beberapa zona waktu, H-N, tugas selesai/contoh, izin, jam lokal, deduplikasi, kegagalan pengiriman, validasi mapel). Pengujian browser meliputi tambah mapel dari halaman dan dari form tugas, penolakan duplikat, persistensi setelah reload, pusat pengingat, penghapusan tugas selesai dari pengingat, dan penyimpanan pilihan H-N/jam. Tampilan notifikasi sistem tidak dapat diuji langsung di browser pengujian karena izin diblokir; alur pengiriman diuji menggunakan adapter tiruan.

## Pembaruan 1.2: mode gelap dan Salin tugas

- Tombol bulan/matahari di bagian atas website mengganti mode terang/gelap tanpa meninggalkan halaman. Pilihan yang sama tetap tersedia di Pengaturan & cadangan. Tema disimpan dalam profil IndexedDB, dengan salinan preferensi tema di localStorage untuk mencegah kilatan terang saat reload.
- Tema gelap mencakup navigasi, dashboard, kartu, label mapel dan status, kalender, pengaturan, dialog tambah/edit/detail, pengingat, serta panel penyalinan. Foto asli tetap ditampilkan tanpa filter warna.
- **Salin tugas** di detail menyalin judul, catatan, dan deadline, termasuk jam jika diisi.
- **Salin tugas mingguan** di daftar tugas atau **Salin mingguan** di detail menyalin semua tugas dalam rentang 1 sampai 7 hari, diurutkan berdasarkan deadline. Jika clipboard tidak tersedia, teks bisa disalin manual.
