import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { danisanEkleyebilirMi } from '@/lib/abonelik';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface JwtPayload {
  id: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as JwtPayload;
    const diyetisyenId = decoded.id; // userId yerine id kullan

    // Diyetisyenin danışanlarını getir
    const danisanlar = await prisma.danisan.findMany({
      where: {
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
        notlar: true,
        guncellemeTarihi: true,
      },
      orderBy: {
        ad: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      danisanlar: danisanlar
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as JwtPayload;
    const diyetisyenId = decoded.id; // userId yerine id kullan

    // Plan kontrolü - Danışan ekleyebilir mi?
    const danisanDurumu = await danisanEkleyebilirMi(diyetisyenId);
    if (!danisanDurumu.ekleyebilir) {
      return NextResponse.json({ 
        error: `Danışan limiti aşıldı. ${danisanDurumu.limit === -1 ? 'Sınırsız' : danisanDurumu.limit} danışan hakkınız var, şu anda ${danisanDurumu.mevcut} danışanınız bulunmaktadır. Premium plana geçerek sınırsız danışan ekleyebilirsiniz.`,
        planBilgisi: {
          limit: danisanDurumu.limit,
          mevcut: danisanDurumu.mevcut,
          planYukseltGerekli: true
        }
      }, { status: 403 });
    }

    // Request body'yi al
    const body = await request.json();
    const { ad, soyad, email, tel, yas, kilo, boy, hedefKilo, cinsiyet, saglikDurumu, hastaliklari, notlar } = body;

    // Yeni danışan oluştur
    const yeniDanisan = await prisma.danisan.create({
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
        diyetisyenId: diyetisyenId
      }
    });

    return NextResponse.json({
      success: true,
      danisan: {
        id: yeniDanisan.id,
        ad: yeniDanisan.ad,
        soyad: yeniDanisan.soyad,
        email: yeniDanisan.email,
        tel: yeniDanisan.telefon,
        yas: yeniDanisan.yas,
        kilo: yeniDanisan.kilo,
        boy: yeniDanisan.boy,
        hedefKilo: yeniDanisan.hedefKilo,
        cinsiyet: yeniDanisan.cinsiyet,
        saglikDurumu: yeniDanisan.saglikDurumu,
        hastaliklari: yeniDanisan.hastaliklari,
        notlar: yeniDanisan.notlar
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası' 
    }, { status: 500 });
  }
}
