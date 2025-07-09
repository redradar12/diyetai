import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Environment variables kontrol
    const envCheck = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      GOOGLE_GEMINI_API_KEY: !!process.env.GOOGLE_GEMINI_API_KEY,
      NODE_ENV: process.env.NODE_ENV
    };

    // Database bağlantısı test
    let dbStatus = 'disconnected';
    let userCount = 0;
    let testUserExists = false;

    try {
      await prisma.$connect();
      dbStatus = 'connected';
      
      userCount = await prisma.diyetisyen.count();
      
      const testUser = await prisma.diyetisyen.findUnique({
        where: { email: 'test@diyetai.com' }
      });
      testUserExists = !!testUser;
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      dbStatus = 'error';
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        status: dbStatus,
        userCount,
        testUserExists
      },
      message: 'Health check completed'
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
