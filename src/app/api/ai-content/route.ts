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
    // decoded kullanıldığı için yorum satırına alındı
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

    // AI modeli seç
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // AI'dan yanıt al
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON parse et
    let contentData;
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonText = text.substring(jsonStart, jsonEnd);
        contentData = JSON.parse(jsonText);
      } else {
        throw new Error('JSON bulunamadı');
      }
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      
      // Fallback içerik
      contentData = {
        icerik: text,
        icerik_turu: icerikTuru,
        icerik_turu_tr: icerikTuruMap[icerikTuru] || icerikTuru,
        hedef_kitle: hedefKitle,
        hedef_kitle_tr: hedefKitleMap[hedefKitle] || hedefKitle,
        ton: ton,
        ton_tr: tonMap[ton] || ton,
        hashtaglar: ["#beslenme", "#diyetisyen", "#sağlık", "#DiyetAI"],
        ipuclari: [
          "İçerik düzenli olarak paylaşın",
          "Etkileşim için sorular sorun",
          "Görsellerle destekleyin"
        ],
        okuma_suresi: "1-2 dk",
        ham_metin: true,
        aciklama: "AI tarafından oluşturulan içerik başarıyla alındı ancak JSON formatında parse edilemedi."
      };
    }

    return NextResponse.json({
      success: true,
      content: contentData,
      ai_response: text,
      icerik_turu: icerikTuru,
      generated_at: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('İçerik oluşturma hatası:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    // Fallback içerik
    const body = await request.json();
    const { icerikTuru, hedefKitle, ton } = body;
    
    const icerikTuruMap: { [key: string]: string } = {
      'instagram': 'Instagram Postu',
      'facebook': 'Facebook Postu',
      'twitter': 'X (Twitter) Postu',
      'blog': 'Blog Yazısı',
      'email': 'E-posta Bülteni',
      'story': 'Instagram Story',
      'linkedin': 'LinkedIn Postu'
    };
    
    const fallbackContent = {
      icerik: `Bu ${icerikTuruMap[icerikTuru] || icerikTuru} AI tarafından oluşturulacaktı ancak geçici bir sorun oluştu. Lütfen daha sonra tekrar deneyin.`,
      icerik_turu: icerikTuru,
      icerik_turu_tr: icerikTuruMap[icerikTuru] || icerikTuru,
      hedef_kitle: hedefKitle,
      hedef_kitle_tr: hedefKitle,
      ton: ton,
      ton_tr: ton,
      hashtaglar: ["#beslenme", "#diyetisyen", "#sağlık", "#DiyetAI"],
      ipuclari: [
        "AI sistemi geçici olarak kullanılamıyor",
        "Daha sonra tekrar deneyin",
        "Teknik destek için iletişime geçin"
      ],
      okuma_suresi: "1 dk",
      fallback: true
    };

    return NextResponse.json({
      success: true,
      content: fallbackContent,
      fallback: true,
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'İçerik oluşturma geçici olarak kullanılamıyor'
    });
  }
}
