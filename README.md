# 🎬 Slide Motion — Short Video Platform

Slide Motion, TikTok, Instagram Reels ve YouTube Shorts mantığında çalışan; dikey kaydırma (vertical scroll), otomatik video oynatma/durdurma, etkileşim (beğeni, yorum, kaydetme) ve modüler Vanilla JavaScript mimarisine sahip web tabanlı bir kısa video uygulamasıdır. Videolar [Pixabay API](https://pixabay.com/api/docs/) üzerinden gelir.

## 🚀 Öne Çıkan Özellikler

- **📱 Dikey Video Akışı:** Mobil ve masaüstü uyumlu, kaydırılabilir tam ekran video deneyimi; sona yaklaşınca yeni videolar otomatik yüklenir (infinite scroll).
- **⚡ Akıllı Video Yönetimi (Intersection Observer API):** Ekrana giren video otomatik başlar, ekrandan çıkan video duraklatılır.
- **⏭️ Auto Slide:** Video bitince bir sonrakine otomatik geçer; kapatılırsa video döngüde oynar.
- **💬 Yorumlar:**
  - Yorum ekleme ve kendi yorumunu silme.
  - Yorumları beğenme / beğenmeme (tekrar tıklayınca geri alınır).
  - Yorum panelini sürükleyerek büyütüp küçültme.
- **❤️ Sosyal Etkileşimler:** Beğenme, kaydetme ve paylaşma (Web Share API, desteklenmiyorsa linki panoya kopyalar).
- **🔊 Oynatma Kontrolleri:** Ses aç/kapat, tıklayarak oynat/durdur, progress bar'a tıklayarak ileri/geri sarma.
- **💾 Kalıcı Durum (LocalStorage):** Beğeniler, kaydedilen videolar, kendi yorumların, yorum tepkileri ve Auto Slide ayarı sayfa yenilense de saklanır.
- **📦 Sıfır Bağımlılık:** Framework kullanmadan, ES modülleriyle yazılmış Vanilla JS.

> Not: Pixabay yorum metni sağlamadığı için diğer kullanıcıların yorumları her video için sabit (seed'li) olarak üretilen örnek verilerdir.

## 🛠️ Kurulum

1. Repoyu klonla.
2. `environment.example.js` dosyasını `environment.js` adıyla kopyala ve kendi [Pixabay API anahtarını](https://pixabay.com/api/docs/) yaz:
   ```js
   export const url = 'https://pixabay.com/api/videos/?key=YOUR_PIXABAY_API_KEY';
   ```
3. Projeyi bir yerel sunucuyla aç (ES modülleri `file://` üzerinden çalışmaz), örneğin:
   ```bash
   npx serve .
   # veya
   python -m http.server
   ```

> ⚠️ Uygulama tamamen istemci tarafında çalıştığı için API anahtarı tarayıcıda görülebilir. Gerçek bir yayında istekleri küçük bir backend/proxy üzerinden geçirmek gerekir.

## 📁 Klasör Yapısı

```
js/
├── main.js              # Uygulamayı başlatır
├── state.js             # Ortak uygulama durumu
├── handlers.js          # Tıklama, ayar ve hover olayları
├── modules/
│   ├── feed.js          # Sayfa sayfa video yükleme
│   ├── observer.js      # Görünen videoyu oynat / durdur
│   ├── videoPlayer.js   # Oynatma, progress bar, play ikonu
│   ├── ui.js            # Video kartlarının oluşturulması
│   └── comments.js      # Yorum paneli
├── services/
│   ├── api.js           # Pixabay istekleri
│   └── storage.js       # localStorage okuma/yazma
└── utils/
    └── helpers.js       # Zaman formatı, örnek yorumlar
```
