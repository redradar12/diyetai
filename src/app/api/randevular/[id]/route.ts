import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Randevu güncelle
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const { baslik, aciklama, tarih, durum, danisanId } = await request.json();

    if (!baslik || !tarih || !durum) {
      return NextResponse.json({ error: 'Başlık, tarih ve durum gerekli' }, { status: 400 });
    }

    // Randevunun bu diyetisyene ait olup olmadığını kontrol et
    const existingRandevu = await prisma.randevu.findFirst({
      where: {
        id: params.id,
        diyetisyenId: decoded.id,
      },
    });

    if (!existingRandevu) {
      return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 });
    }

    const updatedRandevu = await prisma.randevu.update({
      where: {
        id: params.id,
      },
      data: {
        baslik,
        aciklama,
        tarih: new Date(tarih),
        durum,
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

    return NextResponse.json({ randevu: updatedRandevu, message: 'Randevu başarıyla güncellendi' });
  } catch (error) {
    console.error('Randevu güncelleme hatası:', error);
    return NextResponse.json({ error: 'Randevu güncellenemedi' }, { status: 500 });
  }
}

// Randevu sil
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };

    // Randevunun bu diyetisyene ait olup olmadığını kontrol et
    const existingRandevu = await prisma.randevu.findFirst({
      where: {
        id: params.id,
        diyetisyenId: decoded.id,
      },
    });

    if (!existingRandevu) {
      return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 });
    }

    await prisma.randevu.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Randevu başarıyla silindi' });
  } catch (error) {
    console.error('Randevu silme hatası:', error);
    return NextResponse.json({ error: 'Randevu silinemedi' }, { status: 500 });
  }
}
