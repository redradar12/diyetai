import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    const diyetisyenId = decoded.id;

    // Request body'yi al
    const body = await request.json();
    const { ad, soyad, email, tel, yas, kilo, boy, hedefKilo, cinsiyet, saglikDurumu, hastaliklari, notlar } = body;

    // Danışanın bu diyetisyene ait olup olmadığını kontrol et
    const mevcutDanisan = await prisma.danisan.findFirst({
      where: {
        id: params.id,
        diyetisyenId: diyetisyenId
      }
    });

    if (!mevcutDanisan) {
      return NextResponse.json({ 
        error: 'Danışan bulunamadı veya bu danışanı güncelleme yetkiniz yok' 
      }, { status: 404 });
    }

    // Danışanı güncelle
    const guncellenenDanisan = await prisma.danisan.update({
      where: {
        id: params.id
      },
      data: {
        ad,
        soyad,
        email: email || null,
        telefon: tel || null,
        yas: yas ? parseInt(yas) : null,
        kilo: kilo ? parseFloat(kilo) : null,
        boy: boy ? parseFloat(boy) : null,
        hedefKilo: hedefKilo ? parseFloat(hedefKilo) : null,
        cinsiyet: cinsiyet || null,
        saglikDurumu: saglikDurumu || null,
        hastaliklari: hastaliklari || null,
        notlar: notlar || null,
        guncellemeTarihi: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      danisan: {
        id: guncellenenDanisan.id,
        ad: guncellenenDanisan.ad,
        soyad: guncellenenDanisan.soyad,
        email: guncellenenDanisan.email,
        tel: guncellenenDanisan.telefon,
        yas: guncellenenDanisan.yas,
        kilo: guncellenenDanisan.kilo,
        boy: guncellenenDanisan.boy,
        hedefKilo: guncellenenDanisan.hedefKilo,
        cinsiyet: guncellenenDanisan.cinsiyet,
        saglikDurumu: guncellenenDanisan.saglikDurumu,
        hastaliklari: guncellenenDanisan.hastaliklari,
        notlar: guncellenenDanisan.notlar,
        createdAt: guncellenenDanisan.kayitTarihi,
        updatedAt: guncellenenDanisan.guncellemeTarihi
      }
    });

  } catch (error: any) {
    console.error('Danışan güncelleme hatası:', error);
    return NextResponse.json({ 
      error: 'Danışan güncellenirken bir hata oluştu' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    const diyetisyenId = decoded.id;

    // Danışanın bu diyetisyene ait olup olmadığını kontrol et
    const mevcutDanisan = await prisma.danisan.findFirst({
      where: {
        id: params.id,
        diyetisyenId: diyetisyenId
      }
    });

    if (!mevcutDanisan) {
      return NextResponse.json({ 
        error: 'Danışan bulunamadı veya bu danışanı silme yetkiniz yok' 
      }, { status: 404 });
    }

    // Danışanı sil
    await prisma.danisan.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ 
      message: 'Danışan başarıyla silindi' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Danışan silme hatası:', error);
    return NextResponse.json({ 
      error: 'Danışan silinirken bir hata oluştu' 
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    const diyetisyenId = decoded.id;

    // Danışanı getir
    const danisan = await prisma.danisan.findFirst({
      where: {
        id: params.id,
        diyetisyenId: diyetisyenId
      },
      select: {
        id: true,
        ad: true,
        soyad: true,
        email: true,
        telefon: true,
        yas: true,
        kilo: true,
        boy: true,
        hedefKilo: true,
        cinsiyet: true,
        saglikDurumu: true,
        hastaliklari: true,
        alerjiler: true,
        besinTercihleri: true,
        notlar: true,
        kayitTarihi: true,
        guncellemeTarihi: true,
      }
    });

    if (!danisan) {
      return NextResponse.json({ 
        error: 'Danışan bulunamadı' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      danisan: {
        id: danisan.id,
        ad: danisan.ad,
        soyad: danisan.soyad,
        email: danisan.email,
        tel: danisan.telefon,
        yas: danisan.yas,
        kilo: danisan.kilo,
        boy: danisan.boy,
        hedefKilo: danisan.hedefKilo,
        cinsiyet: danisan.cinsiyet,
        saglikDurumu: danisan.saglikDurumu,
        hastaliklari: danisan.hastaliklari,
        alerjiler: danisan.alerjiler,
        besinTercihleri: danisan.besinTercihleri,
        notlar: danisan.notlar,
        createdAt: danisan.kayitTarihi,
        updatedAt: danisan.guncellemeTarihi
      }
    });

  } catch (error: any) {
    console.error('Danışan getirme hatası:', error);
    return NextResponse.json({ 
      error: 'Danışan bilgileri alınırken bir hata oluştu' 
    }, { status: 500 });
  }
}
