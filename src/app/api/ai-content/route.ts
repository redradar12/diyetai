import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface JwtPayload {
  id: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as JwtPayload;
    console.log('User authenticated:', decoded.id);
    
    // Request body'yi al
    const body = await request.json();
    const { 
      icerikTuru, 
      konu, 
      hedefKitle, 
      ton, 
      uzunluk, 
      ozelNotlar,
      diyetisyenAdi 
    } = body;

    // İçerik türü çevirileri
    const icerikTuruMap: { [key: string]: string } = {
      'instagram': 'Instagram Postu',
      'facebook': 'Facebook Postu',
      'twitter': 'X (Twitter) Postu',
      'blog': 'Blog Yazısı',
      'email': 'E-posta Bülteni',
      'story': 'Instagram Story',
      'linkedin': 'LinkedIn Postu'
    };

    const hedefKitleMap: { [key: string]: string } = {
      'genelKitle': 'Genel Kitle',
      'kadinlar': 'Kadınlar',
      'erkekler': 'Erkekler',
      'gencler': 'Gençler (18-30 yaş)',
      'yaslılar': 'Yaşlılar (50+ yaş)',
      'sporcu': 'Sporcular',
      'hamile': 'Hamile Kadınlar',
      'cocuk': 'Çocuklar ve Aileler'
    };

    const tonMap: { [key: string]: string } = {
      'profesyonel': 'Profesyonel',
      'dostane': 'Dostane',
      'motivasyonel': 'Motivasyonel',
      'eglenceli': 'Eğlenceli',
      'bilimsel': 'Bilimsel',
      'samimi': 'Samimi'
    };

    // Ana prompt oluştur
    const prompt = `
Sen uzman bir diyetisyen ve sosyal medya içerik uzmanısın. "${konu}" konulu ${icerikTuruMap[icerikTuru] || icerikTuru} oluştur.

HEDEF KİTLE: ${hedefKitleMap[hedefKitle] || hedefKitle}
TON: ${tonMap[ton] || ton}  
UZUNLUK: ${uzunluk || 'Optimal uzunluk'}
ÖZEL NOTLAR: ${ozelNotlar || 'Yok'}
DİYETİSYEN: ${diyetisyenAdi}

Standart JSON formatında yanıt ver:

{
  "icerik": "Ana içerik metni burada olacak",
  "icerik_turu": "${icerikTuru}",
  "icerik_turu_tr": "${icerikTuruMap[icerikTuru] || icerikTuru}",
  "hedef_kitle": "${hedefKitle}",
  "hedef_kitle_tr": "${hedefKitleMap[hedefKitle] || hedefKitle}",
  "ton": "${ton}",
  "ton_tr": "${tonMap[ton] || ton}",
  "hashtaglar": ["#beslenme", "#diyetisyen", "#sağlık", "#DiyetAI"],
  "ipuclari": [
    "Paylaşım ipucu 1",
    "Paylaşım ipucu 2",
    "Paylaşım ipucu 3"
  ],
  "okuma_suresi": "1-2 dk"
}

ÖZEL TALİMATLAR:
- Türkiye'deki beslenme kültürünü dikkate al
- ${ton} bir dil kullan
- ${hedefKitleMap[hedefKitle] || hedefKitle} için optimize et
- Emoji kullan ama abartma
- Hashtag'ları konu ile ilgili seç
- Eylem çağrısı ekle
- Bilimsel doğruluğu koru

${icerikTuru === 'instagram' ? '- İnstagram\'a uygun format (maksimum 2200 karakter)' : ''}
${icerikTuru === 'twitter' ? '- Twitter\'a uygun format (maksimum 280 karakter)' : ''}
${icerikTuru === 'blog' ? '- Blog yazısı formatında uzun içerik oluştur' : ''}
${icerikTuru === 'email' ? '- E-posta bülteni formatında profesyonel içerik' : ''}
${icerikTuru === 'story' ? '- Story formatında kısa, etkileşimli içerik' : ''}
${icerikTuru === 'linkedin' ? '- LinkedIn\'e uygun profesyonel içerik' : ''}
`;

    // AI modeli seç - Quota sorunları için fallback
    let model;
    let aiResponse;
    let usedProvider = 'gemini';
    
    try {
      // Önce Gemini'yi dene (farklı modeller ile)
      try {
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      } catch {
        try {
          model = genAI.getGenerativeModel({ model: "gemini-pro" });
        } catch {
          model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        }
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSON parse dene
      try {
        aiResponse = JSON.parse(text);
      } catch {
        // JSON değilse düz metin olarak döndür
        aiResponse = {
          icerik: text,
          icerik_turu: icerikTuru,
          icerik_turu_tr: icerikTuruMap[icerikTuru] || icerikTuru,
          hedef_kitle: hedefKitle,
          hedef_kitle_tr: hedefKitleMap[hedefKitle] || hedefKitle,
          ton: ton,
          ton_tr: tonMap[ton] || ton,
          hashtaglar: ["#beslenme", "#diyetisyen", "#sağlık", "#DiyetAI"],
          ipuclari: ["AI tarafından oluşturuldu"],
          okuma_suresi: "1-2 dk"
        };
      }

    } catch (error: unknown) {
      console.error('Gemini API hatası:', error);
      
      // Quota hatası durumunda fallback
      if (error instanceof Error && 
          (error.message.includes('429') || 
           error.message.includes('quota') || 
           error.message.includes('rate'))) {
        
        usedProvider = 'fallback';
        
        aiResponse = {
          icerik: `🤖 **AI İçerik Sistemi Geçici Olarak Kullanılamıyor**

Bu ${icerikTuruMap[icerikTuru] || icerikTuru} AI tarafından oluşturulacaktı ancak geçici bir sorun oluştu.

📝 **Konu:** ${konu}
👥 **Hedef Kitle:** ${hedefKitleMap[hedefKitle] || hedefKitle}
🎯 **Ton:** ${tonMap[ton] || ton}

⚠️ **Durum:** API quota sınırları aşıldı

💡 **Öneriler:**
• Birkaç dakika sonra tekrar deneyin
• Farklı bir konu ile deneyin
• Manuel içerik oluşturmayı değerlendirin

🔄 **Alternatif:** Bu konuda manuel olarak içerik oluşturabilir veya daha sonra tekrar deneyebilirsiniz.

#beslenme #diyetisyen #sağlık #DiyetAI #tekniksorun`,
          icerik_turu: icerikTuru,
          icerik_turu_tr: icerikTuruMap[icerikTuru] || icerikTuru,
          hedef_kitle: hedefKitle,
          hedef_kitle_tr: hedefKitleMap[hedefKitle] || hedefKitle,
          ton: ton,
          ton_tr: tonMap[ton] || ton,
          hashtaglar: ["#beslenme", "#diyetisyen", "#sağlık", "#DiyetAI", "#tekniksorun"],
          ipuclari: [
            "AI sistemi geçici olarak kullanılamıyor",
            "Birkaç dakika sonra tekrar deneyin",
            "Manuel içerik oluşturmayı değerlendirin"
          ],
          okuma_suresi: "1 dk",
          fallback: true,
          error_type: 'quota_exceeded'
        };
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      content: aiResponse,
      provider: usedProvider,
      icerik_turu: icerikTuru,
      generated_at: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('İçerik oluşturma hatası:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    // Body'yi tekrar parse et (sadece hata durumunda)
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      requestBody = {};
    }
    
    // Genel fallback içerik
    const fallbackContent = {
      icerik: `Bu içerik AI tarafından oluşturulacaktı ancak bir hata oluştu. 

🔧 **Teknik Sorun**
Şu anda AI içerik üretici sistemi kullanılamıyor.

💡 **Öneriler:**
• Sayfayı yenileyin ve tekrar deneyin
• Farklı parametreler ile deneyin
• Manuel içerik oluşturmayı değerlendirin

🎯 **Alternatif:** Bu konuda manuel olarak içerik oluşturabilirsiniz.`,
      icerik_turu: requestBody.icerikTuru || 'unknown',
      icerik_turu_tr: 'Bilinmeyen',
      hedef_kitle: requestBody.hedefKitle || 'unknown',
      hedef_kitle_tr: 'Bilinmeyen',
      ton: requestBody.ton || 'unknown',
      ton_tr: 'Bilinmeyen',
      hashtaglar: ["#beslenme", "#diyetisyen", "#sağlık", "#DiyetAI", "#hata"],
      ipuclari: [
        "Sistem hatası oluştu",
        "Tekrar deneyin",
        "Manuel içerik oluşturmayı değerlendirin"
      ],
      okuma_suresi: "1 dk",
      fallback: true,
      error_type: 'system_error'
    };

    return NextResponse.json({
      success: true,
      content: fallbackContent,
      fallback: true,
      provider: 'fallback',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'İçerik oluşturma geçici olarak kullanılamıyor'
    });
  }
}
