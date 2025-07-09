# DiyetAI Vercel Deployment - Login Hatası Çözümü

## Sorun
- `test@diyetai.com` ile login yapılamıyor (sunucu hatası)
- Panel sayfası yükleniyor ama sonra giriş sayfasına yönlendiriyor
- Authentication token doğrulama başarısız

## Çözüm Adımları

### 1. Vercel Environment Variables Kontrol
Vercel Dashboard → Project → Settings → Environment Variables:

**ZORUNLU Variables (Mutlaka Ekleyin):**

**1. NEXTAUTH_SECRET**
```
Name: NEXTAUTH_SECRET
Value: diyetai-super-secret-key-2024-production-32-characters-minimum
Environment: Production, Preview, Development
```

**2. DATABASE_URL**
```
Name: DATABASE_URL
Value: postgresql://username:password@hostname:port/database
Environment: Production, Preview, Development
```
*Not: Vercel Postgres kullanıyorsanız otomatik gelir*

**3. GOOGLE_GEMINI_API_KEY**
```
Name: GOOGLE_GEMINI_API_KEY
Value: AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environment: Production, Preview, Development
```

**OPSIYONEL Variables:**

**4. NEXTAUTH_URL**
```
Name: NEXTAUTH_URL
Value: https://diyetai.vercel.app
Environment: Production
```

**5. NODE_ENV**
```
Name: NODE_ENV
Value: production
Environment: Production
```

### Environment Variables Ekleme Adımları:

1. **Vercel Dashboard'a git:** https://vercel.com/dashboard
2. **Projenizi seçin:** diyetai
3. **Settings sekmesine tıklayın**
4. **Environment Variables'a tıklayın**
5. **Add New butonuna tıklayın**
6. **Her bir variable için:**
   - Name: Variable adını girin
   - Value: Variable değerini girin  
   - Environment: Production, Preview, Development (hepsini seçin)
   - Save butonuna tıklayın

### Kritik Notlar:

**NEXTAUTH_SECRET:**
- Minimum 32 karakter olmalı
- Güvenli, rastgele karakterler içermeli
- Örnek: `diyetai-super-secret-key-2024-production-32-characters-minimum`

**DATABASE_URL:**
- Vercel Postgres kullanıyorsanız: Storage → Postgres → Create Database
- Manuel Postgres: `postgresql://user:pass@host:5432/dbname`

**GOOGLE_GEMINI_API_KEY:**
- Google AI Studio'dan alın: https://aistudio.google.com/app/apikey
- API key formatı: `AIzaSy...` ile başlar

### 2. Database Setup (Vercel Postgres)
```bash
# Vercel CLI ile
vercel env pull .env.local
npx prisma generate
npx prisma db push
npx prisma db seed
```

**Veya Vercel Dashboard'dan:**
1. Storage → Create Database → Postgres
2. Database connection string'i kopyala
3. Environment Variables'a DATABASE_URL olarak ekle

### 3. Test User Verification
Database'de test kullanıcısının olduğunu kontrol et:
- Email: `test@diyetai.com`
- Password: `123456` (bcrypt hash'li)

### 4. API Routes Test
Vercel deployment sonrası test et:
```bash
# Login API test
curl -X POST https://diyetai.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@diyetai.com","sifre":"123456"}'

# User API test (token ile)
curl -X GET https://diyetai.vercel.app/api/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Debug Mode
Vercel Function Logs'u kontrol et:
- Vercel Dashboard → Functions → View Logs
- Console hatalarını incele

### 6. Local Test
```bash
npm run dev
# http://localhost:3000/giris adresinde test et
```

## Muhtemel Hatalar ve Çözümleri

### Error: "sunucu hatası"
- **Sebep:** Environment variables eksik
- **Çözüm:** NEXTAUTH_SECRET ve DATABASE_URL ekle

### Error: "Database connection failed"
- **Sebep:** DATABASE_URL yanlış veya database erişilemez
- **Çözüm:** Vercel Postgres setup yap

### Error: "JWT verification failed"
- **Sebep:** NEXTAUTH_SECRET eksik veya yanlış
- **Çözüm:** 32+ karakter secret key kullan

### Error: "User not found"
- **Sebep:** Test kullanıcısı database'de yok
- **Çözüm:** `npx prisma db seed` çalıştır

## Doğru Çalışma Akışı
1. Login form → API call → JWT token al
2. Token localStorage'a kaydet
3. Panel sayfasına yönlendir
4. Panel sayfası → token kontrol → user bilgileri al
5. Token geçerliyse panel göster, değilse giriş'e yönlendir

## Environment Variables Template

`.env.local` dosyası:
```env
DATABASE_URL="postgresql://username:password@hostname:port/database"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"
NEXTAUTH_URL="https://diyetai.vercel.app"
```

## Test Checklist
- [ ] Environment variables eklendi
- [ ] Database bağlantısı çalışıyor
- [ ] Test user database'de var
- [ ] Login API çalışıyor
- [ ] JWT token geçerli
- [ ] User API token ile çalışıyor
- [ ] Panel sayfası authentication geçiyor
- [ ] Plan kontrolü sistemi çalışıyor (ücretsiz: 5 AI menü, 3 danışan)
- [ ] AI içerik üreticisi sadece premium'da erişilebilir
- [ ] Danışan ve AI menü limit kontrolü aktif
