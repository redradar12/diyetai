# DiyetAI - Diyetisyen Paneli Deploy Rehberi

## Gereksinimler Tamamlandı ✅
- ✅ Next.js 15 kurulu
- ✅ Prisma ORM yapılandırılmış
- ✅ API endpoints hazır
- ✅ Package.json build script'i güncellendi
- ✅ Vercel konfigürasyonu eklendi
- ✅ .gitignore düzenlendi

## Sıradaki Adımlar:

### 1. Git ve GitHub Kurulumu
```bash
# Git kurulumu sonrası
git init
git add .
git commit -m "İlk commit: DiyetAI diyetisyen paneli"

# GitHub'da yeni repository oluşturun ve bağlayın
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

### 2. Vercel Deploy
1. https://vercel.com/signup adresinden hesap oluşturun
2. "New Project" butonuna tıklayın
3. GitHub'dan repo'yu seçin
4. Environment Variables ekleyin:
   - `NEXTAUTH_SECRET`: Güçlü bir secret key
   - `NEXTAUTH_URL`: https://your-project.vercel.app
   - `OPENAI_API_KEY`: OpenAI API anahtarınız
   - `DATABASE_URL`: file:./dev.db (geçici)

### 3. Production Veritabanı (Önerilen)
SQLite yerine cloud veritabanı kullanın:
- **Neon**: https://neon.tech (PostgreSQL - Ücretsiz)
- **PlanetScale**: https://planetscale.com (MySQL - Ücretsiz)
- **Supabase**: https://supabase.com (PostgreSQL - Ücretsiz)

### 4. Domain Ayarları
- Vercel otomatik domain: `your-project.vercel.app`
- Özel domain eklemek için: Vercel Dashboard > Settings > Domains

## Önemli Notlar:
- Tüm environment variables'ları Vercel dashboard'dan ekleyin
- Production'da mutlaka cloud veritabanı kullanın
- SSL sertifikası otomatik olarak sağlanır
- Her Git push otomatik deploy tetikler
