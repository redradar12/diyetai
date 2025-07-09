import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    
    const user = await prisma.diyetisyen.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        ad: true,
        soyad: true,
        telefon: true,
        uzmanlik: true,
        deneyim: true,
        isAdmin: true,
        abonelik: true,
        _count: {
          select: {
            danisanlar: true,
            menuler: true,
            randevular: true,
            icerikler: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Frontend formatına çevir
    const formattedUser = {
      ...user,
      tel: user.telefon
    };

    return NextResponse.json({
      success: true,
      user: formattedUser,
    });
  } catch (error) {
    console.error('Kullanıcı bilgileri alınırken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
