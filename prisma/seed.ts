import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Test diyetisyeni şifresi
  const hashedPassword = await bcrypt.hash('123456', 12);

  // Admin kullanıcısı oluştur
  const adminUser = await prisma.diyetisyen.upsert({
    where: { email: 'admin@diyetai.com' },
    update: {},
    create: {
      email: 'admin@diyetai.com',
      sifre: hashedPassword,
      ad: 'Admin',
      soyad: 'DiyetAI',
      telefon: '0555 000 00 00',
      uzmanlik: 'Sistem Yöneticisi',
      deneyim: 10,
      isAdmin: true,
      abonelik: {
        create: {
          plan: 'premium',
          baslangic: new Date(),
          bitis: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl sonra
          aktif: true,
          maksDanisan: 999,
          maksMenu: 999
        }
      }
    }
  });

  // Test diyetisyeni oluştur
  const testDiyetisyen = await prisma.diyetisyen.upsert({
    where: { email: 'test@diyetai.com' },
    update: {},
    create: {
      email: 'test@diyetai.com',
      sifre: hashedPassword,
      ad: 'Test',
      soyad: 'Diyetisyen',
      telefon: '0555 123 45 67',
      uzmanlik: 'Klinik Beslenme',
      deneyim: 5,
      abonelik: {
        create: {
          plan: 'premium',
          baslangic: new Date(),
          bitis: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
          aktif: true,
          maksDanisan: 999,
          maksMenu: 999
        }
      }
    }
  });

  // Test danışanları oluştur
  const danisan1 = await prisma.danisan.upsert({
    where: { id: 'test-danisan-1' },
    update: {},
    create: {
      id: 'test-danisan-1',
      ad: 'Ayşe',
      soyad: 'Yılmaz',
      email: 'ayse@example.com',
      telefon: '0555 111 22 33',
      yas: 28,
      kilo: 70.5,
      boy: 165,
      hedefKilo: 60,
      cinsiyet: 'Kadın',
      aktiviteSeviyesi: 'Orta',
      saglikDurumu: 'Sağlıklı',
      hastaliklari: 'Yok',
      alerjiler: 'Gluten intoleransı',
      besinTercihleri: 'Vejeteryan',
      notlar: 'Kilo verme hedefi var',
      diyetisyenId: testDiyetisyen.id
    }
  });

  const danisan2 = await prisma.danisan.upsert({
    where: { id: 'test-danisan-2' },
    update: {},
    create: {
      id: 'test-danisan-2',
      ad: 'Mehmet',
      soyad: 'Kaya',
      email: 'mehmet@example.com',
      telefon: '0555 444 55 66',
      yas: 35,
      kilo: 85.0,
      boy: 178,
      hedefKilo: 75,
      cinsiyet: 'Erkek',
      aktiviteSeviyesi: 'Düşük',
      saglikDurumu: 'Diyabet tip 2',
      hastaliklari: 'Diyabet tip 2',
      alerjiler: 'Yok',
      besinTercihleri: 'Genel',
      notlar: 'Şeker kontrolü önemli',
      diyetisyenId: testDiyetisyen.id
    }
  });

  // Test randevuları oluştur
  await prisma.randevu.create({
    data: {
      baslik: 'İlk Konsültasyon',
      aciklama: 'Başlangıç değerlendirmesi ve hedef belirleme',
      tarih: new Date(Date.now() + 24 * 60 * 60 * 1000), // Yarın
      durum: 'beklemede',
      diyetisyenId: testDiyetisyen.id,
      danisanId: danisan1.id
    }
  });

  await prisma.randevu.create({
    data: {
      baslik: 'Kontrol Randevusu',
      aciklama: 'Aylık kontrol ve menü güncellemesi',
      tarih: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
      durum: 'onaylandi',
      diyetisyenId: testDiyetisyen.id,
      danisanId: danisan2.id
    }
  });

  // Test menüsü oluştur
  await prisma.menu.create({
    data: {
      baslik: 'Kilo Verme Menüsü - 1 Hafta',
      icerik: `
KILO VERME MENÜSÜ - 1 HAFTA

1. GÜNLÜK KALORİ HEDEFİ
Günlük kalori hedefi: 1200-1400 kalori

2. HAFTALIK MENÜ PLANI

PAZARTESI
Kahvaltı: Yumurtalı omlet, tam buğday ekmeği, domates
Öğle: Izgara tavuk, salata, bulgur pilavı
Akşam: Balık, zeytinyağlı sebze, yoğurt

SALI
Kahvaltı: Yulaf lapası, muz, ceviz
Öğle: Mercimek çorbası, salata
Akşam: Et sote, patates, salata

3. ÖNEMLI NOTLAR
• Günde en az 2 litre su içilmeli
• Öğünler arasında 3-4 saat ara verilmeli
      `,
      menuTuru: 'Kilo Verme',
      sure: '1 Hafta',
      kaloriHedefi: 1200,
      ekNotlar: 'Günde en az 2 litre su içilmeli',
      diyetisyenId: testDiyetisyen.id,
      danisanId: danisan1.id
    }
  });

  // Test içeriği oluştur
  await prisma.icerik.create({
    data: {
      baslik: 'Sağlıklı Beslenme İpuçları',
      icerik: 'Sağlıklı beslenmenin temel kuralları: Dengeli beslenme, düzenli öğünler, bol su tüketimi...',
      tur: 'blog',
      durum: 'yayinlandi',
      diyetisyenId: testDiyetisyen.id
    }
  });

  console.log('✅ Test verileri başarıyla oluşturuldu!');
  console.log('');
  console.log('🔑 Giriş Bilgileri:');
  console.log('📧 E-posta: test@diyetai.com');
  console.log('🔒 Şifre: 123456');
  console.log('');
  console.log('👤 Diyetisyen: Test Diyetisyen');
  console.log('📞 Telefon: 0555 123 45 67');
  console.log('💼 Uzmanlık: Klinik Beslenme');
  console.log('⭐ Plan: Premium (30 gün)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
