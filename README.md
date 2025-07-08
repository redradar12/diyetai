# DiyetAI - Diyetisyenler için AI Destekli Platform

Türkiye'deki diyetisyenler için özel olarak geliştirilmiş AI destekli bir platformdur. Danışan yönetiminden menü oluşturmaya, içerik üretiminden randevu sistemine kadar diyetisyenlerin ihtiyaç duyduğu tüm araçları tek platformda sunmaktadır.

## 🚀 Özellikler

### MVP (1. Aşama) Özellikleri
- ✅ **Diyetisyen Paneli** - Modern ve kullanıcı dostu dashboard
- ✅ **Danışan Yönetimi** - Kapsamlı danışan bilgi sistemi
- 🔄 **AI Menü Oluşturucu** - GPT destekli kişiselleştirilmiş menüler
- 🔄 **İçerik Üretici** - Blog ve sosyal medya içerikleri
- 🔄 **Randevu Sistemi** - Takvim ve hatırlatma sistemi
- ✅ **Abonelik Sistemi** - Ücretsiz ve Premium planlar

### Teknik Özellikler
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: SQLite (Prisma ORM)
- **AI Integration**: OpenAI GPT API
- **Authentication**: NextAuth.js
- **UI Components**: Lucide React Icons, Headless UI

## 🛠️ Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
   ```bash
   git clone https://github.com/your-username/diyetai.git
   cd diyetai
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment variables ayarlayın**
   ```bash
   cp .env.local.example .env.local
   ```

   `.env.local` dosyasında şu değişkenleri ayarlayın:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   ```

5. **Test verilerini oluşturun**
   ```bash
   npm run db:seed
   ```

6. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 🧪 Test Hesabı

Platform test edebilmek için hazır bir test hesabı mevcuttur:

**Giriş Bilgileri:**
- **E-posta:** `test@diyetai.com`
- **Şifre:** `123456`

**Test Verileri:**
- 2 danışan (Ayşe Yılmaz, Mehmet Kaya)
- 2 randevu
- 1 menü
- 1 blog yazısı
- Premium plan (30 gün)

Test hesabına erişim: [http://localhost:3000/test](http://localhost:3000/test)

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Diyetisyen paneli
│   ├── giris/            # Giriş sayfası
│   ├── kayit/            # Kayıt sayfası
│   ├── api/              # API routes
│   └── page.tsx          # Ana sayfa
├── components/           # Yeniden kullanılabilir bileşenler
├── lib/                 # Utility fonksiyonları
└── types/               # TypeScript tip tanımları
```

## 🎯 Kullanım

### Diyetisyen Olarak Başlangıç

1. **Kayıt Olun**: Ana sayfadan "Ücretsiz Başlayın" butonuna tıklayın
2. **Profil Oluşturun**: Uzmanlık alanınızı ve deneyiminizi girin
3. **Danışan Ekleyin**: Dashboard'dan yeni danışanları sisteme kaydedin
4. **Menü Oluşturun**: AI destekli menü oluşturucu ile kişiselleştirilmiş menüler hazırlayın
5. **İçerik Üretin**: Blog yazıları ve sosyal medya postları oluşturun

### AI Menü Oluşturucu

```typescript
// Örnek kullanım
const menuTalebi = {
  danisan: "Ayşe Yılmaz",
  yas: 28,
  kilo: 70,
  boy: 165,
  hedef: "kilo verme",
  sure: "1 hafta",
  ozellik: "glutensiz"
};

// AI menü önerisi oluşturulur
const menu = await aiMenuOlustur(menuTalebi);
```

## 🏗️ Geliştirme Planı

### Tamamlanan ✅
- [x] Proje altyapısı (Next.js + TypeScript)
- [x] Veritabanı tasarımı (Prisma)
- [x] Ana sayfa tasarımı
- [x] Kullanıcı kayıt/giriş sayfaları
- [x] Dashboard temel yapısı
- [x] Authentication sistemi (JWT)
- [x] Test kullanıcısı ve veriler

### Geliştirme Aşamasında 🔄
- [ ] OpenAI API entegrasyonu
- [ ] CRUD operasyonları (danışan, menü, randevu)
- [ ] PDF export özelliği
- [ ] E-posta bildirimleri

### Sonraki Aşamalar 📋
- [ ] WhatsApp chatbot entegrasyonu
- [ ] Mobil uygulama (React Native)
- [ ] Raporlama ve analitik
- [ ] Çoklu dil desteği

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Birincil**: Yeşil tonları (#059669, #10b981)
- **İkincil**: Mavi tonları (#3b82f6, #1d4ed8)
- **Destekleyici**: Gri tonları (#6b7280, #374151)

### Tipografi
- **Başlıklar**: Inter, Poppins
- **Gövde metni**: System fonts

## 🔒 Güvenlik

- API anahtarları environment variables'da saklanır
- Input validation ve sanitization
- Rate limiting API endpoints'lerde
- Kullanıcı verileri şifrelenir

## 📊 Abonelik Planları

| Özellik | Ücretsiz | Premium (₺149/ay) | Pro (₺299/ay) |
|---------|----------|-------------------|----------------|
| Danışan Sayısı | 3 | Sınırsız | Sınırsız |
| AI Menü | 5/ay | Sınırsız | Sınırsız |
| İçerik Üretici | - | ✅ | ✅ |
| WhatsApp Entegrasyonu | - | - | ✅ |
| API Erişimi | - | - | ✅ |

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

- **Web**: [diyetai.com](https://diyetai.com)
- **E-posta**: destek@diyetai.com
- **LinkedIn**: [DiyetAI](https://linkedin.com/company/diyetai)

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

---

**DiyetAI** - Türkiye'nin diyetisyenler için özel AI asistan platformu 🇹🇷
