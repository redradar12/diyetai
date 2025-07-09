import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { varsayilanAbonelikOlustur } from '@/lib/abonelik';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  console.log('Register API endpoint çağrıldı');
  
  try {
    console.log('Request body parse ediliyor...');
    const body = await request.json();
    console.log('Received body:', body);
    const { ad, soyad, email, telefon, sifre } = body;

    // Gerekli alanları kontrol et
    console.log('Validation kontrolleri yapılıyor...');
    if (!ad || !soyad || !email || !sifre) {
      console.log('Eksik alan var:', { ad, soyad, email, sifre: sifre ? 'var' : 'yok' });
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar gereklidir' },
        { status: 400 }
      );
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin' },
        { status: 400 }
      );
    }

    // Şifre uzunluğunu kontrol et
    if (sifre.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Email'in daha önce kullanılıp kullanılmadığını kontrol et
    console.log('Existing user kontrolü yapılıyor...');
    const existingUser = await prisma.diyetisyen.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Email zaten kullanılıyor:', email);
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hash'le
    console.log('Şifre hash\'leniyor...');
    const hashedPassword = await bcrypt.hash(sifre, 12);

    // Yeni kullanıcıyı oluştur
    console.log('Yeni kullanıcı oluşturuluyor...');
    const newUser = await prisma.diyetisyen.create({
      data: {
        ad,
        soyad,
        email,
        telefon: telefon || null,
        sifre: hashedPassword
      }
    });

    console.log('Kullanıcı başarıyla oluşturuldu:', newUser.id);

    // Varsayılan ücretsiz abonelik oluştur
    console.log('Varsayılan abonelik oluşturuluyor...');
    await varsayilanAbonelikOlustur(newUser.id);

    // Şifreyi response'dan çıkar
    const { sifre: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'Hesap başarıyla oluşturuldu',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Hesap oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
