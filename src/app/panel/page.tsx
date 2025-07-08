'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Users, FileText, PlusCircle, Edit3, Eye, LogOut } from 'lucide-react';

interface User {
  id: string;
  email: string;
  ad: string;
  soyad: string;
  tel?: string;
  uzmanlik?: string;
  deneyim?: number;
}

interface Danisan {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  tel?: string;
  yas?: number;
  cinsiyet?: string;
  boy?: number;
  kilo?: number;
  hedefKilo?: number;
  saglikDurumu?: string;
  hastaliklari?: string;
  notlar?: string;
  guncellemeTarihi: string;
}

interface Randevu {
  id: string;
  baslik: string;
  aciklama?: string;
  tarih: string;
  durum: string;
  danisan?: {
    id: string;
    ad: string;
    soyad: string;
    email: string;
    telefon?: string;
  };
  olusturmaTarihi: string;
}

export default function PanelPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [danisanlar, setDanisanlar] = useState<Danisan[]>([]);
  const [activeTab, setActiveTab] = useState('genel');
  const [showNewDanisanModal, setShowNewDanisanModal] = useState(false);
  const [showDanisanDetailModal, setShowDanisanDetailModal] = useState(false);
  const [showEditDanisanModal, setShowEditDanisanModal] = useState(false);
  const [selectedDanisan, setSelectedDanisan] = useState<Danisan | null>(null);
  const [aiMenuForm, setAiMenuForm] = useState({
    danisanId: '',
    menuTuru: '',
    gunSayisi: '',
    aktiviteSeviyesi: '',
    ozelNotlar: ''
  });
  const [aiMenuLoading, setAiMenuLoading] = useState(false);
  const [generatedMenu, setGeneratedMenu] = useState<null | {
    menu?: {
      baslik?: string;
      toplam_gun?: number;
      toplam_kalori_hedefi?: string;
      ham_metin?: string;
      icerik?: string;
      aciklama?: string;
      gunler?: Array<{
        gun: number;
        tarih: string;
        gunluk_toplam_kalori: string;
        su_tüketimi?: string;
        besin_degerleri?: {
          protein?: string;
          karbonhidrat?: string;
          yag?: string;
        };
        ogunler?: {
          kahvalti?: { kalori: string; yemekler: string[]; tarif: string };
          ogle?: { kalori: string; yemekler: string[]; tarif: string };
          aksam?: { kalori: string; yemekler: string[]; tarif: string };
          ara_ogun_1?: { kalori: string; yemekler: string[]; tarif: string };
          ara_ogun_2?: { kalori: string; yemekler: string[]; tarif: string };
        };
      }>;
    };
    genel_oneriler?: string[];
  }>(null);
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [aiContentForm, setAiContentForm] = useState({
    icerikTuru: '',
    konu: '',
    hedefKitle: '',
    ton: '',
    uzunluk: '',
    ozelNotlar: ''
  });
  const [aiContentLoading, setAiContentLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<null | {
    icerik?: string;
    hashtaglar?: string[];
    ipuclari?: string[];
    karakter_sayisi?: number;
    kelime_sayisi?: number;
    okuma_suresi?: string;
    icerik_turu?: string;
    icerik_turu_tr?: string;
    hedef_kitle_tr?: string;
    ton_tr?: string;
  }>(null);
  const [randevular, setRandevular] = useState<Randevu[]>([]);
  const [showNewRandevuModal, setShowNewRandevuModal] = useState(false);
  const [showEditRandevuModal, setShowEditRandevuModal] = useState(false);
  const [selectedRandevu, setSelectedRandevu] = useState<Randevu | null>(null);
  const [newRandevu, setNewRandevu] = useState({
    baslik: '',
    aciklama: '',
    tarih: '',
    saat: '',
    danisanId: ''
  });
  const [editRandevu, setEditRandevu] = useState({
    baslik: '',
    aciklama: '',
    tarih: '',
    saat: '',
    durum: '',
    danisanId: ''
  });
  const [newDanisan, setNewDanisan] = useState({
    ad: '',
    soyad: '',
    email: '',
    tel: '',
    yas: '',
    cinsiyet: '',
    boy: '',
    kilo: '',
    hedefKilo: '',
    saglikDurumu: '',
    hastaliklari: '',
    notlar: ''
  });
  const [editDanisan, setEditDanisan] = useState({
    ad: '',
    soyad: '',
    email: '',
    tel: '',
    yas: '',
    cinsiyet: '',
    boy: '',
    kilo: '',
    hedefKilo: '',
    saglikDurumu: '',
    hastaliklari: '',
    notlar: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchDanisanlar();
    fetchRandevular();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/giris';
        return;
      }

      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        window.location.href = '/giris';
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
      window.location.href = '/giris';
    } finally {
      setLoading(false);
    }
  };

  const fetchDanisanlar = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/danisanlar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Backend'den gelen veriyi frontend format'ına çevir
        const formattedDanisanlar = data.danisanlar.map((danisan: {
          id: string;
          ad: string;
          soyad: string;
          email: string;
          telefon: string;
          yas?: number;
          cinsiyet?: string;
          boy?: number;
          kilo?: number;
          hedefKilo?: number;
          saglikDurumu?: string;
          hastaliklari?: string;
          notlar?: string;
          guncellemeTarihi: string;
        }) => ({
          ...danisan,
          tel: danisan.telefon, // Backend'de telefon, frontend'de tel
          guncellemeTarihi: danisan.guncellemeTarihi
        }));
        setDanisanlar(formattedDanisanlar);
      }
    } catch (error) {
      console.error('Danışanlar yüklenirken hata:', error);
    }
  };

  const fetchRandevular = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/randevular', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Randevular verisi:', data); // Debug için
        setRandevular(data.randevular || []);
      } else {
        console.error('Randevular yüklenemedi:', response.status);
      }
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
    }
  };

  const handleNewDanisanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/danisanlar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDanisan)
      });

      if (response.ok) {
        setShowNewDanisanModal(false);
        setNewDanisan({
          ad: '',
          soyad: '',
          email: '',
          tel: '',
          yas: '',
          cinsiyet: '',
          boy: '',
          kilo: '',
          hedefKilo: '',
          saglikDurumu: '',
          hastaliklari: '',
          notlar: ''
        });
        fetchDanisanlar();
        alert('Danışan başarıyla eklendi!');
      } else {
        alert('Danışan eklenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Danışan eklenirken hata:', error);
      alert('Danışan eklenirken hata oluştu!');
    }
  };

  const handleEditDanisanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDanisan) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/danisanlar/${selectedDanisan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editDanisan)
      });

      if (response.ok) {
        setShowEditDanisanModal(false);
        setSelectedDanisan(null);
        fetchDanisanlar();
        alert('Danışan bilgileri başarıyla güncellendi!');
      } else {
        alert('Danışan güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Danışan güncellenirken hata:', error);
      alert('Danışan güncellenirken hata oluştu!');
    }
  };

  const handleDeleteDanisan = async (danisanId: string) => {
    if (!confirm('Bu danışanı silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/danisanlar/${danisanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDanisanlar();
        alert('Danışan başarıyla silindi!');
      } else {
        alert('Danışan silinirken hata oluştu!');
      }
    } catch (error) {
      console.error('Danışan silinirken hata:', error);
      alert('Danışan silinirken hata oluştu!');
    }
  };

  const openDanisanDetail = (danisan: Danisan) => {
    setSelectedDanisan(danisan);
    setShowDanisanDetailModal(true);
  };

  const openEditDanisan = (danisan: Danisan) => {
    setSelectedDanisan(danisan);
    setEditDanisan({
      ad: danisan.ad,
      soyad: danisan.soyad,
      email: danisan.email,
      tel: danisan.tel || '',
      yas: danisan.yas?.toString() || '',
      cinsiyet: danisan.cinsiyet || '',
      boy: danisan.boy?.toString() || '',
      kilo: danisan.kilo?.toString() || '',
      hedefKilo: danisan.hedefKilo?.toString() || '',
      saglikDurumu: danisan.saglikDurumu || '',
      hastaliklari: danisan.hastaliklari || '',
      notlar: danisan.notlar || ''
    });
    setShowEditDanisanModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/giris';
  };

  const handleAiMenuSubmit = async () => {
    if (!aiMenuForm.danisanId || !aiMenuForm.menuTuru || !aiMenuForm.gunSayisi || !aiMenuForm.aktiviteSeviyesi) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    setAiMenuLoading(true);
    try {
      const token = localStorage.getItem('token');
      const selectedDanisan = danisanlar.find(d => d.id === aiMenuForm.danisanId);
      
      if (!selectedDanisan) {
        alert('Danışan bulunamadı!');
        return;
      }

      const response = await fetch('/api/ai-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ad: selectedDanisan.ad,
          soyad: selectedDanisan.soyad,
          yas: selectedDanisan.yas,
          cinsiyet: selectedDanisan.cinsiyet,
          boy: selectedDanisan.boy,
          kilo: selectedDanisan.kilo,
          hedefKilo: selectedDanisan.hedefKilo,
          aktiviteSeviyesi: aiMenuForm.aktiviteSeviyesi,
          saglikDurumu: selectedDanisan.saglikDurumu,
          alerjiler: aiMenuForm.ozelNotlar,
          besinTercihleri: aiMenuForm.ozelNotlar,
          menuTuru: aiMenuForm.menuTuru,
          gunSayisi: parseInt(aiMenuForm.gunSayisi)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedMenu(data.menu);
        alert('AI menü başarıyla oluşturuldu!');
        // Form temizle
        setAiMenuForm({
          danisanId: '',
          menuTuru: '',
          gunSayisi: '',
          aktiviteSeviyesi: '',
          ozelNotlar: ''
        });
      } else {
        alert('AI menü oluşturulurken hata oluştu!');
      }
    } catch (error) {
      console.error('AI menü hatası:', error);
      alert('AI menü oluşturulurken hata oluştu!');
    } finally {
      setAiMenuLoading(false);
    }
  };

  const handlePrintMenu = () => {
    if (!generatedMenu) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = `
      <html>
        <head>
          <title>${generatedMenu.menu?.baslik || 'AI Menü'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .day { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; }
            .meal { margin: 10px 0; padding: 8px; background: #f5f5f5; }
            .calories { font-weight: bold; color: #333; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${generatedMenu.menu?.baslik || 'AI Menü'}</h1>
            <p>${generatedMenu.menu?.toplam_kalori_hedefi || ''}</p>
          </div>
          ${generatedMenu.menu?.gunler?.map((gun: {
            gun: number;
            tarih: string;
            gunluk_toplam_kalori: string;
            su_tüketimi?: string;
            besin_degerleri?: {
              protein?: string;
              karbonhidrat?: string;
              yag?: string;
            };
            ogunler?: {
              kahvalti?: { kalori: string; yemekler: string[]; tarif: string };
              ogle?: { kalori: string; yemekler: string[]; tarif: string };
              aksam?: { kalori: string; yemekler: string[]; tarif: string };
              ara_ogun_1?: { kalori: string; yemekler: string[]; tarif: string };
              ara_ogun_2?: { kalori: string; yemekler: string[]; tarif: string };
            };
          }) => `
            <div class="day">
              <h3>${gun.gun}. Gün (${new Date(gun.tarih).toLocaleDateString('tr-TR')}) - ${gun.gunluk_toplam_kalori} kalori</h3>
              ${gun.ogunler?.kahvalti ? `<div class="meal"><strong>Kahvaltı (${gun.ogunler.kahvalti.kalori} kcal):</strong><br>${gun.ogunler.kahvalti.yemekler?.join(', ')}<br><em>${gun.ogunler.kahvalti.tarif}</em></div>` : ''}
              ${gun.ogunler?.ogle ? `<div class="meal"><strong>Öğle (${gun.ogunler.ogle.kalori} kcal):</strong><br>${gun.ogunler.ogle.yemekler?.join(', ')}<br><em>${gun.ogunler.ogle.tarif}</em></div>` : ''}
              ${gun.ogunler?.aksam ? `<div class="meal"><strong>Akşam (${gun.ogunler.aksam.kalori} kcal):</strong><br>${gun.ogunler.aksam.yemekler?.join(', ')}<br><em>${gun.ogunler.aksam.tarif}</em></div>` : ''}
            </div>
          `).join('') || ''}
          ${generatedMenu.genel_oneriler ? `
            <div style="margin-top: 30px;">
              <h3>Genel Öneriler</h3>
              <ul>
                ${generatedMenu.genel_oneriler.map((oneri: string) => `<li>${oneri}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShareMenu = () => {
    if (!generatedMenu) return;
    
    const shareText = `${generatedMenu.menu?.baslik || 'AI Menü'}\n\n${generatedMenu.menu?.toplam_kalori_hedefi || ''}\n\nDiyetAI ile oluşturuldu.`;
    
    if (navigator.share) {
      navigator.share({
        title: generatedMenu.menu?.baslik || 'AI Menü',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Menü bilgileri panoya kopyalandı!');
      });
    }
  };

  const clearAiMenuForm = () => {
    setAiMenuForm({
      danisanId: '',
      menuTuru: '',
      gunSayisi: '',
      aktiviteSeviyesi: '',
      ozelNotlar: ''
    });
    setGeneratedMenu(null);
    setShowFullMenu(false);
  };

  const handleAiContentSubmit = async () => {
    if (!aiContentForm.icerikTuru || !aiContentForm.konu || !aiContentForm.hedefKitle || !aiContentForm.ton) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    setAiContentLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...aiContentForm,
          diyetisyenAdi: user ? `${user.ad} ${user.soyad}` : 'Diyetisyen'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
        alert('AI içerik başarıyla oluşturuldu!');
      } else {
        alert('İçerik oluşturulurken hata oluştu!');
      }
    } catch (error) {
      console.error('AI içerik hatası:', error);
      alert('İçerik oluşturulurken hata oluştu!');
    } finally {
      setAiContentLoading(false);
    }
  };

  const clearAiContentForm = () => {
    setAiContentForm({
      icerikTuru: '',
      konu: '',
      hedefKitle: '',
      ton: '',
      uzunluk: '',
      ozelNotlar: ''
    });
    setGeneratedContent(null);
  };

  const copyContentToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('İçerik panoya kopyalandı!');
    });
  };

  const handleNewRandevuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const randevuData = {
        baslik: newRandevu.baslik,
        aciklama: newRandevu.aciklama,
        tarih: `${newRandevu.tarih}T${newRandevu.saat}:00`,
        danisanId: newRandevu.danisanId || null
      };

      console.log('Randevu verisi:', randevuData); // Debug için

      const response = await fetch('/api/randevular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(randevuData)
      });

      const data = await response.json();
      console.log('API yanıtı:', data); // Debug için

      if (response.ok) {
        setShowNewRandevuModal(false);
        setNewRandevu({
          baslik: '',
          aciklama: '',
          tarih: '',
          saat: '',
          danisanId: ''
        });
        fetchRandevular();
        alert('Randevu başarıyla eklendi!');
      } else {
        console.error('API hatası:', data);
        alert(`Randevu eklenirken hata oluştu: ${data.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Randevu eklenirken hata:', error);
      alert('Randevu eklenirken hata oluştu! Konsolu kontrol edin.');
    }
  };

  const handleEditRandevuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRandevu) return;

    try {
      const token = localStorage.getItem('token');
      const randevuData = {
        baslik: editRandevu.baslik,
        aciklama: editRandevu.aciklama,
        tarih: `${editRandevu.tarih}T${editRandevu.saat}:00`,
        durum: editRandevu.durum,
        danisanId: editRandevu.danisanId || null
      };

      const response = await fetch(`/api/randevular/${selectedRandevu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(randevuData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowEditRandevuModal(false);
        setSelectedRandevu(null);
        fetchRandevular();
        alert('Randevu başarıyla güncellendi!');
      } else {
        console.error('API hatası:', data);
        alert(`Randevu güncellenirken hata oluştu: ${data.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Randevu güncellenirken hata:', error);
      alert('Randevu güncellenirken hata oluştu!');
    }
  };

  const handleDeleteRandevu = async (randevuId: string) => {
    if (!confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/randevular/${randevuId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchRandevular();
        alert('Randevu başarıyla silindi!');
      } else {
        alert('Randevu silinirken hata oluştu!');
      }
    } catch (error) {
      console.error('Randevu silinirken hata:', error);
      alert('Randevu silinirken hata oluştu!');
    }
  };

  const openEditRandevu = (randevu: Randevu) => {
    setSelectedRandevu(randevu);
    const tarihSaat = new Date(randevu.tarih);
    const tarih = tarihSaat.toISOString().split('T')[0];
    const saat = tarihSaat.toTimeString().split(':').slice(0, 2).join(':');
    
    setEditRandevu({
      baslik: randevu.baslik,
      aciklama: randevu.aciklama || '',
      tarih: tarih,
      saat: saat,
      durum: randevu.durum,
      danisanId: randevu.danisan?.id || ''
    });
    setShowEditRandevuModal(true);
  };

  const getRandevuDurumBadge = (durum: string) => {
    switch (durum) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'onaylandi':
        return 'bg-green-100 text-green-800';
      case 'tamamlandi':
        return 'bg-blue-100 text-blue-800';
      case 'iptal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRandevuDurumText = (durum: string) => {
    switch (durum) {
      case 'beklemede':
        return 'Beklemede';
      case 'onaylandi':
        return 'Onaylandı';
      case 'tamamlandi':
        return 'Tamamlandı';
      case 'iptal':
        return 'İptal';
      default:
        return 'Beklemede';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DiyetAI Panel</h1>
              <p className="text-gray-600">
                Hoş geldiniz, {user?.ad} {user?.soyad}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('genel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'genel'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4" />
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('danisanlar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'danisanlar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4" />
              Danışanlar
            </button>
            <button
              onClick={() => setActiveTab('ai-menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'ai-menu'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              AI Menü
            </button>
            <button
              onClick={() => setActiveTab('ai-content')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'ai-content'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              İçerik Üretici
            </button>
            <button
              onClick={() => setActiveTab('randevular')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'randevular'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Randevular
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'genel' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Danışan</p>
                    <p className="text-2xl font-bold text-gray-900">{danisanlar.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bu Ay Randevu</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {randevular.filter(r => {
                        const today = new Date();
                        const thisMonth = today.getMonth();
                        const thisYear = today.getFullYear();
                        const randevuDate = new Date(r.tarih);
                        return randevuDate.getMonth() === thisMonth && randevuDate.getFullYear() === thisYear;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">AI Menü</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <User className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktif Danışan</p>
                    <p className="text-2xl font-bold text-gray-900">{danisanlar.filter(d => d.hedefKilo).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Son Eklenen Danışanlar</h3>
              <div className="space-y-3">
                {danisanlar.slice(0, 5).map((danisan) => (
                  <div key={danisan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{danisan.ad} {danisan.soyad}</p>
                      <p className="text-sm text-gray-600">{danisan.email}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(danisan.guncellemeTarihi).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'danisanlar' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Danışanlar</h2>
              <button
                onClick={() => setShowNewDanisanModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Yeni Danışan
              </button>
            </div>

            {/* Danışanlar Tablosu */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ad Soyad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bilgiler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {danisanlar.map((danisan) => (
                    <tr key={danisan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {danisan.ad} {danisan.soyad}
                          </div>
                          <div className="text-sm text-gray-500">
                            {danisan.cinsiyet} • {danisan.yas ? `${danisan.yas} yaş` : 'Belirtilmemiş'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{danisan.email}</div>
                        <div className="text-sm text-gray-500">{danisan.tel}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {danisan.kilo ? `${danisan.kilo} kg` : 'Belirtilmemiş'}
                          {danisan.hedefKilo && ` → ${danisan.hedefKilo} kg`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {danisan.boy ? `${danisan.boy} cm` : 'Boy belirtilmemiş'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(danisan.guncellemeTarihi).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openDanisanDetail(danisan)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Detay Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditDanisan(danisan)}
                            className="text-green-600 hover:text-green-900"
                            title="Düzenle"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDanisan(danisan.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ai-menu' && (
          <div className="space-y-6">
            {/* AI Menü Oluşturucu */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">AI Menü Oluşturucu</h2>
              <p className="text-gray-600 mb-6">
                Danışanınız için AI destekli kişiselleştirilmiş diyet menüsü oluşturun.
              </p>
              
              {/* Menü Oluşturma Formu */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Yeni Menü Oluştur</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danışan Seçin
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={aiMenuForm.danisanId}
                      onChange={(e) => setAiMenuForm({...aiMenuForm, danisanId: e.target.value})}
                    >
                      <option value="">Danışan seçiniz</option>
                      {danisanlar.map((danisan) => (
                        <option key={danisan.id} value={danisan.id}>
                          {danisan.ad} {danisan.soyad}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Menü Türü
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={aiMenuForm.menuTuru}
                      onChange={(e) => setAiMenuForm({...aiMenuForm, menuTuru: e.target.value})}
                    >
                      <option value="">Menü türü seçiniz</option>
                      <option value="kilo_verme">Kilo Verme</option>
                      <option value="kilo_alma">Kilo Alma</option>
                      <option value="kilo_koruma">Kilo Koruma</option>
                      <option value="kas_yapimi">Kas Yapımı</option>
                      <option value="detoks">Detoks</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Menü Süresi
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={aiMenuForm.gunSayisi}
                      onChange={(e) => setAiMenuForm({...aiMenuForm, gunSayisi: e.target.value})}
                    >
                      <option value="">Süre seçiniz</option>
                      <option value="3">3 Gün</option>
                      <option value="7">1 Hafta</option>
                      <option value="14">2 Hafta</option>
                      <option value="30">1 Ay</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aktivite Seviyesi
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={aiMenuForm.aktiviteSeviyesi}
                      onChange={(e) => setAiMenuForm({...aiMenuForm, aktiviteSeviyesi: e.target.value})}
                    >
                      <option value="">Aktivite seviyesi</option>
                      <option value="sedanter">Sedanter (Masa başı)</option>
                      <option value="hafif_aktif">Hafif Aktif (Haftada 1-3 gün)</option>
                      <option value="orta_aktif">Orta Aktif (Haftada 3-5 gün)</option>
                      <option value="cok_aktif">Çok Aktif (Haftada 6-7 gün)</option>
                      <option value="extra_aktif">Ekstra Aktif (Günde 2 kez)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Özel Notlar & Tercihler
                    </label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Besin alerjileri, tercihleri, özel durumlar..."
                      value={aiMenuForm.ozelNotlar}
                      onChange={(e) => setAiMenuForm({...aiMenuForm, ozelNotlar: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                        aiMenuLoading 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                      onClick={handleAiMenuSubmit}
                      disabled={aiMenuLoading}
                    >
                      {aiMenuLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          AI Menü Oluşturuluyor...
                        </span>
                      ) : (
                        '🤖 AI ile Menü Oluştur'
                      )}
                    </button>
                    <button 
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      onClick={clearAiMenuForm}
                    >
                      Temizle
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Oluşturulan Menüler */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Oluşturulan Menüler</h3>
              {generatedMenu ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-purple-800">
                          {generatedMenu.menu?.baslik || 'AI Menü'}
                        </h4>
                        <p className="text-sm text-purple-600">
                          {generatedMenu.menu?.toplam_gun ? `${generatedMenu.menu.toplam_gun} gün` : ''} • 
                          {generatedMenu.menu?.toplam_kalori_hedefi || ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handlePrintMenu}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          📄 Yazdır
                        </button>
                        <button 
                          onClick={handleShareMenu}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          📤 Paylaş
                        </button>
                      </div>
                    </div>
                    
                    {/* Menü Günleri */}
                    {generatedMenu.menu?.gunler && generatedMenu.menu.gunler.length > 0 ? (
                      <div className="space-y-3">
                        {(showFullMenu ? generatedMenu.menu.gunler : generatedMenu.menu.gunler.slice(0, 3)).map((gun: {
                          gun: number;
                          tarih: string;
                          gunluk_toplam_kalori: string;
                          su_tüketimi?: string;
                          besin_degerleri?: {
                            protein?: string;
                            karbonhidrat?: string;
                            yag?: string;
                          };
                          ogunler?: {
                            kahvalti?: { kalori: string; yemekler: string[]; tarif: string };
                            ogle?: { kalori: string; yemekler: string[]; tarif: string };
                            aksam?: { kalori: string; yemekler: string[]; tarif: string };
                            ara_ogun_1?: { kalori: string; yemekler: string[]; tarif: string };
                            ara_ogun_2?: { kalori: string; yemekler: string[]; tarif: string };
                          };
                        }, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium text-gray-800">
                                {gun.gun}. Gün ({new Date(gun.tarih).toLocaleDateString('tr-TR')})
                              </span>
                              <span className="text-sm font-semibold text-purple-600">
                                {gun.gunluk_toplam_kalori} kalori
                              </span>
                            </div>
                            
                            {/* Öğün Detayları */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              {gun.ogunler?.kahvalti && (
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                  <div className="font-medium text-yellow-800 mb-1">
                                    Kahvaltı: {gun.ogunler.kahvalti.kalori} kcal
                                  </div>
                                  <div className="text-yellow-700 text-xs">
                                    {gun.ogunler.kahvalti.yemekler?.join(', ')}
                                  </div>
                                  {gun.ogunler.kahvalti.tarif && (
                                    <div className="text-yellow-600 text-xs mt-1 italic">
                                      {gun.ogunler.kahvalti.tarif}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {gun.ogunler?.ogle && (
                                <div className="bg-green-50 p-3 rounded border border-green-200">
                                  <div className="font-medium text-green-800 mb-1">
                                    Öğle: {gun.ogunler.ogle.kalori} kcal
                                  </div>
                                  <div className="text-green-700 text-xs">
                                    {gun.ogunler.ogle.yemekler?.join(', ')}
                                  </div>
                                  {gun.ogunler.ogle.tarif && (
                                    <div className="text-green-600 text-xs mt-1 italic">
                                      {gun.ogunler.ogle.tarif}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {gun.ogunler?.aksam && (
                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                  <div className="font-medium text-blue-800 mb-1">
                                    Akşam: {gun.ogunler.aksam.kalori} kcal
                                  </div>
                                  <div className="text-blue-700 text-xs">
                                    {gun.ogunler.aksam.yemekler?.join(', ')}
                                  </div>
                                  {gun.ogunler.aksam.tarif && (
                                    <div className="text-blue-600 text-xs mt-1 italic">
                                      {gun.ogunler.aksam.tarif}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Ara Öğünler */}
                            {(gun.ogunler?.ara_ogun_1 || gun.ogunler?.ara_ogun_2) && (
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {gun.ogunler?.ara_ogun_1 && (
                                  <div className="bg-gray-50 p-2 rounded border">
                                    <span className="font-medium">Ara Öğün 1:</span> {gun.ogunler.ara_ogun_1.kalori} kcal
                                    <div className="text-gray-600">{gun.ogunler.ara_ogun_1.yemekler?.join(', ')}</div>
                                  </div>
                                )}
                                {gun.ogunler?.ara_ogun_2 && (
                                  <div className="bg-gray-50 p-2 rounded border">
                                    <span className="font-medium">Ara Öğün 2:</span> {gun.ogunler.ara_ogun_2.kalori} kcal
                                    <div className="text-gray-600">{gun.ogunler.ara_ogun_2.yemekler?.join(', ')}</div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Besin Değerleri */}
                            {gun.besin_degerleri && (
                              <div className="mt-3 flex gap-4 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                <span>Protein: {gun.besin_degerleri.protein}</span>
                                <span>Karbonhidrat: {gun.besin_degerleri.karbonhidrat}</span>
                                <span>Yağ: {gun.besin_degerleri.yag}</span>
                                <span>Su: {gun.su_tüketimi}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {!showFullMenu && generatedMenu.menu.gunler.length > 3 && (
                          <div className="text-center">
                            <button 
                              onClick={() => setShowFullMenu(true)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Tümünü Görüntüle ({generatedMenu.menu.gunler.length - 3} gün daha)
                            </button>
                          </div>
                        )}
                        
                        {showFullMenu && generatedMenu.menu.gunler.length > 3 && (
                          <div className="text-center">
                            <button 
                              onClick={() => setShowFullMenu(false)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Daha Az Göster
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-600 mb-2">Menü içeriği:</p>
                        <div className="bg-gray-50 rounded p-3 text-sm max-h-96 overflow-y-auto">
                          {generatedMenu.menu?.ham_metin ? (
                            <div className="whitespace-pre-wrap">
                              {generatedMenu.menu?.icerik || 'Menü detayları yükleniyor...'}
                            </div>
                          ) : (
                            <div>
                              {generatedMenu.menu?.icerik || 'Menü detayları yükleniyor...'}
                            </div>
                          )}
                        </div>
                        
                        {generatedMenu.menu?.aciklama && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                            💡 <strong>Bilgi:</strong> {generatedMenu.menu.aciklama}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Genel Öneriler */}
                    {generatedMenu.genel_oneriler && generatedMenu.genel_oneriler.length > 0 && (
                      <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                        <h5 className="font-medium text-green-800 mb-2">💡 Genel Öneriler</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          {generatedMenu.genel_oneriler.slice(0, 3).map((oneri: string, index: number) => (
                            <li key={index}>• {oneri}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Henüz oluşturulan menü bulunmuyor.</p>
                  <p className="text-sm">Yukarıdaki formu kullanarak ilk menünüzü oluşturun.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai-content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">AI İçerik Üreticisi</h2>
              <p className="text-gray-600 mb-6">
                AI desteği ile sosyal medya, blog yazıları ve e-posta bültenleri oluşturun.
              </p>
              
              {/* Content Generation Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İçerik Türü *
                    </label>
                    <select
                      value={aiContentForm.icerikTuru}
                      onChange={(e) => setAiContentForm({...aiContentForm, icerikTuru: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seçiniz</option>
                      <option value="instagram">Instagram Postu</option>
                      <option value="facebook">Facebook Postu</option>
                      <option value="twitter">X (Twitter) Postu</option>
                      <option value="blog">Blog Yazısı</option>
                      <option value="email">E-posta Bülteni</option>
                      <option value="story">Instagram Story</option>
                      <option value="linkedin">LinkedIn Postu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konu *
                    </label>
                    <input
                      type="text"
                      value={aiContentForm.konu}
                      onChange={(e) => setAiContentForm({...aiContentForm, konu: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Örn: Yaz ayında sağlıklı beslenme"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hedef Kitle *
                    </label>
                    <select
                      value={aiContentForm.hedefKitle}
                      onChange={(e) => setAiContentForm({...aiContentForm, hedefKitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seçiniz</option>
                      <option value="genelKitle">Genel Kitle</option>
                      <option value="kadinlar">Kadınlar</option>
                      <option value="erkekler">Erkekler</option>
                      <option value="gencler">Gençler (18-30 yaş)</option>
                      <option value="yaslılar">Yaşlılar (50+ yaş)</option>
                      <option value="sporcu">Sporcular</option>
                      <option value="hamile">Hamile Kadınlar</option>
                      <option value="cocuk">Çocuklar ve Aileler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yazım Tonu *
                    </label>
                    <select
                      value={aiContentForm.ton}
                      onChange={(e) => setAiContentForm({...aiContentForm, ton: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seçiniz</option>
                      <option value="profesyonel">Profesyonel</option>
                      <option value="dostane">Dostane</option>
                      <option value="motivasyonel">Motivasyonel</option>
                      <option value="eglenceli">Eğlenceli</option>
                      <option value="bilimsel">Bilimsel</option>
                      <option value="samimi">Samimi</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İçerik Uzunluğu
                    </label>
                    <select
                      value={aiContentForm.uzunluk}
                      onChange={(e) => setAiContentForm({...aiContentForm, uzunluk: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Otomatik</option>
                      <option value="kisa">Kısa</option>
                      <option value="orta">Orta</option>
                      <option value="uzun">Uzun</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Özel Notlar
                    </label>
                    <input
                      type="text"
                      value={aiContentForm.ozelNotlar}
                      onChange={(e) => setAiContentForm({...aiContentForm, ozelNotlar: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ek istekler, hashtag tercihleri vs."
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleAiContentSubmit}
                    disabled={aiContentLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {aiContentLoading ? 'Oluşturuluyor...' : 'İçerik Oluştur'}
                  </button>
                  <button
                    onClick={clearAiContentForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Temizle
                  </button>
                </div>
              </div>
            </div>
            
            {/* Generated Content Display */}
            {generatedContent && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Oluşturulan İçerik</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyContentToClipboard(generatedContent.icerik || '')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      📋 Kopyala
                    </button>
                    <button
                      onClick={() => {
                        const element = document.createElement('a');
                        const file = new Blob([generatedContent.icerik || ''], { type: 'text/plain' });
                        element.href = URL.createObjectURL(file);
                        element.download = `${generatedContent.icerik_turu}_${Date.now()}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                    >
                      💾 İndir
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Content Type Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {generatedContent.icerik_turu_tr}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {generatedContent.hedef_kitle_tr}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {generatedContent.ton_tr}
                    </span>
                  </div>
                  
                  {/* Main Content */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="whitespace-pre-wrap text-gray-900">
                      {generatedContent.icerik}
                    </div>
                  </div>
                  
                  {/* Hashtags */}
                  {generatedContent.hashtaglar && generatedContent.hashtaglar.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Önerilen Hashtaglar:</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.hashtaglar.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => copyContentToClipboard(tag)}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tips */}
                  {generatedContent.ipuclari && generatedContent.ipuclari.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">💡 Paylaşım İpuçları:</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {generatedContent.ipuclari.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {generatedContent.icerik?.length || 0}
                      </div>
                      <div className="text-gray-600">Karakter</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {generatedContent.icerik?.split(' ').length || 0}
                      </div>
                      <div className="text-gray-600">Kelime</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {generatedContent.hashtaglar ? generatedContent.hashtaglar.length : 0}
                      </div>
                      <div className="text-gray-600">Hashtag</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {generatedContent.okuma_suresi || '1-2 dk'}
                      </div>
                      <div className="text-gray-600">Okuma</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Empty State */}
            {!generatedContent && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Henüz oluşturulan içerik bulunmuyor.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Yukarıdaki formu kullanarak ilk içeriğinizi oluşturun.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'randevular' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Randevular</h2>
              <button
                onClick={() => setShowNewRandevuModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Yeni Randevu
              </button>
            </div>

            {/* Randevu Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                    <p className="text-lg font-bold text-gray-900">{randevular.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Beklemede</p>
                    <p className="text-lg font-bold text-gray-900">
                      {randevular.filter(r => r.durum === 'beklemede').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Bugün</p>
                    <p className="text-lg font-bold text-gray-900">
                      {randevular.filter(r => {
                        const today = new Date().toDateString();
                        const randevuDate = new Date(r.tarih).toDateString();
                        return today === randevuDate;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Bu Hafta</p>
                    <p className="text-lg font-bold text-gray-900">
                      {randevular.filter(r => {
                        const today = new Date();
                        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
                        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
                        const randevuDate = new Date(r.tarih);
                        return randevuDate >= weekStart && randevuDate <= weekEnd;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Randevu Tablosu */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Randevu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danışan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih & Saat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {randevular.length > 0 ? (
                    randevular.map((randevu) => (
                      <tr key={randevu.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {randevu.baslik}
                            </div>
                            {randevu.aciklama && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {randevu.aciklama}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {randevu.danisan ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {randevu.danisan.ad} {randevu.danisan.soyad}
                              </div>
                              <div className="text-sm text-gray-500">
                                {randevu.danisan.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Genel Randevu</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(randevu.tarih).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(randevu.tarih).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRandevuDurumBadge(randevu.durum)}`}>
                            {getRandevuDurumText(randevu.durum)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditRandevu(randevu)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRandevu(randevu.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Henüz randevu bulunmuyor.</p>
                        <p className="text-sm">Yeni randevu eklemek için yukarıdaki butonu kullanın.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* New Danışan Modal */}
      {showNewDanisanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Yeni Danışan Ekle</h3>
            <form onSubmit={handleNewDanisanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                  <input
                    type="text"
                    value={newDanisan.ad}
                    onChange={(e) => setNewDanisan({...newDanisan, ad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                  <input
                    type="text"
                    value={newDanisan.soyad}
                    onChange={(e) => setNewDanisan({...newDanisan, soyad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newDanisan.email}
                  onChange={(e) => setNewDanisan({...newDanisan, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={newDanisan.tel}
                    onChange={(e) => setNewDanisan({...newDanisan, tel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yaş</label>
                  <input
                    type="number"
                    value={newDanisan.yas}
                    onChange={(e) => setNewDanisan({...newDanisan, yas: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                  <select
                    value={newDanisan.cinsiyet}
                    onChange={(e) => setNewDanisan({...newDanisan, cinsiyet: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Boy (cm)</label>
                  <input
                    type="number"
                    value={newDanisan.boy}
                    onChange={(e) => setNewDanisan({...newDanisan, boy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kilo (kg)</label>
                  <input
                    type="number"
                    value={newDanisan.kilo}
                    onChange={(e) => setNewDanisan({...newDanisan, kilo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="70"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Kilo (kg)</label>
                <input
                  type="number"
                  value={newDanisan.hedefKilo}
                  onChange={(e) => setNewDanisan({...newDanisan, hedefKilo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="65"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sağlık Durumu</label>
                <textarea
                  value={newDanisan.saglikDurumu}
                  onChange={(e) => setNewDanisan({...newDanisan, saglikDurumu: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Herhangi bir sağlık sorunu, alerji vs."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hastalıklar</label>
                <textarea
                  value={newDanisan.hastaliklari}
                  onChange={(e) => setNewDanisan({...newDanisan, hastaliklari: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Kronik hastalıklar, ilaç kullanımı vs."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <textarea
                  value={newDanisan.notlar}
                  onChange={(e) => setNewDanisan({...newDanisan, notlar: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Ek notlar..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewDanisanModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danışan Detail Modal */}
      {showDanisanDetailModal && selectedDanisan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Danışan Detayları</h3>
              <button
                onClick={() => setShowDanisanDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Kişisel Bilgiler</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Ad Soyad:</span> {selectedDanisan.ad} {selectedDanisan.soyad}</p>
                    <p><span className="font-medium">Email:</span> {selectedDanisan.email}</p>
                    <p><span className="font-medium">Telefon:</span> {selectedDanisan.tel || 'Belirtilmemiş'}</p>
                    <p><span className="font-medium">Yaş:</span> {selectedDanisan.yas ? `${selectedDanisan.yas} yaş` : 'Belirtilmemiş'}</p>
                    <p><span className="font-medium">Cinsiyet:</span> {selectedDanisan.cinsiyet || 'Belirtilmemiş'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Fiziksel Bilgiler</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Boy:</span> {selectedDanisan.boy ? `${selectedDanisan.boy} cm` : 'Belirtilmemiş'}</p>
                    <p><span className="font-medium">Kilo:</span> {selectedDanisan.kilo ? `${selectedDanisan.kilo} kg` : 'Belirtilmemiş'}</p>
                    <p><span className="font-medium">Hedef Kilo:</span> {selectedDanisan.hedefKilo ? `${selectedDanisan.hedefKilo} kg` : 'Belirtilmemiş'}</p>
                    {selectedDanisan.boy && selectedDanisan.kilo && (
                      <p><span className="font-medium">BMI:</span> {(selectedDanisan.kilo / Math.pow(selectedDanisan.boy / 100, 2)).toFixed(1)}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedDanisan.saglikDurumu && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Sağlık Durumu</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedDanisan.saglikDurumu}</p>
                </div>
              )}
              
              {selectedDanisan.hastaliklari && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Hastalıklar</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedDanisan.hastaliklari}</p>
                </div>
              )}
              
              {selectedDanisan.notlar && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notlar</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedDanisan.notlar}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Kayıt Bilgileri</h4>
                <div className="text-sm text-gray-600">
                  <p>Son Güncellenme: {new Date(selectedDanisan.guncellemeTarihi).toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => {
                  setShowDanisanDetailModal(false);
                  openEditDanisan(selectedDanisan);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Düzenle
              </button>
              <button
                onClick={() => setShowDanisanDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Danışan Modal */}
      {showEditDanisanModal && selectedDanisan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Danışan Düzenle</h3>
            <form onSubmit={handleEditDanisanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                  <input
                    type="text"
                    value={editDanisan.ad}
                    onChange={(e) => setEditDanisan({...editDanisan, ad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                  <input
                    type="text"
                    value={editDanisan.soyad}
                    onChange={(e) => setEditDanisan({...editDanisan, soyad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editDanisan.email}
                  onChange={(e) => setEditDanisan({...editDanisan, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={editDanisan.tel}
                    onChange={(e) => setEditDanisan({...editDanisan, tel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yaş</label>
                  <input
                    type="number"
                    value={editDanisan.yas}
                    onChange={(e) => setEditDanisan({...editDanisan, yas: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                  <select
                    value={editDanisan.cinsiyet}
                    onChange={(e) => setEditDanisan({...editDanisan, cinsiyet: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Boy (cm)</label>
                  <input
                    type="number"
                    value={editDanisan.boy}
                    onChange={(e) => setEditDanisan({...editDanisan, boy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kilo (kg)</label>
                  <input
                    type="number"
                    value={editDanisan.kilo}
                    onChange={(e) => setEditDanisan({...editDanisan, kilo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Kilo (kg)</label>
                <input
                  type="number"
                  value={editDanisan.hedefKilo}
                  onChange={(e) => setEditDanisan({...editDanisan, hedefKilo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sağlık Durumu</label>
                <textarea
                  value={editDanisan.saglikDurumu}
                  onChange={(e) => setEditDanisan({...editDanisan, saglikDurumu: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hastalıklar</label>
                <textarea
                  value={editDanisan.hastaliklari}
                  onChange={(e) => setEditDanisan({...editDanisan, hastaliklari: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <textarea
                  value={editDanisan.notlar}
                  onChange={(e) => setEditDanisan({...editDanisan, notlar: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditDanisanModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Randevu Modal */}
      {showNewRandevuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Yeni Randevu Ekle</h3>
            <form onSubmit={handleNewRandevuSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Randevu Başlığı</label>
                <input
                  type="text"
                  value={newRandevu.baslik}
                  onChange={(e) => setNewRandevu({...newRandevu, baslik: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Beslenme Danışmanlığı"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danışan</label>
                <select
                  value={newRandevu.danisanId}
                  onChange={(e) => setNewRandevu({...newRandevu, danisanId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Genel Randevu (Danışan seçilmedi)</option>
                  {danisanlar.map((danisan) => (
                    <option key={danisan.id} value={danisan.id}>
                      {danisan.ad} {danisan.soyad} - {danisan.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                  <input
                    type="date"
                    value={newRandevu.tarih}
                    onChange={(e) => setNewRandevu({...newRandevu, tarih: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                  <input
                    type="time"
                    value={newRandevu.saat}
                    onChange={(e) => setNewRandevu({...newRandevu, saat: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={newRandevu.aciklama}
                  onChange={(e) => setNewRandevu({...newRandevu, aciklama: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Randevu detayları, özel notlar..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewRandevuModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Randevu Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Randevu Modal */}
      {showEditRandevuModal && selectedRandevu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Randevu Düzenle</h3>
            <form onSubmit={handleEditRandevuSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Randevu Başlığı</label>
                <input
                  type="text"
                  value={editRandevu.baslik}
                  onChange={(e) => setEditRandevu({...editRandevu, baslik: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danışan</label>
                <select
                  value={editRandevu.danisanId}
                  onChange={(e) => setEditRandevu({...editRandevu, danisanId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Genel Randevu (Danışan seçilmedi)</option>
                  {danisanlar.map((danisan) => (
                    <option key={danisan.id} value={danisan.id}>
                      {danisan.ad} {danisan.soyad} - {danisan.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                  <input
                    type="date"
                    value={editRandevu.tarih}
                    onChange={(e) => setEditRandevu({...editRandevu, tarih: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                  <input
                    type="time"
                    value={editRandevu.saat}
                    onChange={(e) => setEditRandevu({...editRandevu, saat: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={editRandevu.durum}
                  onChange={(e) => setEditRandevu({...editRandevu, durum: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beklemede">Beklemede</option>
                  <option value="onaylandi">Onaylandı</option>
                  <option value="tamamlandi">Tamamlandı</option>
                  <option value="iptal">İptal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={editRandevu.aciklama}
                  onChange={(e) => setEditRandevu({...editRandevu, aciklama: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditRandevuModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
