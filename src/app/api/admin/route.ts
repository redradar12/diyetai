import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Admin kontrolü için başlık kontrol edebiliriz
    const adminHeader = request.headers.get('admin');
    
    if (!adminHeader) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Tüm diyetisyenleri getir
    const kullanicilar = await prisma.diyetisyen.findMany({
      select: {
        id: true,
        ad: true,
        soyad: true,
        email: true,
        abonelik: {
          select: {
            plan: true,
            aktif: true
          }
        },
        isAdmin: true,
        olusturmaTarihi: true,
        guncellemeTarihi: true,
        _count: {
          select: {
            danisanlar: true,
            randevular: true
          }
        }
      },
      orderBy: {
        olusturmaTarihi: 'desc'
      }
    });

    console.log('Admin - Kullanıcılar getirildi:', kullanicilar.length);
    return NextResponse.json(kullanicilar);
  } catch (error) {
    console.error('Admin kullanıcı listesi hatası:', error);
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, userId } = await request.json();
    
    // Admin kontrolü
    const adminHeader = request.headers.get('admin');
    
    if (!adminHeader) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (action === 'upgrade') {
      // Kullanıcı planını yükselt
      const updatedUser = await prisma.diyetisyen.update({
        where: { id: userId },
        data: { 
          abonelik: {
            update: {
              plan: 'premium'
            }
          },
          guncellemeTarihi: new Date()
        }
      });
      
      console.log('Admin - Kullanıcı planı yükseltildi:', updatedUser.email);
      return NextResponse.json({ message: 'Plan yükseltildi', user: updatedUser });
    }

    if (action === 'delete') {
      // Kullanıcıyı sil
      await prisma.diyetisyen.delete({
        where: { id: userId }
      });
      
      console.log('Admin - Kullanıcı silindi:', userId);
      return NextResponse.json({ message: 'Kullanıcı silindi' });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error('Admin işlem hatası:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
