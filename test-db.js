const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  try {
    console.log('Veritabanı bağlantısı test ediliyor...');
    
    const users = await prisma.diyetisyen.findMany();
    console.log('Tüm kullanıcılar:', users.length, 'adet');
    
    users.forEach(user => {
      console.log(`- ${user.ad} ${user.soyad} (${user.email}) - Admin: ${user.isAdmin}`);
    });

    const adminUsers = await prisma.diyetisyen.findMany({
      where: { isAdmin: true }
    });
    console.log('\nAdmin kullanıcılar:', adminUsers.length, 'adet');
    
    adminUsers.forEach(user => {
      console.log(`- ${user.ad} ${user.soyad} (${user.email})`);
    });

  } catch (error) {
    console.error('Veritabanı hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
