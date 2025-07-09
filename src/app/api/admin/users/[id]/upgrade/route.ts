import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Authorization header'ından token al
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    // Request body'den plan bilgisini al
    const body = await request.json();
    const { plan } = body;

    if (!plan) {
      return NextResponse.json({ error: 'Plan bilgisi gerekli' }, { status: 400 });
    }

    // Token'dan kullanıcı bilgilerini al
    const userEmail = request.nextUrl.searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email gerekli' }, { status: 400 });
    }

    // Kullanıcının admin olup olmadığını kontrol et
    const currentUser = await prisma.diyetisyen.findUnique({
      where: { email: userEmail }
    });

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
    }

    // Hedef kullanıcıyı bul
    const targetUser = await prisma.diyetisyen.findUnique({
      where: { id: id }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Abonelik kaydını oluştur veya güncelle
    const abonelik = await prisma.abonelik.upsert({
      where: { diyetisyenId: id },
      update: {
        plan: plan,
        aktif: true,
        bitis: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl sonra
        maksDanisan: plan === 'premium' ? -1 : plan === 'temel' ? 10 : 3,
        maksMenu: plan === 'premium' ? -1 : plan === 'temel' ? 25 : 5
      },
      create: {
        diyetisyenId: id,
        plan: plan,
        aktif: true,
        baslangic: new Date(),
        bitis: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl sonra
        maksDanisan: plan === 'premium' ? -1 : plan === 'temel' ? 10 : 3,
        maksMenu: plan === 'premium' ? -1 : plan === 'temel' ? 25 : 5
      }
    });

    return NextResponse.json({ 
      message: 'Plan başarıyla yükseltildi',
      abonelik: abonelik
    });
  } catch (error) {
    console.error('Plan yükseltme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
