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
    
    // Admin kontrolü
    const admin = await prisma.diyetisyen.findUnique({
      where: { id: decoded.id },
      select: { isAdmin: true },
    });

    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    // Tüm kullanıcıları getir
    const users = await prisma.diyetisyen.findMany({
      select: {
        id: true,
        email: true,
        ad: true,
        soyad: true,
        telefon: true,
        uzmanlik: true,
        deneyim: true,
        isAdmin: true,
        abonelik: {
          select: {
            plan: true,
            aktif: true
          }
        },
        olusturmaTarihi: true,
        _count: {
          select: {
            danisanlar: true,
            menuler: true,
            randevular: true,
            icerikler: true,
          },
        },
      },
      orderBy: {
        ad: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        ...user,
        tel: user.telefon,
      })),
    });

  } catch (error) {
    console.error('Kullanıcılar getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    
    // Admin kontrolü
    const admin = await prisma.diyetisyen.findUnique({
      where: { id: decoded.id },
      select: { isAdmin: true },
    });

    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    // Kullanıcıyı sil
    await prisma.diyetisyen.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    
    // Admin kontrolü
    const admin = await prisma.diyetisyen.findUnique({
      where: { id: decoded.id },
      select: { isAdmin: true },
    });

    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const { userId, abonelik } = await request.json();

    if (!userId || !abonelik) {
      return NextResponse.json({ error: 'Kullanıcı ID ve abonelik tipi gerekli' }, { status: 400 });
    }

    // Kullanıcının planını güncelle
    const updatedUser = await prisma.diyetisyen.update({
      where: { id: userId },
      data: { 
        abonelik: {
          upsert: {
            create: {
              plan: abonelik,
              baslangic: new Date(),
              aktif: true,
              maksDanisan: abonelik === 'premium' ? -1 : 3,
              maksMenu: abonelik === 'premium' ? -1 : 5
            },
            update: {
              plan: abonelik,
              maksDanisan: abonelik === 'premium' ? -1 : 3,
              maksMenu: abonelik === 'premium' ? -1 : 5
            }
          }
        }
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
