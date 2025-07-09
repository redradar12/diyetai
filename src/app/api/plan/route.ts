import { NextRequest, NextResponse } from 'next/server';
import { kullaniciPlaniniAl, kullaniciMenuSayisiniAl, kullaniciDanisanSayisiniAl } from '@/lib/abonelik';
import jwt from 'jsonwebtoken';

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
    const diyetisyenId = decoded.id;

    // Plan bilgilerini al
    const planBilgisi = await kullaniciPlaniniAl(diyetisyenId);
    const mevcutMenuSayisi = await kullaniciMenuSayisiniAl(diyetisyenId);
    const mevcutDanisanSayisi = await kullaniciDanisanSayisiniAl(diyetisyenId);

    return NextResponse.json({
      plan: planBilgisi.plan,
      limitler: planBilgisi.limitler,
      kullanim: {
        menu: {
          mevcut: mevcutMenuSayisi,
          limit: planBilgisi.limitler.maksMenu,
          oran: planBilgisi.limitler.maksMenu === -1 ? 0 : (mevcutMenuSayisi / planBilgisi.limitler.maksMenu) * 100
        },
        danisan: {
          mevcut: mevcutDanisanSayisi,
          limit: planBilgisi.limitler.maksDanisan,
          oran: planBilgisi.limitler.maksDanisan === -1 ? 0 : (mevcutDanisanSayisi / planBilgisi.limitler.maksDanisan) * 100
        },
        icerikUreticisi: planBilgisi.limitler.icerikUreticisi
      },
      abonelik: planBilgisi.abonelik ? {
        id: planBilgisi.abonelik.id,
        baslangic: planBilgisi.abonelik.baslangic,
        bitis: planBilgisi.abonelik.bitis,
        aktif: planBilgisi.abonelik.aktif
      } : null
    });

  } catch (error) {
    console.error('Plan bilgisi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Plan bilgisi alınamadı' },
      { status: 500 }
    );
  }
}
