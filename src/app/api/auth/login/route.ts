import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started');
    
    const { email, sifre } = await request.json();
    console.log('Login data received:', { email, passwordProvided: !!sifre });

    if (!email || !sifre) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'E-posta ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Environment kontrolü
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET is missing');
      return NextResponse.json(
        { error: 'Sunucu yapılandırma hatası' },
        { status: 500 }
      );
    }

    // Database bağlantısı test
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Veritabanı bağlantı hatası' },
        { status: 500 }
      );
    }

    // Kullanıcıyı bul
    console.log('Searching for user:', email);
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
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    console.log('User found:', { id: diyetisyen.id, email: diyetisyen.email });

    // Şifreyi kontrol et
    console.log('Checking password...');
    const isPasswordValid = await bcrypt.compare(sifre, diyetisyen.sifre);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    console.log('Password valid, creating JWT token...');

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

    console.log('JWT token created successfully');

    // Şifreyi response'dan çıkar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sifre: _password, ...diyetisyenData } = diyetisyen;

    console.log('Login successful for user:', email);

    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user: diyetisyenData,
      token
    });

  } catch (error) {
    console.error('Login error details:', error);
    
    // Detaylı hata bilgisi (sadece development'ta)
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { message: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }
      : undefined;
    
    return NextResponse.json(
      { 
        error: 'Sunucu hatası',
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
