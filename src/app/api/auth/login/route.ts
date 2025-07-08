import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, sifre } = await request.json();

    if (!email || !sifre) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const diyetisyen = await prisma.diyetisyen.findUnique({
      where: { email },
      include: {
        abonelik: true,
        _count: {
          select: {
            danisanlar: true,
            menuler: true,
            randevular: true,
            icerikler: true
          }
        }
      }
    });

    if (!diyetisyen) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(sifre, diyetisyen.sifre);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        id: diyetisyen.id, 
        email: diyetisyen.email,
        ad: diyetisyen.ad,
        soyad: diyetisyen.soyad
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Şifreyi response'dan çıkar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sifre: _password, ...diyetisyenData } = diyetisyen;

    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user: diyetisyenData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
