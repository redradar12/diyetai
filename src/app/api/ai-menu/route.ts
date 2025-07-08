import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    // Request body'yi al
    const body = await request.json();
    const { 
      ad, 
      soyad, 
      yas, 
      cinsiyet, 
      boy, 
      kilo, 
      hedefKilo, 
      aktiviteSeviyesi, 
      saglikDurumu, 
      alerjiler, 
      besinTercihleri, 
      menuTuru, 
      gunSayisi 
    } = body;

    // AI modeli seç
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Türkçe prompt oluştur
    const prompt = `
Sen uzman bir diyetisyensin. ${ad} ${soyad} için ${gunSayisi} günlük ${menuTuru} menüsü oluştur.

KİŞİ BİLGİLERİ:
- Yaş: ${yas}, Cinsiyet: ${cinsiyet}
- Boy: ${boy} cm, Kilo: ${kilo} kg, Hedef: ${hedefKilo} kg
- Aktivite: ${aktiviteSeviyesi}
- Sağlık: ${saglikDurumu || 'Normal'}
- Notlar: ${alerjiler || 'Yok'}

SADECE AŞAĞIDAKİ JSON FORMATINDA YANIT VER:

{
  "menu": {
    "baslik": "${ad} ${soyad} için ${gunSayisi} Günlük ${menuTuru} Menüsü",
    "toplam_gun": ${gunSayisi},
    "toplam_kalori_hedefi": "Günlük ortalama 1600 kalori",
    "gunler": [${Array.from({length: parseInt(gunSayisi)}, (_, i) => `
      {
        "gun": ${i + 1},
        "tarih": "${new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}",
        "ogunler": {
          "kahvalti": {
            "yemekler": ["2 dilim tam buğday ekmeği", "1 haşlanmış yumurta", "Domates, salatalık"],
            "tarif": "Yumurtayı haşlayın, sebzelerle servis edin",
            "kalori": 400
          },
          "ara_ogun_1": {
            "yemekler": ["1 orta elma", "10 badem"],
            "tarif": "Taze meyve ile birlikte",
            "kalori": 150
          },
          "ogle": {
            "yemekler": ["150g ızgara tavuk", "1 kase bulgur pilavı", "Yeşil salata"],
            "tarif": "Tavuğu ızgara yapın, bulguru haşlayın",
            "kalori": ${i % 2 === 0 ? '500' : '550'}
          },
          "ara_ogun_2": {
            "yemekler": ["1 kase az yağlı yoğurt"],
            "tarif": "Probiyotik için faydalı",
            "kalori": 100
          },
          "aksam": {
            "yemekler": ["200g fırında balık", "Buharda sebze"],
            "tarif": "Balığı zeytinyağı ile fırınlayın",
            "kalori": ${i % 2 === 0 ? '450' : '500'}
          }
        },
        "gunluk_toplam_kalori": ${i % 2 === 0 ? '1600' : '1700'},
        "besin_degerleri": {
          "protein": "90g",
          "karbonhidrat": "160g",
          "yag": "50g"
        },
        "su_tüketimi": "2.5 litre",
        "oneriler": "Düzenli öğün saatleri"
      }`).join(',')}
    ]
  },
  "genel_oneriler": [
    "Düzenli egzersiz yapın.",
    "Porsiyon kontrolüne dikkat edin.",
    "Şekerli içeceklerden ve işlenmiş gıdalardan kaçının.",
    "Günde 2.5-3 litre su için.",
    "Öğün saatlerinizi düzenli tutun."
  ]
}

Bu JSON formatında ${gunSayisi} günün tamamını ekle. Her güne farklı yemekler koy.`;

    // AI'dan yanıt al
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON parse et
    let menuData;
    try {
      // Önce metindeki JSON kısmını bul
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonText = text.substring(jsonStart, jsonEnd);
        menuData = JSON.parse(jsonText);
      } else {
        throw new Error('JSON bulunamadı');
      }
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      console.log('Ham AI yanıtı:', text);
      
      // Fallback olarak metni düzenleyerek menü oluştur
      menuData = {
        menu: {
          baslik: "AI Menü",
          toplam_gun: gunSayisi,
          toplam_kalori_hedefi: "1500-1600 kalori/gün",
          icerik: text,
          ham_metin: true,
          aciklama: "AI tarafından oluşturulan menü başarıyla alındı ancak JSON formatında parse edilemedi. İçerik aşağıda metin formatında görüntüleniyor."
        },
        genel_oneriler: [
          "Günlük kalori alımınızı takip edin",
          "Düzenli egzersiz yapın",
          "Bol su için",
          "Doktorunuzla görüşmeyi unutmayın"
        ]
      };
    }

    return NextResponse.json({
      success: true,
      menu: menuData,
      ai_response: text
    });

  } catch (error: any) {
    console.error('AI menü oluşturma hatası:', error);
    
    // Fallback mock menü
    const mockMenu = {
      menu: {
        baslik: "Kişiselleştirilmiş Beslenme Menüsü",
        toplam_gun: 7,
        toplam_kalori_hedefi: "1600 kalori/gün",
        gunler: [
          {
            gun: 1,
            tarih: new Date().toISOString().split('T')[0],
            ogunler: {
              kahvalti: {
                yemekler: ["2 dilim tam buğday ekmeği", "1 haşlanmış yumurta", "Domates, salatalık", "1 bardak çay"],
                tarif: "Yumurtayı haşlayın, ekmeğin üzerine sebzeleri ekleyin",
                kalori: 350
              },
              ara_ogun_1: {
                yemekler: ["1 orta boy elma", "10 adet badem"],
                tarif: "Taze meyve ve kuruyemiş",
                kalori: 120
              },
              ogle: {
                yemekler: ["150g tavuk göğsü", "1 porsiyon bulgur pilavı", "Mevsim salatası"],
                tarif: "Tavuğu ızgara yapın, bulguru haşlayın, salata hazırlayın",
                kalori: 500
              },
              ara_ogun_2: {
                yemekler: ["1 bardak yoğurt", "1 tatlı kaşığı bal"],
                tarif: "Yoğurt ile balı karıştırın",
                kalori: 100
              },
              aksam: {
                yemekler: ["200g fırında balık", "Buharda brokoli", "1 dilim ekmek"],
                tarif: "Balığı fırında pişirin, brokoli buharda haşlayın",
                kalori: 450
              }
            },
            gunluk_toplam_kalori: 1520,
            besin_degerleri: {
              protein: "95g",
              karbonhidrat: "160g",
              yag: "45g"
            },
            su_tüketimi: "2.5 litre",
            oneriler: "Düzenli öğün saatleri, yeterli su tüketimi"
          }
        ]
      },
      genel_oneriler: [
        "Günde 2.5-3 litre su için",
        "Öğün saatlerinizi düzenli tutun",
        "Haftada 3-4 kez 30 dakika egzersiz yapın",
        "Tuz tüketimini azaltın"
      ]
    };

    return NextResponse.json({
      success: true,
      menu: mockMenu,
      fallback: true,
      error: process.env.NODE_ENV === 'development' ? error.message : 'AI menü oluşturma geçici olarak kullanılamıyor'
    });
  }
}
