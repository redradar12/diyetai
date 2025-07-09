# DiyetAI Projesi Yedekleme ve Geri Dönüş Stratejisi

## 🚀 Mevcut Durum (Güncellenmiş)
- ✅ Proje Vercel'da canlı ve tamamen stabil
- ✅ AI içerik üretimi fallback/retry logic ile güvenli
- ✅ Panel ve authentication sistemi aktif
- ✅ Tüm environment variables doğru yapılandırılmış
- ✅ Database bağlantısı (Neon PostgreSQL) çalışıyor
- ✅ Google Gemini API entegrasyonu overload protection ile güvenli

## 🚨 ACİL - Şu An Yapılması Gerekenler

## 📋 Yedekleme Seviyeleri

### 1. **GIT YEDEKLEME (En Kritik)**

#### Hemen Yapılması Gerekenler:
```bash
# Tüm dosyaları commit'le
git add .
git commit -m "✅ STABLE VERSION - Tüm özellikler çalışıyor ($(date))"

# Stable tag oluştur
git tag -a v1.0-stable -m "Stable working version - $(date)"

# GitHub'a push et
git push origin main
git push origin v1.0-stable

# Branch oluştur (backup için)
git checkout -b backup-stable-$(date +%Y%m%d)
git push origin backup-stable-$(date +%Y%m%d)
```

#### Git Kurulumu (eğer henüz yapılmadıysa):
```bash
# Git repository başlat
git init

# GitHub repository oluştur ve bağla
git remote add origin https://github.com/[username]/diyetai.git

# İlk commit
git add .
git commit -m "Initial stable version"
git push -u origin main
```

### 2. **VERCEL DEPLOYMENT YEDEKLEME**

#### Deployment History:
- Vercel otomatik olarak her deployment'ı saklar
- Dashboard'dan önceki versiyonlara dönebilirsiniz
- URL: https://vercel.com/[team]/[project]/deployments

#### Manuel Vercel Backup:
```bash
# Mevcut konfigürasyonu kaydet
vercel env ls > vercel-env-backup.txt

# Project ayarlarını kaydet
vercel project ls > vercel-projects-backup.txt
```

### 3. **DATABASE YEDEKLEME**

#### Prisma Schema Backup:
```bash
# Schema'yı yedekle
cp prisma/schema.prisma prisma/schema.backup.$(date +%Y%m%d).prisma

# Seed dosyasını yedekle
cp prisma/seed.ts prisma/seed.backup.$(date +%Y%m%d).ts
```

#### Database Export (Production):
```bash
# PostgreSQL dump al
npx prisma db pull --force
cp prisma/migrations prisma/migrations-backup-$(date +%Y%m%d) -r
```

### 4. **ENVIRONMENT VARIABLES YEDEKLEME**

#### Lokal Environment:
```bash
# .env.local dosyasını güvenli yedekle
cp .env.local .env.backup.$(date +%Y%m%d).local
```

#### Vercel Environment:
```bash
# Vercel env'leri pull et
vercel env pull .env.vercel.backup
```

### 5. **TAM PROJE YEDEKLEME**

#### Tam Klasör Kopya:
```bash
# Ana proje klasörünü yedekle
robocopy "e:\AI\deneme" "e:\AI\deneme-backup-$(date +%Y%m%d)" /E /XD node_modules .next .vercel
```

#### ZIP Arşivi:
```bash
# PowerShell ile zip oluştur
Compress-Archive -Path "e:\AI\deneme" -DestinationPath "e:\AI\diyetai-backup-$(Get-Date -Format 'yyyyMMdd').zip" -Force
```

## 🔄 Hızlı Geri Dönüş Senaryoları

### Senaryo 1: Kod Hatası (Son Commit'e Dön)
```bash
# Son commit'e dön
git reset --hard HEAD~1

# Vercel'e redeploy
vercel --prod
```

### Senaryo 2: Stable Version'a Dön
```bash
# Stable tag'e dön
git checkout v1.0-stable

# Yeni branch oluştur
git checkout -b recovery-$(date +%Y%m%d)

# Vercel'e deploy
vercel --prod
```

### Senaryo 3: Tam Proje Geri Yükle
```bash
# Backup klasöründen geri yükle
robocopy "e:\AI\deneme-backup-YYYYMMDD" "e:\AI\deneme-recovery" /E

cd "e:\AI\deneme-recovery"
npm install
vercel link
vercel env pull
vercel --prod
```

### Senaryo 4: Database Geri Yükle
```bash
# Schema'yı geri yükle
cp prisma/schema.backup.YYYYMMDD.prisma prisma/schema.prisma

# Database'i reset et
npx prisma db push --force-reset
npx prisma db seed
```

## 📱 Otomatik Yedekleme Sistemi

### GitHub Actions (.github/workflows/backup.yml):
```yaml
name: Daily Backup
on:
  schedule:
    - cron: '0 2 * * *'  # Her gün saat 02:00
  
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Create backup tag
        run: |
          git tag backup-$(date +%Y%m%d-%H%M%S)
          git push origin --tags
```

### Package.json Scripts:
```json
{
  "scripts": {
    "backup:create": "git add . && git commit -m 'Backup created' && git tag backup-$(date +%Y%m%d)",
    "backup:restore": "git checkout backup-latest",
    "backup:list": "git tag | grep backup",
    "env:backup": "vercel env ls > env-backup-$(date +%Y%m%d).txt"
  }
}
```

## 🎯 Önerilen Günlük Rutinler

### Her Değişiklik Öncesi:
1. `git add . && git commit -m "Backup before changes"`
2. `git tag temp-backup-$(date +%H%M%S)`
3. Değişiklik yap
4. Test et
5. Sorun varsa: `git reset --hard temp-backup-[timestamp]`

### Haftalık Yedekleme:
1. Stable tag oluştur
2. Tam proje zip'i al
3. Environment variables'ı yedekle
4. Database dump al

## 🚨 Acil Durum Kurtarma

### 1. Site Tamamen Çöktü:
```bash
# En son stable version'a dön
git checkout v1.0-stable
vercel --prod
```

### 2. Database Bozuldu:
```bash
# Schema'yı geri yükle
npx prisma db push --force-reset
npx prisma db seed
```

### 3. Environment Variables Kayboldu:
```bash
# Backup'tan geri yükle
vercel env add < env-backup-latest.txt
```

### 4. Vercel Deploy Sorunu:
```bash
# Yeni project oluştur
vercel --force
vercel env pull
vercel --prod
```

## 📞 Acil İletişim Bilgileri

- **Vercel Support**: https://vercel.com/support
- **GitHub Support**: https://support.github.com
- **Proje Sahibi**: [İletişim bilgileri]

## ✅ Kontrol Listesi

- [ ] Git repository kuruldu
- [ ] Stable tag oluşturuldu
- [ ] Vercel env'ler yedeklendi
- [ ] Database schema yedeklendi
- [ ] Tam proje zip'i alındı
- [ ] Geri dönüş senaryoları test edildi
- [ ] Otomatik backup kuruldu

---
**Son Güncelleme**: $(date)
**Stable Version**: v1.0-stable
**Deployment URL**: https://[your-domain].vercel.app
