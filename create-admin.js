const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Önce admin kullanıcısı var mı kontrol edelim
    const existingAdmin = await prisma.diyetisyen.findFirst({
      where: { email: 'admin@diyetai.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin kullanıcısı zaten mevcut!');
      console.log('Email: admin@diyetai.com');
      console.log('Şifre: admin123');
      return;
    }
    
    // Admin kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.diyetisyen.create({
      data: {
        ad: 'Admin',
        soyad: 'Kullanıcı',
        email: 'admin@diyetai.com',
        sifre: hashedPassword,
        uzmanlik: 'Admin',
        deneyim: 10,
        isAdmin: true
      }
    });
    
    // Premium abonelik oluştur
    await prisma.abonelik.create({
      data: {
        diyetisyenId: admin.id,
        plan: 'premium',
        baslangic: new Date(),
        maksDanisan: -1, // Sınırsız
        maksMenu: -1     // Sınırsız
      }
    });
    
    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('Email: admin@diyetai.com');
    console.log('Şifre: admin123');
    console.log('Plan: premium');
    console.log('ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
