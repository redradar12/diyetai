import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    console.log('=== GEMINI API TEST BAŞLADI ===');
    
    // API Key kontrolü
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    console.log('API Key var mı:', !!apiKey);
    console.log('API Key ilk 10 karakter:', apiKey?.substring(0, 10));
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_GEMINI_API_KEY bulunamadı',
        details: 'Environment variable eksik'
      });
    }

    // GenAI instance oluştur
    console.log('GenAI instance oluşturuluyor...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Model al - alternatif modeller ile
    console.log('Model alınıyor...');
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      console.log('Model: gemini-1.5-pro');
    } catch {
      try {
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log('Model: gemini-pro (fallback)');
      } catch {
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('Model: gemini-1.5-flash (last resort)');
      }
    }
    
    // Basit test prompt
    const testPrompt = "Merhaba! Bu bir test mesajıdır. 'Test başarılı' yazarak yanıtla.";
    console.log('Test prompt gönderiliyor:', testPrompt);
    
    // API çağrısı
    const startTime = Date.now();
    const result = await model.generateContent(testPrompt);
    const endTime = Date.now();
    
    console.log('API yanıtı alındı, süre:', endTime - startTime, 'ms');
    
    const response = await result.response;
    const text = response.text();
    
    console.log('Yanıt metni:', text);
    
    return NextResponse.json({
      success: true,
      response: text,
      duration: endTime - startTime,
      apiKeyExists: !!apiKey,
      model: "gemini-1.5-flash",
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('=== GEMINI API TEST HATASI ===');
    console.error('Hata:', error);
    
    let errorDetails = {};
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack
      };
      
      // Rate limit kontrolü
      if (error.message.includes('quota') || error.message.includes('rate')) {
        errorDetails = {
          ...errorDetails,
          type: 'RATE_LIMIT',
          description: 'API quota veya rate limit aşıldı'
        };
      }
      
      // Authentication kontrolü
      if (error.message.includes('API key') || error.message.includes('auth')) {
        errorDetails = {
          ...errorDetails,
          type: 'AUTH_ERROR',
          description: 'API key geçersiz veya yetkilendirme hatası'
        };
      }
      
      // Network kontrolü
      if (error.message.includes('network') || error.message.includes('timeout')) {
        errorDetails = {
          ...errorDetails,
          type: 'NETWORK_ERROR',
          description: 'Ağ bağlantısı veya timeout sorunu'
        };
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Gemini API test hatası',
      details: errorDetails,
      apiKeyExists: !!process.env.GOOGLE_GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  }
}
