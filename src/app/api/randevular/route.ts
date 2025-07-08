import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Randevuları getir
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    
    const randevular = await prisma.randevu.findMany({
      where: {
        diyetisyenId: decoded.id,
      },
      include: {
        danisan: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
            telefon: true,
          },
        },
      },
      orderBy: {
        tarih: 'desc',
      },
    });

    return NextResponse.json({ randevular });
  } catch (error) {
    console.error('Randevular getirme hatası:', error);
    return NextResponse.json({ error: 'Randevular yüklenemedi' }, { status: 500 });
  }
}

// Yeni randevu ekle
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const { baslik, aciklama, tarih, danisanId } = await request.json();

    if (!baslik || !tarih) {
      return NextResponse.json({ error: 'Başlık ve tarih gerekli' }, { status: 400 });
    }

    const randevu = await prisma.randevu.create({
      data: {
        baslik,
        aciklama,
        tarih: new Date(tarih),
        durum: 'beklemede',
        diyetisyenId: decoded.id,
        danisanId: danisanId || null,
      },
      include: {
        danisan: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
            telefon: true,
          },
        },
      },
    });

    return NextResponse.json({ randevu, message: 'Randevu başarıyla eklendi' });
  } catch (error) {
    console.error('Randevu ekleme hatası:', error);
    return NextResponse.json({ error: 'Randevu eklenemedi' }, { status: 500 });
  }
}
