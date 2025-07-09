const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.diyetisyen.findMany({
      include: {
        abonelik: true,
        _count: {
          select: {
            danisanlar: true,
            randevular: true,
            menuler: true
          }
        }
      }
    });
    
    console.log('=== TÜM KAYITLI KULLANICILAR ===');
    console.log('Toplam kullanıcı sayısı:', users.length);
    console.log('');
    
    if (users.length === 0) {
      console.log('❌ Hiç kullanıcı bulunamadı!');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.ad} ${user.soyad}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   📋 Plan: ${user.abonelik?.plan || 'Belirsiz'}`);
        console.log(`   📅 Kayıt: ${user.olusturmaTarihi.toLocaleDateString('tr-TR')}`);
        console.log(`   👥 Danışan: ${user._count.danisanlar}`);
        console.log(`   📅 Randevu: ${user._count.randevular}`);
        console.log(`   📝 Menü: ${user._count.menuler}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log('   ─────────────────────────');
      });
    }
    
  } catch (error) {
    console.error('❌ Veritabanı hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
