# Sürio — Ehliyet Hazırlık

Türkiye ehliyet (sürücü belgesi) sınavına hazırlık için ücretsiz, statik web
uygulaması. **Ders çalışma** ve **test çözme** bölümleri birbirinden ayrıdır.

🔗 Canlı: [sürio.com](https://xn--srio-0ra.com)

## Özellikler

- **Ders Çalış** — Her konunun özeti, önemli noktalar ve püf noktaları.
- **Test Çöz** — Konu bazlı testler; her sorudan sonra doğru cevap + açıklama.
- **İstatistikler** — Konu bazında en iyi/son skor, deneme sayısı, ortalama başarı.
- İlerleme tarayıcıda (`localStorage`) saklanır; sunucu/hesap gerekmez.
- Mobil uyumlu, hafif, bağımlılıksız (vanilla ES modules).

## Konular

İlk Yardım · Trafik İşaretleri · Motor Bilgisi · Trafik Adabı

## Proje Yapısı

```
index.html              Uygulama kabuğu (sidebar + tab bar)
assets/
  css/main.css          Tasarım sistemi
  js/
    app.js              Route kaydı + başlangıç
    router.js           Hash tabanlı router
    data.js             JSON içerik yükleyici (cache'li)
    store.js            localStorage ilerleme deposu
    ui.js               DOM/format yardımcıları
    views/
      home.js           Ana sayfa (özet + konu kartları)
      study.js          Ders listesi + ders okuyucu
      tests.js          Test listesi
      quiz.js           İnteraktif test motoru
      stats.js          İstatistik tablosu
data/
  subjects.json         Konu kayıt listesi (meta + sayılar)
  subjects/<id>.json    Konu içeriği (lessons + questions)
```

## İçerik Ekleme

Yeni bir konu eklemek için:

1. `data/subjects/<id>.json` dosyasını `lessons` ve `questions` alanlarıyla oluştur.
2. `data/subjects.json` içine meta kaydını ekle (`id`, `title`, `description`,
   `icon`, `color`, `lessonCount`, `questionCount`).

Soru şeması: `{ question, options: [...], answer: <index>, explanation }`.

## Geliştirme

Derleme adımı yok. Statik sunucu yeterli:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

GitHub Pages üzerinde yayınlanır (`CNAME`).
