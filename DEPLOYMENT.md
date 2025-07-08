# Production Database Setup Guide

## Neon (PostgreSQL) - Ücretsiz
1. https://neon.tech/ hesap oluşturun
2. Database oluşturun
3. Connection string'i alın
4. Environment variables'a ekleyin:
   DATABASE_URL="postgresql://username:password@host/database"

## PlanetScale (MySQL) - Ücretsiz plan
1. https://planetscale.com/ hesap oluşturun
2. Database oluşturun
3. Connection string'i alın

## Supabase (PostgreSQL) - Ücretsiz plan
1. https://supabase.com/ hesap oluşturun
2. Proje oluşturun
3. Database connection string'i alın

## Migration Komutları
```bash
# Production veritabanına migrate
npx prisma migrate deploy

# Seed data eklemek için
npx prisma db seed
```
