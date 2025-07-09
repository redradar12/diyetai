'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

export default function KayitPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    sifre: '',
    sifreTekrar: '',
    kosullar: false
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submit başladı', formData);
    
    // Loading durumunu kontrol et - double submit'i engelle
    if (loading) {
      console.log('Zaten loading durumunda, submit engellendi');
      return;
    }
    
    if (formData.sifre !== formData.sifreTekrar) {
      alert('Şifreler eşleşmiyor!');
      return;
    }

    if (!formData.kosullar) {
      alert('Kullanım şartlarını kabul etmelisiniz!');
      return;
    }

    if (formData.sifre.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    console.log('Validation geçti, API call başlıyor...');
    setLoading(true);
    
    try {
      console.log('Fetch API call yapılıyor...');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad: formData.ad,
          soyad: formData.soyad,
          email: formData.email,
          telefon: formData.telefon,
          sifre: formData.sifre
        }),
      });

      console.log('Response alındı:', response.status, response.statusText);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        alert('Hesap başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz.');
        // Form temizle
        setFormData({
          ad: '',
          soyad: '',
          email: '',
          telefon: '',
          sifre: '',
          sifreTekrar: '',
          kosullar: false
        });
        // Giriş sayfasına yönlendir
        window.location.href = '/giris';
      } else {
        alert(data.error || 'Hesap oluşturulurken bir hata oluştu!');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      console.log('API call tamamlandı, loading false yapılıyor');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hesap Oluşturun
            </h1>
            <p className="text-gray-600">
              DiyetAI&apos;ya ücretsiz katılın ve başlayın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" action="#">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-1">
                  Ad
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="ad"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="Adınız"
                    value={formData.ad}
                    onChange={(e) => setFormData({...formData, ad: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 mb-1">
                  Soyad
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="soyad"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="Soyadınız"
                    value={formData.soyad}
                    onChange={(e) => setFormData({...formData, soyad: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon (İsteğe bağlı)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  id="telefon"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="0555 123 45 67"
                  value={formData.telefon}
                  onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label htmlFor="sifre" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="sifre"
                  required
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="En az 6 karakter"
                  value={formData.sifre}
                  onChange={(e) => setFormData({...formData, sifre: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="sifreTekrar" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre Tekrarı
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  id="sifreTekrar"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Şifrenizi tekrar girin"
                  value={formData.sifreTekrar}
                  onChange={(e) => setFormData({...formData, sifreTekrar: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="kosullar"
                name="kosullar"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                checked={formData.kosullar}
                onChange={(e) => setFormData({...formData, kosullar: e.target.checked})}
              />
              <label htmlFor="kosullar" className="ml-2 block text-sm text-gray-700">
                <span 
                  className="text-green-600 hover:text-green-500 cursor-pointer underline"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('/kullanim-sartlari', '_blank');
                  }}
                >
                  Kullanım şartları
                </span>
                nı ve{' '}
                <span 
                  className="text-green-600 hover:text-green-500 cursor-pointer underline"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('/gizlilik-politikasi', '_blank');
                  }}
                >
                  gizlilik politikası
                </span>
                nı kabul ediyorum.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                console.log('Buton click olayı tetiklendi');
                if (loading) {
                  e.preventDefault();
                  console.log('Loading durumunda, click engellendi');
                }
              }}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Zaten hesabınız var mı?{' '}
              <Link href="/giris" className="text-green-600 hover:text-green-500 font-medium">
                Giriş yapın
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link 
              href="/"
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              ← Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
