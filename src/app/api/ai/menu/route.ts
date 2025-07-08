import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface MenuRequest {
  danisanId: string;
  menuTuru: string;
  sure: string;
  ekNotlar?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    const diyetisyenId = decoded.id; // userId yerine id kullan

    console.log('Decoded token:', decoded);
    console.log('DiyetisyenId:', diyetisyenId);

    if (!diyetisyenId) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    // Request body'yi al
    const body: MenuRequest = await request.json();
    const { danisanId, menuTuru, sure, ekNotlar } = body;

    // Danışan bilgilerini al
    const danisan = await prisma.danisan.findFirst({
      where: {
        id: danisanId,
        diyetisyenId: diyetisyenId
      }
    });

    if (!danisan) {
      return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 });
    }

    // Demo için örnek menü içeriği (gerçek uygulamada OpenAI API kullanılacak)
    const menuIcerigi = `
${menuTuru} MENÜSÜ - ${danisan.ad} ${danisan.soyad}

1. GÜNLÜK KALORİ HEDEFİ
Günlük kalori hedefi: 1500-1700 kalori

2. MAKRO BESIN DAĞILIMI
• Karbonhidrat: %45-50 (170-210g)
• Protein: %20-25 (75-105g) 
• Yağ: %25-30 (40-55g)

3. HAFTALIK MENÜ PLANI

PAZARTESI
Kahvaltı:
• 1 dilim ezine peyniri (30g)
• 1 ince dilim tam buğday ekmeği
• 1/2 adet avokado
• 1 bardak yeşil çay

Ara Öğün 1:
• 1 adet orta boy elma
• 10 adet çiğ badem

Öğle:
• Izgara tavuk göğsü (120g)
• Bulgur pilavı (1 su bardağı)
• Mevsim salatası (sınırsız)
• 1 yemek kaşığı zeytinyağı

Ara Öğün 2:
• 1 bardak ayran
• 3 adet tam buğday kraker

Akşam:
• Izgara somon (100g)
• Haşlanmış brokoli (1 su bardağı)
• Kinoa salatası (1/2 su bardağı)

SALI
Kahvaltı:
• 1 bardak yoğurt
• 1 yemek kaşığı bal
• 1 avuç ceviz
• 1 bardak bitki çayı

Ara Öğün 1:
• 1 adet orta boy armut

Öğle:
• Mercimek çorbası (1 kase)
• Izgara köfte (2 adet)
• Cacık (1 kase)
• Salata

Ara Öğün 2:
• 1 bardak süt
• 2 adet hurma

Akşam:
• Fırında levrek (120g)
• Haşlanmış sebze (karışık)
• 1/2 su bardağı esmer pirinç

4. ALIŞVERİŞ LİSTESİ

Protein Kaynakları:
• Tavuk göğsü
• Somon fileto
• Levrek
• Yumurta
• Ezine peyniri
• Yoğurt
• Süt

Sebze ve Meyveler:
• Avokado
• Elma
• Armut
• Brokoli
• Salata yeşillikleri
• Domates
• Salatalık

Karbonhidrat Kaynakları:
• Tam buğday ekmeği
• Bulgur
• Kinoa
• Esmer pirinç

5. ÖNEMLI NOTLAR VE TAVSİYELER
• Günde en az 2-2.5 litre su tüketin
• Öğünler arasında 3-4 saat ara verin
• Son öğününüzü yatmadan 3 saat önce tamamlayın
• Haftada en az 3 gün 45 dakika yürüyüş yapın
• Menüye uyum sağladıktan sonra kontrol randevunuza gelin

${ekNotlar ? `\nEK NOTLAR: ${ekNotlar}` : ''}

Bu menü ${sure} süreyle uygulanacak şekilde hazırlanmıştır.
`;

    // Menüyü veritabanına kaydet
    const yeniMenu = await prisma.menu.create({
      data: {
        baslik: `${menuTuru} Menüsü - ${danisan.ad} ${danisan.soyad}`,
        icerik: menuIcerigi,
        diyetisyenId: diyetisyenId,
        danisanId: danisanId,
      }
    });

    return NextResponse.json({
      success: true,
      menu: {
        id: yeniMenu.id,
        baslik: yeniMenu.baslik,
        icerik: yeniMenu.icerik,
        olusturmaTarihi: yeniMenu.olusturmaTarihi,
      }
    });

  } catch (error: any) {
    console.error('AI Menü oluşturma hatası:', error);
    return NextResponse.json({ 
      error: 'Menü oluşturulurken bir hata oluştu' 
    }, { status: 500 });
  }
}
