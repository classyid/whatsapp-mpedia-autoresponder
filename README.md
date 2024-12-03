# WhatsApp MPedia Auto-Responder

Sistem auto-responder WhatsApp berbasis Google Apps Script yang terintegrasi dengan MPedia Gateway.

## 🚀 Fitur Utama

- Auto-reply berdasarkan kata kunci
- Mendukung berbagai format respons (teks, gambar, video, dokumen)
- Penyimpanan otomatis pesan ke Google Spreadsheet
- Manajemen respons melalui spreadsheet
- Penyimpanan gambar otomatis ke Google Drive

## 📋 Prerequisite

- Akun MPedia Gateway
- Google Workspace Account
- Google Spreadsheet
- Google Drive folder untuk penyimpanan gambar

## ⚙️ Konfigurasi

1. Buat spreadsheet baru di Google Drive
2. Buat folder untuk menyimpan gambar
3. Salin ID spreadsheet dan folder ke `CONFIG`
4. Deploy script sebagai web app
5. Salin URL webhook ke dashboard MPedia

## 📝 Pengaturan Auto-Response

Atur respons otomatis di sheet "autorespon":

| Keyword | Type | Message | URL |
|---------|------|---------|-----|
| hi | text | Halo! | - |
| price | image | Price List | [url] |

## 🔧 Struktur Kode

- `CONFIG`: Konfigurasi utama sistem
- `FormatMessage`: Formatter pesan respons
- `processMessage`: Handler pesan masuk
- `storeWebhookData`: Penyimpanan data
- `saveImage`: Pengelolaan gambar

## 📚 Dokumentasi API

Response Format:
```json
{
  "text": "Pesan respons",
  "quoted": true/false
}
```

## 🤝 Kontribusi

Silakan berkontribusi melalui Pull Request!
